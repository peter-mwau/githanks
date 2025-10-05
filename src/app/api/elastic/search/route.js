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

    // console.log(`🔍 Searching Elasticsearch for: "${query}"`);

    // Check if index exists first
    try {
      const indexExists = await client.indices.exists({ index: INDEX_NAME });
      if (!indexExists) {
        console.log(`❌ Index "${INDEX_NAME}" does not exist`);
        return NextResponse.json({
          results: [],
          message: "Index not found. No contributors have been indexed yet."
        }, { status: 200 });
      }
    } catch (indexError) {
      console.error('❌ Error checking index existence:', indexError);
      return NextResponse.json({
        results: [],
        message: "Error connecting to Elasticsearch"
      }, { status: 200 });
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
              // 3. Match on location
              {
                match: {
                  'user_details.location': {
                    query: query,
                    fuzziness: 'AUTO',
                  },
                },
              },
              // 4. Match on company
              {
                match: {
                  'user_details.company': {
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

    console.log('📊 Raw Elasticsearch response:', JSON.stringify(searchResponse, null, 2));

    // Safely extract the source documents
    let results = [];

    // Check different possible response structures
    if (searchResponse.body && searchResponse.body.hits && searchResponse.body.hits.hits) {
      results = searchResponse.body.hits.hits.map(hit => hit._source);
    } else if (searchResponse.hits && searchResponse.hits.hits) {
      results = searchResponse.hits.hits.map(hit => hit._source);
    } else if (searchResponse.body) {
      // Try to parse the body directly
      const body = searchResponse.body;
      if (body.hits && body.hits.hits) {
        results = body.hits.hits.map(hit => hit._source);
      }
    }

    console.log(`✅ Found ${results.length} results for query: "${query}"`);

    return NextResponse.json({
      results,
      total: results.length,
      query
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Elasticsearch Search Error:', error);

    // More detailed error information
    if (error.meta && error.meta.body) {
      console.error('🔍 Elasticsearch error details:', error.meta.body);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during search.',
        error: error.message,
        results: []
      },
      { status: 500 }
    );
  }
}