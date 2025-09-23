import { NextRequest, NextResponse } from 'next/server';
import { githubGraphQL } from '@/lib/github-graphql';
import { APIResponse, EnhancedContributor, ContributorFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '50'), 100);
    const enhanced = searchParams.get('enhanced') === 'true';

    if (!owner || !repo) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Missing required parameters: owner and repo',
      }, { status: 400 });
    }
    

    // Validate GitHub token
    if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'GitHub token not configured',
      }, { status: 500 });
    }

    // Get filters from query params
    const filters: ContributorFilters = {
      minContributions: searchParams.get('min_contributions') ? 
        parseInt(searchParams.get('min_contributions')!) : undefined,
      maxContributions: searchParams.get('max_contributions') ? 
        parseInt(searchParams.get('max_contributions')!) : undefined,
      language: searchParams.get('language') || undefined,
      location: searchParams.get('location') || undefined,
      company: searchParams.get('company') || undefined,
      sortBy: (searchParams.get('sort_by') as 'contributions' | 'name' | 'recent_activity') || 'contributions',
      sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    // Fetch repository data with contributors using GraphQL
    const result = await githubGraphQL.getRepositoryWithContributors(owner, repo, perPage * page);

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: result.errors[0]?.message || 'Failed to fetch contributors',
      }, { status: 400 });
    }

    if (!result.data.repository) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Repository not found',
      }, { status: 404 });
    }

    const commits = result.data.repository.defaultBranchRef?.target.history.nodes || [];
    
    // Process commits to extract contributor data
    const contributorMap = new Map<string, EnhancedContributor>();

    commits.forEach(commit => {
      const author = commit.author?.user;
      if (!author) return;

      const login = author.login;
      if (!contributorMap.has(login)) {
        contributorMap.set(login, {
          login: author.login,
          id: 0, // Will be populated if we need REST API data
          avatar_url: author.avatarUrl,
          html_url: `https://github.com/${author.login}`,
          contributions: 0,
          type: 'User',
          user_details: {
            login: author.login,
            id: 0,
            avatar_url: author.avatarUrl,
            html_url: `https://github.com/${author.login}`,
            name: author.name,
            email: author.email,
            bio: author.bio,
            location: author.location,
            company: author.company,
            blog: author.websiteUrl,
            twitter_username: author.twitterUsername,
            public_repos: 0,
            followers: 0,
            following: 0,
            created_at: '',
            updated_at: '',
          },
          commit_count: 0,
          lines_added: 0,
          lines_deleted: 0,
          commits: [],
        });
      }

      const contributor = contributorMap.get(login)!;
      contributor.contributions++;
      contributor.commit_count++;
      contributor.lines_added = (contributor.lines_added || 0) + commit.additions;
      contributor.lines_deleted = (contributor.lines_deleted || 0) + commit.deletions;

      // Add commit to recent commits (keep max 5)
      if (contributor.commits!.length < 5) {
        contributor.commits!.push({
          sha: '',
          commit: {
            author: {
              name: author.name || author.login,
              email: author.email || '',
              date: commit.committedDate,
            },
            committer: {
              name: author.name || author.login,
              email: author.email || '',
              date: commit.committedDate,
            },
            message: commit.message,
          },
          author: null,
          committer: null,
          stats: {
            additions: commit.additions,
            deletions: commit.deletions,
            total: commit.additions + commit.deletions,
          },
        });
      }

      // Track first and last contributions
      if (!contributor.first_contribution || commit.committedDate < contributor.first_contribution) {
        contributor.first_contribution = commit.committedDate;
      }
      if (!contributor.last_contribution || commit.committedDate > contributor.last_contribution) {
        contributor.last_contribution = commit.committedDate;
      }
    });

    let contributors = Array.from(contributorMap.values());

    // Apply filters
    if (filters.minContributions) {
      contributors = contributors.filter(c => c.contributions >= filters.minContributions!);
    }
    if (filters.maxContributions) {
      contributors = contributors.filter(c => c.contributions <= filters.maxContributions!);
    }
    if (filters.location) {
      contributors = contributors.filter(c => 
        c.user_details?.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    if (filters.company) {
      contributors = contributors.filter(c => 
        c.user_details?.company?.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    // Sort contributors
    contributors.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'contributions':
          comparison = a.contributions - b.contributions;
          break;
        case 'name':
          comparison = (a.user_details?.name || a.login).localeCompare(b.user_details?.name || b.login);
          break;
        case 'recent_activity':
          const aDate = new Date(a.last_contribution || 0).getTime();
          const bDate = new Date(b.last_contribution || 0).getTime();
          comparison = aDate - bDate;
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const totalCount = contributors.length;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedContributors = contributors.slice(startIndex, endIndex);

    return NextResponse.json<APIResponse<EnhancedContributor[]>>({
      success: true,
      data: paginatedContributors,
      pagination: {
        page,
        per_page: perPage,
        total_count: totalCount,
        has_next: endIndex < totalCount,
      },
    });

  } catch (error) {
    console.error('Contributors API error:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}