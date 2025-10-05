// API Configuration
export const API_CONFIG = {
  github: {
    baseUrl: 'https://api.github.com',
    graphqlUrl: 'https://api.github.com/graphql',
    rateLimit: {
      requestsPerHour: 5000, // Authenticated requests
      requestsPerHourUnauthenticated: 60,
    },
  },
  pagination: {
    defaultPerPage: 30,
    maxPerPage: 100,
  },
  cache: {
    repositoryTTL: 300, // 5 minutes
    contributorsTTL: 600, // 10 minutes
    userDetailsTTL: 1800, // 30 minutes
  },
  ai: {
    maxMessageLength: 500,
    supportedStyles: ['professional', 'casual', 'enthusiastic'] as const,
    tweetMaxLength: 280,
  },
} as const;

// Environment validation
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'GITHUB_TOKEN',
  ];

  const optionalVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_KEY_FILE',
    'ELASTICSEARCH_CLOUD_ID',
    'ELASTICSEARCH_API_KEY',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
  ];

  const missingVars: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

// GitHub API utilities
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Clean the URL first - remove any duplicated parts or malformed sections
  let cleanUrl = url.trim();
  
  // Fix common URL duplication issues
  const duplicatedGithubMatch = cleanUrl.match(/github\.com\/([^\/]+)\/.*github\.com\/([^\/]+)\/([^\/]+)/);
  if (duplicatedGithubMatch) {
    cleanUrl = `https://github.com/${duplicatedGithubMatch[2]}/${duplicatedGithubMatch[3]}`;
  }
  
  // Remove any trailing .git or path segments that might be malformed
  cleanUrl = cleanUrl.replace(/\.git.*$/, '.git');
  
  // Support various GitHub URL formats
  const patterns = [
    // Standard HTTPS URLs
    /^https?:\/\/github\.com\/([^\/\s]+)\/([^\/\s]+?)(?:\.git)?(?:\/.*)?$/,
    // SSH URLs
    /^git@github\.com:([^\/\s]+)\/([^\/\s]+?)(?:\.git)?$/,
    // URLs without protocol
    /^github\.com\/([^\/\s]+)\/([^\/\s]+?)(?:\.git)?(?:\/.*)?$/,
    // Simple owner/repo format
    /^([^\/\s]+)\/([^\/\s]+?)(?:\.git)?$/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const [, owner, repo] = match;
      
      // Validate owner and repo names
      if (!owner || !repo || owner.includes('.') && owner.includes('github')) {
        continue;
      }
      
      const cleanOwner = owner.trim();
      const cleanRepo = repo.replace(/\.git$/, '').trim();
      
      // Basic validation for GitHub username/repo format
      if (cleanOwner && cleanRepo && 
          /^[a-zA-Z0-9._-]+$/.test(cleanOwner) && 
          /^[a-zA-Z0-9._-]+$/.test(cleanRepo)) {
        return {
          owner: cleanOwner,
          repo: cleanRepo,
        };
      }
    }
  }

  return null;
}

// Rate limiting utilities
export function createRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
    'X-RateLimit-Used': (5000 - remaining).toString(),
  };
}

// Error response utilities
export function createErrorResponse(message: string, status: number = 400) {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
}

// Success response utilities
export function createSuccessResponse<T>(data: T, pagination?: {
  page: number;
  per_page: number;
  total_count?: number;
  has_next: boolean;
}) {
  return {
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
}