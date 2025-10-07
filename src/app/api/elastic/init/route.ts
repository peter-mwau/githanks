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
    } catch (error: unknown) {
  console.error('❌ Index initialization error:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return NextResponse.json({ 
    success: false, 
    error: 'Initialization failed',
    message: errorMessage 
  }, { status: 500 });
}
}