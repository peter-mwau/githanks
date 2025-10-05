import { GitHubGraphQLResponse, RepositoryGraphQL } from './types';

class GitHubGraphQL {
  private endpoint = 'https://api.github.com/graphql';
  private token: string;

  constructor() {
    this.token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
    if (!this.token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<GitHubGraphQLResponse<T>> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GitThanks/1.0.0',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as GitHubGraphQLResponse<T>;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw new Error('Failed to execute GraphQL query');
    }
  }

  // Get comprehensive repository data with contributors
  async getRepositoryWithContributors(owner: string, name: string, first: number = 100) {
    const query = `
      query GetRepositoryWithContributors($owner: String!, $name: String!, $first: Int!) {
        repository(owner: $owner, name: $name) {
          id
          name
          nameWithOwner
          description
          url
          stargazerCount
          forkCount
          watchers {
            totalCount
          }
          issues(states: OPEN) {
            totalCount
          }
          pullRequests(states: OPEN) {
            totalCount
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          defaultBranchRef {
            name
            target {
              ... on Commit {
                history(first: $first) {
                  totalCount
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                  nodes {
                    author {
                      user {
                        login
                        name
                        avatarUrl
                        email
                        location
                        company
                        bio
                        twitterUsername
                        websiteUrl
                      }
                    }
                    committedDate
                    message
                    additions
                    deletions
                    changedFiles
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query<RepositoryGraphQL>(query, { owner, name, first });
  }

  // Get contributor activity over time
  async getContributorActivity(owner: string, name: string, author: string, since?: string, until?: string) {
    const query = `
      query GetContributorActivity($owner: String!, $name: String!, $author: String!, $since: GitTimestamp, $until: GitTimestamp) {
        repository(owner: $owner, name: $name) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(author: {id: $author}, since: $since, until: $until) {
                  totalCount
                  nodes {
                    committedDate
                    message
                    additions
                    deletions
                    changedFiles
                    associatedPullRequests(first: 1) {
                      nodes {
                        number
                        title
                        state
                        mergedAt
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, { owner, name, author, since, until });
  }

  // Get repository statistics
  async getRepositoryStats(owner: string, name: string) {
    const query = `
      query GetRepositoryStats($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          stargazerCount
          forkCount
          watchers {
            totalCount
          }
          issues {
            totalCount
          }
          closedIssues: issues(states: CLOSED) {
            totalCount
          }
          pullRequests {
            totalCount
          }
          mergedPullRequests: pullRequests(states: MERGED) {
            totalCount
          }
          releases {
            totalCount
          }
          diskUsage
          createdAt
          updatedAt
          pushedAt
          primaryLanguage {
            name
            color
          }
          languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
            totalSize
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    `;

    return this.query(query, { owner, name });
  }

  // Search users with contribution data
  async searchContributors(query: string, first: number = 50) {
    const searchQuery = `
      query SearchContributors($query: String!, $first: Int!) {
        search(query: $query, type: USER, first: $first) {
          userCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ... on User {
              login
              name
              avatarUrl
              bio
              location
              company
              email
              twitterUsername
              websiteUrl
              followers {
                totalCount
              }
              following {
                totalCount
              }
              repositories {
                totalCount
              }
              contributionsCollection {
                totalCommitContributions
                totalIssueContributions
                totalPullRequestContributions
                totalPullRequestReviewContributions
              }
            }
          }
        }
      }
    `;

    return this.query(searchQuery, { query, first });
  }
}

// Singleton instance
export const githubGraphQL = new GitHubGraphQL();
export default GitHubGraphQL;