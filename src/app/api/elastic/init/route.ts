// app/api/elastic/init/route.js
import { client } from '../../../elastic/elastic-client';
import { NextResponse } from 'next/server';

const INDEX_NAME = 'search-jmbj';

export async function POST() {
  try {
    console.log(`🔄 Initializing Elasticsearch index: ${INDEX_NAME}`);
    
    // Check if index exists
    const indexExists = await client.indices.exists({ index: INDEX_NAME });
    
    if (indexExists) {
      console.log(`✅ Index "${INDEX_NAME}" already exists`);
      return NextResponse.json({ 
        success: true, 
        message: 'Index already exists',
        index: INDEX_NAME 
      });
    }

    console.log(`📝 Creating new index: ${INDEX_NAME}`);
    
    // Create index with proper mappings
        await client.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          login: { type: 'text' },
          name: { type: 'text' },
          bio: { type: 'text' },
          location: { type: 'text' },
          contributions: { type: 'integer' },
          lines_added: { type: 'integer' },
          avatar_url: { type: 'keyword' },
          user_details: {
            properties: {
              email: { type: 'keyword' },
              twitter_username: { type: 'keyword' },
              company: { type: 'text' },
              blog: { type: 'keyword' },
              public_repos: { type: 'integer' },
              followers: { type: 'integer' },
              following: { type: 'integer' },
              location: { type: 'text' },
              bio: { type: 'text' },
              created_at: { type: 'date' }
            }
          }
        }
      }
    });

    console.log(`✅ Successfully created index: ${INDEX_NAME}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Index created successfully',
      index: INDEX_NAME 
    });
    } catch (error) {
    console.error('❌ Index initialization error:', error);

    // Safely narrow unknown error to access properties without TypeScript errors
    const err = error as any;

    if (err?.meta?.body) {
      console.error('🔍 Elasticsearch error details:', err.meta.body);
    }

    const message =
      error instanceof Error ? error.message : err?.message ?? String(error);

    return NextResponse.json(
      {
        success: false,
        error: 'Initialization failed',
        message,
      },
      { status: 500 }
    );
  }
}