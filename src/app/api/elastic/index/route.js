import { client } from '../../../elastic/elastic-client'; // Import client from your utility
import { NextResponse } from 'next/server'; // Import modern response object

const INDEX_NAME = 'git_contributors_v1';

// Export the POST handler
export async function POST(request) {
  try {
    // 1. Get the raw contributor data from the request body
    const contributorData = await request.json(); 

    if (!Array.isArray(contributorData) || contributorData.length === 0) {
      return NextResponse.json(
        { message: 'Contributor data is missing or invalid.' },
        { status: 400 }
      );
    }

    // 2. Indexing Logic (The core of your indexData function)
    const operations = contributorData.flatMap(doc => [
      { index: { _index: INDEX_NAME } },
      doc // The JSON object for one contributor
    ]);

    // refresh: true makes the indexed data immediately available for searching
    const bulkResponse = await client.bulk({ refresh: true, operations });

    if (bulkResponse.body.errors) {
      console.error('Bulk indexing errors:', bulkResponse.body.errors);
      return NextResponse.json(
        { success: false, message: 'Indexing failed in part.' },
        { status: 500 }
      );
    }

    // 3. Success response
    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully indexed ${contributorData.length} documents.`,
        indexedCount: contributorData.length 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Elasticsearch indexing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during indexing.' },
      { status: 500 }
    );
  }
}