// GitHub API Types
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: 'User' | 'Bot';
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  topics: string[];
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: GitHubUser | null;
  committer: GitHubUser | null;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// Enhanced Contributor with additional data
export interface EnhancedContributor extends GitHubContributor {
  user_details?: GitHubUser;
  commit_count?: number;
  lines_added?: number;
  lines_deleted?: number;
  first_contribution?: string;
  last_contribution?: string;
  languages_used?: string[];
  commits?: GitHubCommit[];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    per_page: number;
    total_count: number;
    has_next: boolean;
  };
  meta?: {
    warning?: string;
    total_fetched?: number;
    rate_limit_hit?: boolean;
    [key: string]: unknown; 
  };
}

export interface RankedContributor extends EnhancedContributor {
  rank: number;
}

// GraphQL Types for GitHub API
export interface GitHubGraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export interface GitHubUserGraphQL {
  login: string;
  name: string;
  avatarUrl: string;
  email?: string;
  location?: string;
  company?: string;
  bio?: string;
  twitterUsername?: string;
  websiteUrl?: string;
}

export interface RepositoryGraphQL {
  repository: {
    id: string;
    name: string;
    nameWithOwner: string;
    description: string;
    url: string;
    stargazerCount: number;
    forkCount: number;
    watchers: {
      totalCount: number;
    };
    issues: {
      totalCount: number;
    };
    pullRequests: {
      totalCount: number;
    };
    languages: {
      edges: Array<{
        size: number;
        node: {
          name: string;
          color: string;
        };
      }>;
    };
    defaultBranchRef?: {
      name: string;
      target: {
        history: {
          totalCount: number;
          nodes: Array<{
            author: {
              user: GitHubUserGraphQL;
            } | null;
            committedDate: string;
            message: string;
            additions: number;
            deletions: number;
            changedFiles: number;
          }>;
        };
      };
    };
  };
}

// Search and Filter Types
export interface ContributorFilters {
  minContributions?: number;
  maxContributions?: number;
  language?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  location?: string;
  company?: string;
  sortBy?: 'contributions' | 'name' | 'recent_activity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total_count: number;
  page: number;
  per_page: number;
  has_next: boolean;
}