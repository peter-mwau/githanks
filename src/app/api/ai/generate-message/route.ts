import { NextRequest, NextResponse } from 'next/server';
import { EnhancedContributor, APIResponse } from '@/lib/types';

interface MessageRequest {
  contributor: EnhancedContributor;
  repositoryName: string;
  style?: 'professional' | 'casual' | 'enthusiastic';
  includeStats?: boolean;
}

interface MessageResponse {
  message: string;
  tweetMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MessageRequest = await request.json();
    const { contributor, repositoryName, style = 'professional', includeStats = true } = body;

    if (!contributor || !repositoryName) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Missing required parameters: contributor and repositoryName',
      }, { status: 400 });
    }

    // For now, we'll create a template-based message generator
    // Later, this can be replaced with Google Gemini AI
    const message = generateThankYouMessage(contributor, repositoryName, style, includeStats);
    const tweetMessage = generateTweetMessage(contributor, repositoryName);

    return NextResponse.json<APIResponse<MessageResponse>>({
      success: true,
      data: {
        message,
        tweetMessage,
      },
    });

  } catch (error) {
    console.error('AI message generation error:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

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