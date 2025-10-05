import { NextRequest, NextResponse } from 'next/server';
import { EnhancedContributor, APIResponse } from '@/lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface MessageRequest {
  contributor?: EnhancedContributor;
  repositoryName: string;
  style?: 'professional' | 'casual' | 'enthusiastic' | 'ai-generated';
  includeStats?: boolean;
  contributors?: EnhancedContributor[]; // For bulk operations
  filterCriteria?: {
    location?: string;
    minContributions?: number;
    maxContributions?: number;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sendMessages?: boolean; // Whether to send messages directly
  tweetOptions?: {  // Add this
    includeNonTwitterUsers?: boolean;
    tweetStyle?: 'simple' | 'detailed' | 'enthusiastic';
  };
}

interface MessageResponse {
  message: string;
  tweetMessage?: string;
  contributor?: EnhancedContributor;
}

interface BulkMessageResponse {
  messages: MessageResponse[];
  tweetUrl?: string;
  sentCount: number;
  totalCount: number;
}

interface BulkMessageOptions {
  includeNonTwitterUsers?: boolean;
  tweetStyle?: 'simple' | 'detailed' | 'enthusiastic';
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// In your API route (/app/api/ai/generate-message/route.ts)

export async function POST(request: NextRequest) {
  try {
    const body: MessageRequest = await request.json();
    const { 
      contributor, 
      repositoryName, 
      style = 'professional', 
      includeStats = true,
      contributors,
      filterCriteria,
      sendMessages = false,
      tweetOptions = {}
    } = body;

    // Handle bulk message generation
    if (contributors && repositoryName) {
      const filteredContributors = filterCriteria 
        ? filterContributors(contributors, filterCriteria)
        : contributors;

      // Add validation for empty filtered list
      if (filteredContributors.length === 0) {
        return NextResponse.json<APIResponse<null>>({
          success: false,
          error: 'No contributors match the filter criteria',
        }, { status: 400 });
      }

      const bulkResponse = await generateBulkMessages(
        filteredContributors, 
        repositoryName, 
        style, 
        includeStats,
        sendMessages,
        tweetOptions
      );

      return NextResponse.json<APIResponse<BulkMessageResponse>>({
        success: true,
        data: bulkResponse,
      });
    }

    // Handle single contributor message generation
    if (contributor && repositoryName) {
      const message = style === 'ai-generated' 
        ? await generateAIMessage(contributor, repositoryName, includeStats)
        : generateThankYouMessage(contributor, repositoryName, style, includeStats);
      
      const tweetMessage = generateTweetMessage(contributor, repositoryName);

      const response: MessageResponse = {
        message,
        tweetMessage,
        contributor
      };

      if (sendMessages && contributor.user_details?.email) {
        await sendDirectMessage(contributor, message, repositoryName);
      }

      return NextResponse.json<APIResponse<MessageResponse>>({
        success: true,
        data: response,
      });
    }

    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Missing required parameters: either contributor or contributors array, and repositoryName',
    }, { status: 400 });

  } catch (error) {
    console.error('AI message generation error:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

// Generate AI-powered message using Gemini
async function generateAIMessage(
  contributor: EnhancedContributor,
  repositoryName: string,
  includeStats: boolean
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const stats = includeStats ? getContributorStats(contributor) : '';
    const recentWork = getRecentWorkDescription(contributor);

    const prompt = `
      Generate a personalized thank you message for an open source contributor with the following details:
      
      Contributor: ${contributor.user_details?.name || contributor.login}
      Repository: ${repositoryName}
      ${stats}
      ${recentWork}
      
      Please create a warm, authentic, and personalized thank you message that:
      1. Expresses genuine gratitude
      2. Mentions specific contributions if notable
      3. Encourages continued participation
      4. Is 2-3 paragraphs maximum
      5. Sounds human and not template-generated
      
      Message:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to template-based message
    return generateThankYouMessage(contributor, repositoryName, 'professional', includeStats);
  }
}

// Generate bulk messages for multiple contributors
async function generateBulkMessages(
  contributors: EnhancedContributor[],
  repositoryName: string,
  style: string,
  includeStats: boolean,
  sendMessages: boolean,
  tweetOptions: BulkMessageOptions = {}
): Promise<BulkMessageResponse> {
  const messages: MessageResponse[] = [];
  let sentCount = 0;

  for (const contributor of contributors) {
    const message = style === 'ai-generated'
      ? await generateAIMessage(contributor, repositoryName, includeStats)
      : generateThankYouMessage(contributor, repositoryName, style, includeStats);

    const tweetMessage = generateTweetMessage(contributor, repositoryName);

    const messageResponse: MessageResponse = {
      message,
      tweetMessage,
      contributor
    };

    messages.push(messageResponse);

    if (sendMessages && contributor.user_details?.email) {
      try {
        await sendDirectMessage(contributor, message, repositoryName);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send message to ${contributor.login}:`, error);
      }
    }
  }

  // Generate Twitter intent URL with options
  const tweetUrl = generateBulkTweetUrl(contributors, repositoryName, tweetOptions);

  return {
    messages,
    tweetUrl,
    sentCount,
    totalCount: contributors.length
  };
}

function filterContributors(
  contributors: EnhancedContributor[],
  criteria: MessageRequest['filterCriteria']
): EnhancedContributor[] {
  // If no criteria provided, return original list
  if (!criteria) return contributors;

  const { location, minContributions, maxContributions, dateRange } = criteria;

  return contributors.filter((contributor) => {
    // Location filter
    if (location) {
      const contributorLocation = contributor.user_details?.location;
      if (!contributorLocation) return false;
      if (!contributorLocation.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }
    }

    // Min contributions
    if (typeof minContributions === "number") {
      if ((contributor.contributions ?? 0) < minContributions) return false;
    }

    // Max contributions
    if (typeof maxContributions === "number") {
      if ((contributor.contributions ?? 0) > maxContributions) return false;
    }

    // Date range (first_contribution)
    if (dateRange && contributor.first_contribution) {
      const firstContribution = new Date(contributor.first_contribution);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      if (isNaN(firstContribution.getTime())) return false;
      if (firstContribution < startDate || firstContribution > endDate) return false;
    }

    return true;
  });
}

// Generate Twitter intent URL for bulk mentions
function generateBulkTweetUrl(
  contributors: EnhancedContributor[], 
  repositoryName: string,
  options: BulkMessageOptions = {}
): string {
  const { includeNonTwitterUsers = false, tweetStyle = 'detailed' } = options;
  
  // Separate contributors with and without Twitter handles
  const contributorsWithTwitter = contributors.filter(contributor => 
    contributor.user_details?.twitter_username
  );
  
  const contributorsWithoutTwitter = includeNonTwitterUsers 
    ? contributors.filter(contributor => 
        !contributor.user_details?.twitter_username
      )
    : [];

  // Prioritize contributors with Twitter handles first, limit to 8 for safety
  const twitterMentions = contributorsWithTwitter
    .map(contributor => `@${contributor.user_details!.twitter_username!}`)
    .slice(0, 8);
  
  const githubMentions = includeNonTwitterUsers 
    ? contributorsWithoutTwitter
        .map(contributor => `@${contributor.login}`)
        .slice(0, 8 - twitterMentions.length) // Ensure total doesn't exceed 8
    : [];

  const allMentions = [...twitterMentions, ...githubMentions];
  
  if (allMentions.length === 0) {
    // If no mentions, just create a simple thank you tweet
    const simpleTweet = `🎉 Thank you to all contributors of ${repositoryName}! Your open source contributions are appreciated! #OpenSource #GitThanks`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(simpleTweet)}`;
  }

  // Calculate basic stats
  const totalContributions = contributors
    .slice(0, allMentions.length)
    .reduce((sum, contributor) => sum + contributor.contributions, 0);

  // Generate tweet text based on style (keeping it concise)
  let tweetText = '';
  
  switch (tweetStyle) {
    case 'simple':
      tweetText = `🙏 Thanks ${allMentions.join(' ')} for contributing to ${repositoryName}! ${totalContributions}+ commits! #OpenSource`;
      break;
    
    case 'enthusiastic':
      tweetText = `🎊 Amazing work ${allMentions.join(' ')}! ${totalContributions}+ commits to ${repositoryName} - you rock! 🚀 #GitThanks`;
      break;
    
    case 'detailed':
    default:
      // Keep it short and focused
      const mentionText = allMentions.join(' ');
      const statsText = totalContributions > 50 ? `${totalContributions}+ commits making a huge impact!` : 
                       totalContributions > 10 ? `${totalContributions}+ valuable commits!` : 
                       `${totalContributions} solid contributions!`;
      
      tweetText = `🎉 Huge thanks to ${mentionText} for your work on ${repositoryName}! ${statsText} #OpenSource #GitThanks`;
      break;
  }

  // Validate tweet length
  if (tweetText.length > 280) {
    // Fallback to simpler tweet if too long
    tweetText = `🎉 Thanks ${allMentions.slice(0, 3).join(' ')}${allMentions.length > 3 ? ' et al' : ''} for ${repositoryName}! ${totalContributions}+ commits! #OpenSource`;
  }

  // Final length check and encoding
  if (tweetText.length > 280) {
    // Ultimate fallback
    tweetText = `🙌 Thanks to ${allMentions.length} contributors of ${repositoryName}! #OpenSource #GitThanks`;
  }

  const encodedText = encodeURIComponent(tweetText);
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

// Send direct message to contributor (implementation depends on your email service)
async function sendDirectMessage(
  contributor: EnhancedContributor,
  message: string,
  repositoryName: string
): Promise<void> {
  // Implementation depends on your email service (SendGrid, AWS SES, etc.)
  // This is a placeholder implementation
  console.log(`Sending message to ${contributor.user_details?.email}:`, message);
  
  // Example with SendGrid (you'll need to install @sendgrid/mail)
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: contributor.user_details?.email,
    from: 'your-email@example.com',
    subject: `Thank you for your contributions to ${repositoryName}!`,
    text: message,
    html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
  };

  await sgMail.send(msg);
  */
}

// Helper function to get contributor stats for AI prompt
function getContributorStats(contributor: EnhancedContributor): string {
  const stats = [];
  
  if (contributor.contributions > 0) {
    stats.push(`${contributor.contributions} commits`);
  }
  
  if (contributor.lines_added) {
    stats.push(`${contributor.lines_added} lines of code added`);
  }
  
  if (contributor.commit_count) {
    stats.push(`${contributor.commit_count} total commits`);
  }
  
  if (contributor.first_contribution && contributor.last_contribution) {
    const firstDate = new Date(contributor.first_contribution).toLocaleDateString();
    const lastDate = new Date(contributor.last_contribution).toLocaleDateString();
    stats.push(`active from ${firstDate} to ${lastDate}`);
  }
  
  return stats.length > 0 ? `Contributions: ${stats.join(', ')}` : '';
}

// Helper function to get recent work description for AI prompt
function getRecentWorkDescription(contributor: EnhancedContributor): string {
  if (contributor.commits && contributor.commits.length > 0) {
    const recentCommit = contributor.commits[0];
    const commitMessage = recentCommit.commit.message.split('\n')[0];
    return `Recent work: "${commitMessage}"`;
  }
  return '';
}

// Keep your existing template-based functions
function generateThankYouMessage(
  contributor: EnhancedContributor,
  repositoryName: string,
  style: string,
  includeStats: boolean
): string {
   const name = contributor.user_details?.name || contributor.login;
  const contributions = contributor.contributions;
  const linesAdded = contributor.lines_added || 0;
  const commitCount = contributor.commit_count || contributions;
  
  let greeting = '';
  let appreciation = '';
  let statsText = '';
  let closing = '';

  // Style-based content generation
  switch (style) {
    case 'casual':
      greeting = `Hey ${name}! 👋`;
      appreciation = `Just wanted to drop by and say thanks for all your awesome contributions to ${repositoryName}! `;
      closing = `Keep being amazing! 🚀`;
      break;
    
    case 'enthusiastic':
      greeting = `🎉 ${name}! 🎉`;
      appreciation = `WOW! Your contributions to ${repositoryName} have been absolutely incredible! `;
      closing = `You're a rockstar contributor! 🌟 Thank you for making open source awesome! 🙌`;
      break;

       default: // professional
      greeting = `Dear ${name},`;
      appreciation = `I would like to express my sincere gratitude for your valuable contributions to ${repositoryName}. `;
      closing = `Thank you for your dedication to open source development.`;
  }

  // Stats section
  if (includeStats && (contributions > 0 || commitCount > 0)) {
    const statsItems = [];
    
    if (contributions > 0) {
      statsItems.push(`${contributions} commit${contributions !== 1 ? 's' : ''}`);
    }
    
    if (linesAdded > 0) {
      statsItems.push(`${linesAdded.toLocaleString()} lines of code added`);
    }
    
    if (contributor.first_contribution && contributor.last_contribution) {
      const firstDate = new Date(contributor.first_contribution).toLocaleDateString();
      const lastDate = new Date(contributor.last_contribution).toLocaleDateString();
      
      if (firstDate !== lastDate) {
        statsItems.push(`active from ${firstDate} to ${lastDate}`);
      } else {
        statsItems.push(`contributing since ${firstDate}`);
      }
    }

     if (statsItems.length > 0) {
      const statsString = statsItems.join(', ');
      statsText = style === 'casual' 
        ? `Your ${statsString} have made a real difference! ` 
        : style === 'enthusiastic'
        ? `Your amazing ${statsString} have transformed our project! `
        : `Your contributions include ${statsString}. `;
    }
  }

  // Recent work mention
  let recentWork = '';
  if (contributor.commits && contributor.commits.length > 0) {
    const recentCommit = contributor.commits[0];
    const commitMessage = recentCommit.commit.message.split('\n')[0]; // First line only
    
    if (commitMessage.length > 50) {
      const truncated = commitMessage.substring(0, 47) + '...';
      recentWork = style === 'casual'
        ? `Love your recent work on "${truncated}"! `
        : style === 'enthusiastic'
        ? `Your recent "${truncated}" commit was fantastic! `
        : `Your recent contribution "${truncated}" is particularly noteworthy. `;
    } else {
      recentWork = style === 'casual'
        ? `Love your recent work on "${commitMessage}"! `
        : style === 'enthusiastic'
        ? `Your recent "${commitMessage}" commit was fantastic! `
        : `Your recent contribution "${commitMessage}" is particularly noteworthy. `;
    }
  }
    return `${greeting}\n\n${appreciation}${statsText}${recentWork}\n\n${closing}`;
}

function generateTweetMessage(contributor: EnhancedContributor, repositoryName: string): string {
  const name = contributor.user_details?.name || contributor.login;
  const twitterHandle = contributor.user_details?.twitter_username 
    ? `@${contributor.user_details.twitter_username}` 
    : `@${contributor.login}`;
  
  const contributions = contributor.contributions;
  const emoji = contributions > 50 ? '🏆' : contributions > 20 ? '🌟' : contributions > 10 ? '👏' : '🙏';
  
  return `${emoji} Huge thanks to ${twitterHandle} for contributing to ${repositoryName}! ${contributions} commits and counting! #OpenSource #GitThanks #Gratitude`;
}