import { client } from '../../../elastic/elastic-client'; // Import client from your utility
import { NextResponse } from 'next/server'; // Import modern response object

const INDEX_NAME = 'search-jmbj';

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
    const operations = contributorData.flatMap(doc => {
      const id = doc.id || `${doc.login || 'unknown'}-${doc.id || 0}`;
      return [
        { update: { _index: INDEX_NAME, _id: id } },
        { doc: { ...doc }, doc_as_upsert: true },
      ];
    });

    // refresh: true makes the indexed data immediately available for searching
    const bulkResponse = await client.bulk({ refresh: true, operations });

    // More robust error detection: inspect items for individual errors
    const items = bulkResponse.body?.items || [];
    const itemErrors = items.filter(it => {
      const action = Object.values(it)[0];
      return action && action.error;
    });

    if (itemErrors.length > 0) {
      console.error('Bulk indexing item errors:', itemErrors.slice(0, 5));
      return NextResponse.json(
        { success: false, message: 'Indexing completed with some errors.', errors: itemErrors.slice(0, 10) },
        { status: 207 }
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