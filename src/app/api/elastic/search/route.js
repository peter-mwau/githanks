// File: ./app/api/elastic/search/route.js

import { client } from '../../../elastic/elastic-client';
import { NextResponse } from 'next/server';

const INDEX_NAME = 'search-jmbj';

// The GET handler is used for fetching data (searching)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q'); // Get the search term from ?q=

    if (!query) {
      return NextResponse.json(
        { message: "Search query 'q' is required." },
        { status: 400 }
      );
    }

    // --- Core Hybrid Search Query ---
    const searchResponse = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            should: [
              // 1. Multi-match on name and login (Keyword relevance)
              {
                multi_match: {
                  query: query,
                  fields: ['name^2', 'login'], // name gets a higher boost
                  type: 'best_fields',
                },
              },
              // 2. Fuzzy match on bio (Semantic/Typo tolerance)
              {
                match: {
                  bio: {
                    query: query,
                    fuzziness: 'AUTO',
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
    });

    // Extract the source documents
    const results = searchResponse.body.hits.hits.map(hit => hit._source);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error('Elasticsearch Search Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during search.' },
      { status: 500 }
    );
  }
}