// A separate setup script (e.g., setup-elastic.js)
import { client } from './elastic-client'; 
const INDEX_NAME = 'git_contributors_v1';
const MAPPING_DEFINITION = {
  properties: {
    // 1. Field for Keyword Search (Exact Match/Filtering)
    login: {
      type: 'keyword', // Perfect for usernames/IDs
    },
    // 2. Field for Hybrid/Semantic Text Search
    bio: {
      type: 'text', // Standard text analysis for relevance
      fields: {
        suggest: {
          type: 'search_as_you_type' // Great for real-time autocompletion
        }
      }
    },
    name: {
      type: 'text',
      boost: 1.5 // Optional: Give the name a slight boost in relevance
    },
    // 3. Other fields you want to store (e.g., profile URL)
    profile_url: {
      type: 'keyword'
    }
  }
};

// setup-elastic.js (continued)

async function setupIndex() {
  try {
    // 1. Check if index exists
    const exists = await client.indices.exists({ index: INDEX_NAME });

    if (exists.body) {
      console.log(`Index '${INDEX_NAME}' already exists. Skipping creation.`);
      return;
    }

    // 2. Create index with the defined mapping
    const createResponse = await client.indices.create({
      index: INDEX_NAME,
      body: MAPPING_DEFINITION,
    });

    console.log(`Index created: ${INDEX_NAME}`);
    console.log(createResponse.body);

  } catch (error) {
    console.error("Error setting up index:", error);
  }
}

// Call this function manually or as a post-build script
setupIndex();

// This can be part of your setup script or an API Route you trigger once.
async function indexData(contributorData) {
  const operations = contributorData.flatMap(doc => [
    { index: { _index: INDEX_NAME } },
    doc // The JSON object for one contributor
  ]);

  const bulkResponse = await client.bulk({ refresh: true, operations });

  if (bulkResponse.body.errors) {
    console.error('Bulk indexing errors:', bulkResponse.body.errors);
    // Log details of failed items for debugging
  } else {
    console.log(`Successfully indexed ${contributorData.length} documents.`);
  }
}

// This can be part of your setup script or an API Route you trigger once.
async function indexData(contributorData) {
  const operations = contributorData.flatMap(doc => [
    { index: { _index: INDEX_NAME } },
    doc // The JSON object for one contributor
  ]);

  const bulkResponse = await client.bulk({ refresh: true, operations });

  if (bulkResponse.body.errors) {
    console.error('Bulk indexing errors:', bulkResponse.body.errors);
    // Log details of failed items for debugging
  } else {
    console.log(`Successfully indexed ${contributorData.length} documents.`);
  }
}