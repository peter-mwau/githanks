import { Octokit } from '@octokit/rest';
import { GitHubRepository, GitHubContributor, GitHubCommit, EnhancedContributor, GitHubUser } from './types';

class GitHubAPI {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: 'GitThanks/1.0.0',
    });
  }

  // Get repository information
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return response.data as unknown as GitHubRepository;
    } catch (error) {
      console.error('Error fetching repository:', error);
      throw new Error(`Failed to fetch repository: ${owner}/${repo}`);
    }
  }

  // Get repository contributors
  async getContributors(
    owner: string,
    repo: string,
    page: number = 1,
    perPage: number = 100
  ): Promise<GitHubContributor[]> {
    try {
      const response = await this.octokit.rest.repos.listContributors({
        owner,
        repo,
        page,
        per_page: perPage,
      });
      return response.data as GitHubContributor[];
    } catch (error) {
      console.error('Error fetching contributors:', error);
      throw new Error(`Failed to fetch contributors for: ${owner}/${repo}`);
    }
  }

  // Get user details
  async getUserDetails(username: string): Promise<GitHubUser> {
    try {
      const response = await this.octokit.rest.users.getByUsername({
        username,
      });
      return response.data as GitHubUser;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw new Error(`Failed to fetch user details for: ${username}`);
    }
  }

  // Get repository commits by author
  async getCommitsByAuthor(
    owner: string,
    repo: string,
    author: string,
    page: number = 1,
    perPage: number = 100
  ): Promise<GitHubCommit[]> {
    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        author,
        page,
        per_page: perPage,
      });
      return response.data as GitHubCommit[];
    } catch (error) {
      console.error('Error fetching commits:', error);
      throw new Error(`Failed to fetch commits for author: ${author}`);
    }
  }

  // Get enhanced contributor data
  async getEnhancedContributor(
    owner: string,
    repo: string,
    contributor: GitHubContributor
  ): Promise<EnhancedContributor> {
    try {
      // Get user details
      const userDetails = await this.getUserDetails(contributor.login);
      
      // Get commits by this contributor
      const commits = await this.getCommitsByAuthor(owner, repo, contributor.login, 1, 10);
      
      // Calculate additional stats
      let linesAdded = 0;
      let linesDeleted = 0;
      let firstContribution: string | undefined;
      let lastContribution: string | undefined;

      if (commits.length > 0) {
        // Sort commits by date
        const sortedCommits = commits.sort((a, b) => 
          new Date(a.commit.author.date).getTime() - new Date(b.commit.author.date).getTime()
        );
        
        firstContribution = sortedCommits[0].commit.author.date;
        lastContribution = sortedCommits[sortedCommits.length - 1].commit.author.date;

        // Sum up lines (if stats are available)
        commits.forEach(commit => {
          if (commit.stats) {
            linesAdded += commit.stats.additions;
            linesDeleted += commit.stats.deletions;
          }
        });
      }

      return {
        ...contributor,
        user_details: userDetails,
        commit_count: commits.length,
        lines_added: linesAdded,
        lines_deleted: linesDeleted,
        first_contribution: firstContribution,
        last_contribution: lastContribution,
        commits: commits.slice(0, 5), // Keep only recent 5 commits
      };
    } catch (error) {
      console.error('Error enhancing contributor data:', error);
      // Return basic contributor data if enhancement fails
      return contributor;
    }
  }

  // Get repository languages
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const response = await this.octokit.rest.repos.listLanguages({
        owner,
        repo,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repository languages:', error);
      throw new Error(`Failed to fetch languages for: ${owner}/${repo}`);
    }
  }

  // Search repositories
  async searchRepositories(query: string, page: number = 1, perPage: number = 30) {
    try {
      const response = await this.octokit.rest.search.repos({
        q: query,
        page,
        per_page: perPage,
        sort: 'stars',
        order: 'desc',
      });
      return response.data;
    } catch (error) {
      console.error('Error searching repositories:', error);
      throw new Error(`Failed to search repositories with query: ${query}`);
    }
  }

  // Check rate limit
  async getRateLimit() {
    try {
      const response = await this.octokit.rest.rateLimit.get();
      return response.data;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      throw new Error('Failed to check rate limit');
    }
  }
}

// Singleton instance
export const githubAPI = new GitHubAPI();
export default GitHubAPI;