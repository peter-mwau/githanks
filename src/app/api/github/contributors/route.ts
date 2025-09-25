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
    
    // Remove hard limits - allow unlimited fetching
    const maxPages = parseInt(searchParams.get('max_pages') || '0'); // 0 = unlimited
    const forceComplete = searchParams.get('force_complete') === 'true'; // Continue despite rate limits

    if (!owner || !repo) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Missing required parameters: owner and repo',
      }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'GitHub token not configured',
      }, { status: 500 });
    }

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
    let rateLimitHit = false;
    let totalFetched = 0;
    let retryCount = 0;
    let pagesFetched = 0;
    const maxRetries = 3;

    if (fetchAll) {
      console.log(`Starting to fetch ALL contributors for ${owner}/${repo} (unlimited pages)`);
      
      let currentPage = 1;
      let hasMore = true;
      const maxPerPage = 100;
      let consecutiveEmptyPages = 0;

      // Get repository info to estimate contributors
      try {
        const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
        console.log(`Repository: ${repoInfo.full_name}`);
        console.log(`- Stars: ${repoInfo.stargazers_count}`);
        console.log(`- Forks: ${repoInfo.forks_count}`);
        console.log(`- Size: ${repoInfo.size} KB`);
        
        // Estimate potential contributors (very rough)
        const estimatedContributors = Math.min(
          Math.max(repoInfo.stargazers_count * 0.1, repoInfo.forks_count * 2, 100),
          50000 // Reasonable upper bound
        );
        console.log(`Estimated contributors: ~${Math.round(estimatedContributors)}`);
      } catch (error) {
        console.warn('Could not fetch repository info:', error);
      }

      // Main fetching loop - no hard page limits!
      while (hasMore && consecutiveEmptyPages < 3) {
        try {
          console.log(`Fetching page ${currentPage}...`);
          
          const startTime = Date.now();
          const { data: contributors, headers } = await octokit.rest.repos.listContributors({
            owner,
            repo,
            per_page: maxPerPage,
            page: currentPage,
            anon: '1', // Include anonymous contributors
          });
          
          const fetchTime = Date.now() - startTime;
          console.log(`Page ${currentPage}: ${contributors.length} contributors (${fetchTime}ms)`);

          // Check rate limit headers
          const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
          const resetTime = parseInt(headers['x-ratelimit-reset'] || '0') * 1000;
          const now = Date.now();
          
          if (remaining < 10) {
            console.warn(`Rate limit low: ${remaining} requests remaining`);
            if (remaining < 5 && resetTime > now) {
              const waitTime = Math.min(resetTime - now, 60000); // Max 1 minute wait
              console.log(`Rate limit approaching, waiting ${Math.round(waitTime/1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }

          if (contributors.length === 0) {
            consecutiveEmptyPages++;
            console.log(`Empty page ${currentPage} (${consecutiveEmptyPages}/3 consecutive)`);
            
            if (consecutiveEmptyPages >= 3) {
              console.log('No more contributors found after 3 empty pages, stopping.');
              hasMore = false;
              break;
            }
            
            currentPage++;
            continue;
          } else {
            consecutiveEmptyPages = 0; // Reset counter
          }

          totalFetched += contributors.length;
          console.log(`Total contributors fetched so far: ${totalFetched}`);

          // Process contributors
          if (enhanced) {
            // Enhanced mode with smart batching
            const batchSize = Math.max(2, Math.min(5, Math.floor(remaining / 10))); // Adaptive batch size
            
            for (let i = 0; i < contributors.length; i += batchSize) {
              const batch = contributors.slice(i, i + batchSize);

const enhancedBatch = await Promise.allSettled(
  batch.map(async (contributor): Promise<EnhancedContributor> => {
    let userDetails = null;
    let lastContribution: string | undefined;
    
    if (contributor.login) {
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

        // Minimal commit fetching for performance
        const { data: commits } = await octokit.rest.repos.listCommits({
          owner,
          repo,
          author: contributor.login,
          per_page: 1, // Just get the most recent
        });

        if (commits.length > 0) {
          lastContribution = commits[0].commit.author?.date || commits[0].commit.committer?.date;
        }

      } catch (userError: any) {
        console.warn(`Failed to fetch details for ${contributor.login}:`, userError.message);
      }
    }

    return {
      login: contributor.login || 'unknown',
      id: contributor.id || 0,
      avatar_url: contributor.avatar_url || '',
      html_url: contributor.html_url || '',
      contributions: contributor.contributions || 0,
      type: (contributor.type === 'Bot' ? 'Bot' : 'User') as 'User' | 'Bot',
      user_details: userDetails || undefined,
      commit_count: contributor.contributions || 0,
      lines_added: (contributor.contributions || 0) * 15, // Rough estimate
      lines_deleted: (contributor.contributions || 0) * 3,  // Rough estimate
      commits: [], // Empty array since we're not fetching detailed commits in batch mode
      last_contribution: lastContribution,
    };
  })
);

              // Process batch results
              enhancedBatch.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                  allContributors.push(result.value);
                } else {
                  const contributor = batch[index];
                  allContributors.push({
                    login: contributor.login || 'unknown',
                    id: contributor.id || 0,
                    avatar_url: contributor.avatar_url || '',
                    html_url: contributor.html_url || '',
                    contributions: contributor.contributions || 0,
                    type: (contributor.type === 'Bot' ? 'Bot' : 'User') as 'User' | 'Bot',
                    user_details: undefined,
                    commit_count: contributor.contributions || 0,
                    lines_added: (contributor.contributions || 0) * 15,
                    lines_deleted: (contributor.contributions || 0) * 3,
                    commits: [],
                    last_contribution: undefined,
                  });
                }
              });

              // Adaptive delay based on rate limiting
              if (i + batchSize < contributors.length) {
                const delay = remaining < 100 ? 300 : (remaining < 500 ? 150 : 50);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            }
          } else {
            // Non-enhanced mode - much faster
            const basicContributors = contributors.map(contributor => ({
              login: contributor.login || 'unknown',
              id: contributor.id || 0,
              avatar_url: contributor.avatar_url || '',
              html_url: contributor.html_url || '',
              contributions: contributor.contributions || 0,
              type: (contributor.type === 'Bot' ? 'Bot' : 'User') as 'User' | 'Bot',
              user_details: undefined,
              commit_count: contributor.contributions || 0,
              lines_added: (contributor.contributions || 0) * 15, // Rough estimate
              lines_deleted: (contributor.contributions || 0) * 3,  // Rough estimate
              commits: [],
              last_contribution: undefined,
            }));

            allContributors.push(...basicContributors);
          }

          // Check if we got fewer results than requested (potential last page)
          if (contributors.length < maxPerPage) {
            console.log('Got fewer contributors than requested - might be last page.');
            // Don't stop immediately, check a few more pages
          }
          
          currentPage++;
          
          // Respect max pages if specified (but allow unlimited if maxPages = 0)
          if (maxPages > 0 && currentPage > maxPages) {
            console.log(`Reached max pages limit (${maxPages}), stopping.`);
            hasMore = false;
            break;
          }

          // Smart delay based on rate limits and mode
          if (hasMore) {
            const baseDelay = enhanced ? 200 : 50;
            const rateLimitDelay = remaining < 100 ? 200 : (remaining < 500 ? 100 : 0);
            const totalDelay = baseDelay + rateLimitDelay;
            
            if (totalDelay > 0) {
              await new Promise(resolve => setTimeout(resolve, totalDelay));
            }
          }

        } catch (apiError: any) {
          console.error(`Error fetching page ${currentPage}:`, apiError.message);
          
          if (apiError.status === 403 || apiError.status === 429) {
            // Rate limit hit
            rateLimitHit = true;
            console.warn('Hit rate limit!');
            
            if (forceComplete) {
              // Try to wait and retry
              const resetTime = parseInt(apiError.response?.headers['x-ratelimit-reset'] || '0') * 1000;
              const now = Date.now();
              const waitTime = Math.min(Math.max(resetTime - now, 60000), 300000); // 1-5 minutes
              
              console.log(`Force complete enabled. Waiting ${Math.round(waitTime/1000)}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              
              retryCount++;
              if (retryCount < maxRetries) {
                console.log(`Retrying... (${retryCount}/${maxRetries})`);
                continue; // Don't increment page, retry same page
              }
            }
            
            console.warn('Rate limit exceeded, returning partial results');
            hasMore = false;
          } else if (apiError.status === 404) {
            console.error('Repository not found or not accessible');
            return NextResponse.json<APIResponse<null>>({
              success: false,
              error: 'Repository not found or not accessible',
            }, { status: 404 });
          } else {
            // Other error, retry once
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`API error, retrying... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
              continue;
            }
            throw apiError;
          }
        }
      }

      pagesFetched = currentPage - 1;

      const summary = `✅ Fetch complete!
📊 Total contributors: ${allContributors.length.toLocaleString()}
📄 Pages fetched: ${currentPage - 1}
⚠️  Rate limit hit: ${rateLimitHit ? 'Yes' : 'No'}
🔄 Retries: ${retryCount}`;

      console.log(summary);

    } else {
      pagesFetched = 1;
      try {
        const { data: contributors } = await octokit.rest.repos.listContributors({
          owner,
          repo,
          per_page: perPage,
          page,
        });

        totalFetched = contributors.length;


for (const contributor of contributors) {
  let userDetails = null;
  let linesAdded = 0;
  let linesDeleted = 0;
  const recentCommits: GitHubCommit[] = []; // Changed to const since we're building it
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

        // Build recent commits array
        recentCommits.push(...commits.slice(0, 5).map(commit => ({
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
        } as GitHubCommit)));

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
    commits: recentCommits, // Now properly used
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
          if (a.last_contribution && b.last_contribution) {
            comparison = new Date(a.last_contribution).getTime() - new Date(b.last_contribution).getTime();
          } else {
            comparison = a.contributions - b.contributions;
          }
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Return results
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
      meta: {
        total_fetched: totalFetched,
        rate_limit_hit: rateLimitHit,
        pages_fetched: pagesFetched,
        ...(rateLimitHit && { warning: 'Partial results due to API rate limits' })
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