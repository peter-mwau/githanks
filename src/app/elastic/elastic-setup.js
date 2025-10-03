// A separate setup script (e.g., setup-elastic.js)
import { client } from './elastic-client.js'; 
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
          type: 'search_as_you_type' // Great for real-time autocompletiona
        }
      }
    },
    name: {
      type: 'text'
    },
    // 3. Other fields you want to store (e.g., profile URL)
    profile_url: {
      type: 'keyword'
    }
  }
};


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
      body: { mappings: MAPPING_DEFINITION },
    });

    console.log(`Index created: ${INDEX_NAME}`);
    console.log(createResponse.body);

  } catch (error) {
    console.error("Error setting up index:", error);
  }
}

// Call this function manually or as a post-build script
setupIndex();

