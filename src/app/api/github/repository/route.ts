import { NextRequest, NextResponse } from 'next/server';
import { githubGraphQL } from '@/lib/github-graphql';
import { APIResponse, GitHubRepository } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

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

    // Fetch repository data using GraphQL
    const result = await githubGraphQL.getRepositoryWithContributors(owner, repo);

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: result.errors[0]?.message || 'Failed to fetch repository data',
      }, { status: 400 });
    }

    if (!result.data.repository) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Repository not found',
      }, { status: 404 });
    }

    const repository = result.data.repository;

    // Transform GraphQL response to our repository format
    const repositoryData: Partial<GitHubRepository> = {
      name: repository.name,
      full_name: repository.nameWithOwner,
      description: repository.description,
      html_url: repository.url,
      stargazers_count: repository.stargazerCount,
      forks_count: repository.forkCount,
      watchers_count: repository.watchers.totalCount,
      open_issues_count: repository.issues.totalCount,
      default_branch: repository.defaultBranchRef?.name || 'main',
      language: repository.languages.edges[0]?.node.name || null,
    };

    return NextResponse.json<APIResponse<Partial<GitHubRepository>>>({
      success: true,
      data: repositoryData,
    });

  } catch (error) {
    console.error('Repository API error:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repositoryUrl } = body;

    if (!repositoryUrl) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Repository URL is required',
      }, { status: 400 });
    }

    // Parse GitHub URL
    const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Invalid GitHub repository URL',
      }, { status: 400 });
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, ''); // Remove .git suffix if present

    // Redirect to GET endpoint
    const url = new URL('/api/github/repository', request.url);
    url.searchParams.set('owner', owner);
    url.searchParams.set('repo', cleanRepo);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Repository POST API error:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}