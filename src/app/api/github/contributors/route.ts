import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { APIResponse, EnhancedContributor, ContributorFilters, GitHubCommit } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '50'), 100);
    const enhanced = searchParams.get('enhanced') === 'true';
    const fetchAll = searchParams.get('fetch_all') === 'true';

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

    // Initialize Octokit for REST API
    const octokit = new Octokit({
      auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    });

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

    const allContributors: EnhancedContributor[] = [];

    if (fetchAll) {
      // Fetch ALL contributors using pagination
      let currentPage = 1;
      let hasMore = true;
      const maxPerPage = 100; // GitHub's maximum

      while (hasMore && currentPage <= 50) { // Limit to 50 pages (5000 contributors max for safety)
        try {
          const { data: contributors } = await octokit.rest.repos.listContributors({
            owner,
            repo,
            per_page: maxPerPage,
            page: currentPage,
          });

          if (contributors.length === 0) {
            hasMore = false;
            break;
          }

          // Convert to EnhancedContributor format and optionally fetch detailed stats
          const enhancedContributors: EnhancedContributor[] = [];

          for (const contributor of contributors) {
            let userDetails = null;
            let linesAdded = 0;
            let linesDeleted = 0;
            let recentCommits: GitHubCommit[] = [];
            let lastContribution: string | undefined;
            
            // Fetch detailed user information if enhanced mode
            if (enhanced && contributor.login) {
              try {
                const { data: user } = await octokit.rest.users.getByUsername({
                  username: contributor.login,
                });
                userDetails = {
                  login: user.login,
                  id: user.id,
                  avatar_url: user.avatar_url,
                  html_url: user.html_url,
                  name: user.name || null,
                  email: user.email || null,
                  bio: user.bio || null,
                  location: user.location || null,
                  company: user.company || null,
                  blog: user.blog || null,
                  twitter_username: user.twitter_username || null,
                  public_repos: user.public_repos,
                  followers: user.followers,
                  following: user.following,
                  created_at: user.created_at,
                  updated_at: user.updated_at,
                };

                // Fetch recent commits to estimate lines added/deleted
                try {
                  const { data: commits } = await octokit.rest.repos.listCommits({
                    owner,
                    repo,
                    author: contributor.login,
                    per_page: 10, // Get last 10 commits for estimation
                  });

                  // Set last contribution date from most recent commit
                  if (commits.length > 0) {
                    lastContribution = commits[0].commit.author?.date || commits[0].commit.committer?.date;
                  }

                  recentCommits = commits.slice(0, 5).map(commit => ({
                    sha: commit.sha,
                    commit: {
                      author: {
                        name: commit.commit.author?.name || '',
                        email: commit.commit.author?.email || '',
                        date: commit.commit.author?.date || '',
                      },
                      committer: {
                        name: commit.commit.committer?.name || '',
                        email: commit.commit.committer?.email || '',
                        date: commit.commit.committer?.date || '',
                      },
                      message: commit.commit.message,
                    },
                    author: commit.author,
                    committer: commit.committer,
                  } as GitHubCommit)); // Keep only 5 for the commits array

                  // Get detailed stats for recent commits
                  for (const commit of commits.slice(0, 5)) { // Process more commits for better stats
                    try {
                      const { data: commitDetails } = await octokit.rest.repos.getCommit({
                        owner,
                        repo,
                        ref: commit.sha,
                      });
                      
                      if (commitDetails.stats) {
                        linesAdded += commitDetails.stats.additions || 0;
                        linesDeleted += commitDetails.stats.deletions || 0;
                      }
                    } catch (commitError) {
                      // Skip if we can't get commit details
                      console.warn(`Failed to fetch commit details for ${commit.sha}:`, commitError);
                    }
                  }

                  // If we only got stats from a few commits, estimate total based on contribution ratio
                  if (commits.length < contributor.contributions) {
                    const ratio = contributor.contributions / Math.max(commits.length, 1);
                    linesAdded = Math.round(linesAdded * ratio);
                    linesDeleted = Math.round(linesDeleted * ratio);
                  }

                } catch (commitsError) {
                  console.warn(`Failed to fetch commits for ${contributor.login}:`, commitsError);
                }

              } catch (userError) {
                console.warn(`Failed to fetch user details for ${contributor.login}:`, userError);
              }
            }

            enhancedContributors.push({
              login: contributor.login || 'unknown',
              id: contributor.id || 0,
              avatar_url: contributor.avatar_url || '',
              html_url: contributor.html_url || '',
              contributions: contributor.contributions || 0,
              type: (contributor.type === 'Bot' ? 'Bot' : 'User') as 'User' | 'Bot',
              user_details: userDetails || undefined,
              commit_count: contributor.contributions || 0,
              lines_added: linesAdded,
              lines_deleted: linesDeleted,
              commits: recentCommits,
              last_contribution: lastContribution,
            });
          }

          allContributors.push(...enhancedContributors);
          
          // Check if we got fewer results than requested (last page)
          if (contributors.length < maxPerPage) {
            hasMore = false;
          } else {
            currentPage++;
          }

          // Add a small delay to avoid rate limiting
          if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (apiError: unknown) {
          console.error(`Error fetching page ${currentPage}:`, apiError);
          
          // If we hit rate limits, return what we have
          if (typeof apiError === 'object' && apiError !== null && 'status' in apiError) {
            const status = (apiError as { status?: number }).status;
            if (status === 403 || status === 429) {
              console.warn('Hit rate limit, returning partial results');
              hasMore = false;
            } else {
              throw apiError;
            }
          } else {
            throw apiError;
          }
        }
      }

      if (currentPage > 50) {
        console.warn('Stopped fetching at 50 pages (5000 contributors) to avoid timeout');
      }

    } else {
      // Regular paginated fetch (single page)
      try {
        const { data: contributors } = await octokit.rest.repos.listContributors({
          owner,
          repo,
          per_page: perPage,
          page,
        });

        for (const contributor of contributors) {
          let userDetails = null;
          let linesAdded = 0;
          let linesDeleted = 0;
          let recentCommits: GitHubCommit[] = [];
          let lastContribution: string | undefined;
          
          if (enhanced && contributor.login) {
            try {
              const { data: user } = await octokit.rest.users.getByUsername({
                username: contributor.login,
              });
              userDetails = {
                login: user.login,
                id: user.id,
                avatar_url: user.avatar_url,
                html_url: user.html_url,
                name: user.name || null,
                email: user.email || null,
                bio: user.bio || null,
                location: user.location || null,
                company: user.company || null,
                blog: user.blog || null,
                twitter_username: user.twitter_username || null,
                public_repos: user.public_repos,
                followers: user.followers,
                following: user.following,
                created_at: user.created_at,
                updated_at: user.updated_at,
              };

              // Fetch recent commits to estimate lines added/deleted
              try {
                const { data: commits } = await octokit.rest.repos.listCommits({
                  owner,
                  repo,
                  author: contributor.login,
                  per_page: 10, // Get last 10 commits for estimation
                });

                // Set last contribution date from most recent commit
                if (commits.length > 0) {
                  lastContribution = commits[0].commit.author?.date || commits[0].commit.committer?.date;
                }

                recentCommits = commits.slice(0, 5).map(commit => ({
                  sha: commit.sha,
                  commit: {
                    author: {
                      name: commit.commit.author?.name || '',
                      email: commit.commit.author?.email || '',
                      date: commit.commit.author?.date || '',
                    },
                    committer: {
                      name: commit.commit.committer?.name || '',
                      email: commit.commit.committer?.email || '',
                      date: commit.commit.committer?.date || '',
                    },
                    message: commit.commit.message,
                  },
                  author: commit.author,
                  committer: commit.committer,
                } as GitHubCommit));

                // Get detailed stats for recent commits
                for (const commit of commits.slice(0, 5)) {
                  try {
                    const { data: commitDetails } = await octokit.rest.repos.getCommit({
                      owner,
                      repo,
                      ref: commit.sha,
                    });
                    
                    if (commitDetails.stats) {
                      linesAdded += commitDetails.stats.additions || 0;
                      linesDeleted += commitDetails.stats.deletions || 0;
                    }
                  } catch (commitError) {
                    console.warn(`Failed to fetch commit details for ${commit.sha}:`, commitError);
                  }
                }

                // Estimate total based on contribution ratio
                if (commits.length < contributor.contributions) {
                  const ratio = contributor.contributions / Math.max(commits.length, 1);
                  linesAdded = Math.round(linesAdded * ratio);
                  linesDeleted = Math.round(linesDeleted * ratio);
                }

              } catch (commitsError) {
                console.warn(`Failed to fetch commits for ${contributor.login}:`, commitsError);
              }

            } catch (userError) {
              console.warn(`Failed to fetch user details for ${contributor.login}:`, userError);
            }
          }

          allContributors.push({
            login: contributor.login || 'unknown',
            id: contributor.id || 0,
            avatar_url: contributor.avatar_url || '',
            html_url: contributor.html_url || '',
            contributions: contributor.contributions || 0,
            type: (contributor.type === 'Bot' ? 'Bot' : 'User') as 'User' | 'Bot',
            user_details: userDetails || undefined,
            commit_count: contributor.contributions || 0,
            lines_added: linesAdded,
            lines_deleted: linesDeleted,
            commits: recentCommits,
            last_contribution: lastContribution,
          });
        }
      } catch (apiError) {
        console.error('Error fetching contributors:', apiError);
        throw apiError;
      }
    }

    // Apply filters
    let filteredContributors = [...allContributors];
    
    if (filters.minContributions) {
      filteredContributors = filteredContributors.filter(c => c.contributions >= filters.minContributions!);
    }
    if (filters.maxContributions) {
      filteredContributors = filteredContributors.filter(c => c.contributions <= filters.maxContributions!);
    }
    if (filters.location) {
      filteredContributors = filteredContributors.filter(c => 
        c.user_details?.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    if (filters.company) {
      filteredContributors = filteredContributors.filter(c => 
        c.user_details?.company?.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    // Sort contributors
    filteredContributors.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'contributions':
          comparison = a.contributions - b.contributions;
          break;
        case 'name':
          comparison = (a.user_details?.name || a.login).localeCompare(b.user_details?.name || b.login);
          break;
        case 'recent_activity':
          // For REST API, we don't have last_contribution, so use contributions as fallback
          comparison = a.contributions - b.contributions;
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // If fetchAll is true, return all filtered results, otherwise paginate
    let resultContributors: EnhancedContributor[];
    let totalCount: number;
    let hasNext: boolean;

    if (fetchAll) {
      resultContributors = filteredContributors;
      totalCount = filteredContributors.length;
      hasNext = false;
    } else {
      totalCount = filteredContributors.length;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      resultContributors = filteredContributors.slice(startIndex, endIndex);
      hasNext = endIndex < totalCount;
    }

    return NextResponse.json<APIResponse<EnhancedContributor[]>>({
      success: true,
      data: resultContributors,
      pagination: {
        page,
        per_page: perPage,
        total_count: totalCount,
        has_next: hasNext,
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