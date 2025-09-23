import { EnhancedContributor, GitHubRepository } from './types';

export interface AnalyticsData {
  contributionsByLocation: Array<{ name: string; value: number }>;
  contributionsByTopContributors: Array<{ name: string; value: number }>;
  linesOfCodeByContributor: Array<{ name: string; value: number }>;
  languageDistribution: Array<{ name: string; value: number }>;
  activityOverTime: Array<{ name: string; value: number }>;
  contributorStats: {
    total: number;
    withLocation: number;
    avgContributions: number;
    totalLinesAdded: number;
    mostActiveContributor: string;
  };
  topCountries: Array<{ name: string; value: number; contributors: string[] }>;
  topCompanies: Array<{ name: string; value: number; contributors: string[] }>;
}

export function analyzeContributors(
  contributors: EnhancedContributor[],
  repository?: Partial<GitHubRepository>
): AnalyticsData {
  // Basic stats
  const total = contributors.length;
  const withLocation = contributors.filter(c => c.user_details?.location).length;
  const avgContributions = contributors.reduce((sum, c) => sum + c.contributions, 0) / total || 0;
  const totalLinesAdded = contributors.reduce((sum, c) => sum + (c.lines_added || 0), 0);
  const mostActiveContributor = contributors.reduce((prev, current) => 
    (current.contributions > prev.contributions) ? current : prev, contributors[0]
  )?.login || 'N/A';

  // Contributions by location
  const locationMap = new Map<string, number>();
  contributors.forEach(contributor => {
    const location = contributor.user_details?.location;
    if (location) {
      // Extract country/region from location (simple parsing)
      const cleanLocation = parseLocation(location);
      locationMap.set(cleanLocation, (locationMap.get(cleanLocation) || 0) + contributor.contributions);
    }
  });

  const contributionsByLocation = Array.from(locationMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Top contributors
  const contributionsByTopContributors = contributors
    .slice(0, 10)
    .map(c => ({
      name: c.user_details?.name || c.login,
      value: c.contributions
    }));

  // Lines of code by contributor
  const linesOfCodeByContributor = contributors
    .filter(c => c.lines_added && c.lines_added > 0)
    .slice(0, 10)
    .map(c => ({
      name: c.user_details?.name || c.login,
      value: c.lines_added || 0
    }));

  // Language distribution (mock data - would need language analysis)
  const languageDistribution = [
    { name: repository?.language || 'JavaScript', value: 60 },
    { name: 'TypeScript', value: 25 },
    { name: 'CSS', value: 10 },
    { name: 'Other', value: 5 }
  ];

  // Activity over time (mock data - would need commit date analysis)
  const activityOverTime = generateMockActivityData();

  // Top countries analysis
  const countryMap = new Map<string, { count: number; contributors: string[] }>();
  contributors.forEach(contributor => {
    const location = contributor.user_details?.location;
    if (location) {
      const country = extractCountry(location);
      if (!countryMap.has(country)) {
        countryMap.set(country, { count: 0, contributors: [] });
      }
      const countryData = countryMap.get(country)!;
      countryData.count += contributor.contributions;
      countryData.contributors.push(contributor.user_details?.name || contributor.login);
    }
  });

  const topCountries = Array.from(countryMap.entries())
    .map(([name, data]) => ({ name, value: data.count, contributors: data.contributors.slice(0, 5) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Top companies analysis
  const companyMap = new Map<string, { count: number; contributors: string[] }>();
  contributors.forEach(contributor => {
    const company = contributor.user_details?.company;
    if (company) {
      const cleanCompany = company.replace(/^@/, '').trim();
      if (!companyMap.has(cleanCompany)) {
        companyMap.set(cleanCompany, { count: 0, contributors: [] });
      }
      const companyData = companyMap.get(cleanCompany)!;
      companyData.count += contributor.contributions;
      companyData.contributors.push(contributor.user_details?.name || contributor.login);
    }
  });

  const topCompanies = Array.from(companyMap.entries())
    .map(([name, data]) => ({ name, value: data.count, contributors: data.contributors.slice(0, 5) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    contributionsByLocation,
    contributionsByTopContributors,
    linesOfCodeByContributor,
    languageDistribution,
    activityOverTime,
    contributorStats: {
      total,
      withLocation,
      avgContributions,
      totalLinesAdded,
      mostActiveContributor,
    },
    topCountries,
    topCompanies,
  };
}

function parseLocation(location: string): string {
  // Simple location parsing - extract city/country
  const cleaned = location.trim();
  
  // Common patterns: "City, Country" or "City, State, Country"
  const parts = cleaned.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    return parts[parts.length - 1]; // Return last part (usually country)
  }
  
  return cleaned;
}

function extractCountry(location: string): string {
  // More sophisticated country extraction
  const countryMappings: Record<string, string> = {
    'USA': 'United States',
    'US': 'United States',
    'UK': 'United Kingdom',
    'UAE': 'United Arab Emirates',
    'DE': 'Germany',
    'FR': 'France',
    'IN': 'India',
    'BR': 'Brazil',
    'CA': 'Canada',
    'AU': 'Australia',
    'JP': 'Japan',
    'CN': 'China',
    'RU': 'Russia',
  };

  const parts = location.split(',').map(part => part.trim());
  const lastPart = parts[parts.length - 1];
  
  return countryMappings[lastPart] || lastPart;
}

function generateMockActivityData(): Array<{ name: string; value: number }> {
  // Generate mock activity data for the last 12 months
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months.map(month => ({
    name: month,
    value: Math.floor(Math.random() * 100) + 20
  }));
}

export function generateContributorRankings(contributors: EnhancedContributor[]) {
  return {
    byContributions: [...contributors]
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 20)
      .map((contributor, index) => ({
        rank: index + 1,
        ...contributor
      })),
    
    byLinesAdded: [...contributors]
      .filter(c => c.lines_added && c.lines_added > 0)
      .sort((a, b) => (b.lines_added || 0) - (a.lines_added || 0))
      .slice(0, 20)
      .map((contributor, index) => ({
        rank: index + 1,
        ...contributor
      })),
    
    byRecentActivity: [...contributors]
      .filter(c => c.last_contribution)
      .sort((a, b) => {
        const dateA = new Date(a.last_contribution!).getTime();
        const dateB = new Date(b.last_contribution!).getTime();
        return dateB - dateA;
      })
      .slice(0, 20)
      .map((contributor, index) => ({
        rank: index + 1,
        ...contributor
      }))
  };
}