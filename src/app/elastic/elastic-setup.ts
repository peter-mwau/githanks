// ...existing code...
import { client } from './elastic-client';
const INDEX_NAME = 'search-jmbj';
const MAPPING_DEFINITION = {
  properties: {
    login: { type: 'keyword' },
    bio: {
      type: 'text',
      fields: {
        suggest: { type: 'search_as_you_type' },
      },
    },
    name: { type: 'text' },
    profile_url: { type: 'keyword' },
  },
};

async function setupIndex() {
  try {
    // indices.exists can return a boolean or an object depending on client version
    const existsRaw = await client.indices.exists({ index: INDEX_NAME });
    let exists = false;
    if (typeof existsRaw === 'boolean') {
      exists = existsRaw;
    } else if (existsRaw && typeof existsRaw === 'object') {
      const asRecord = existsRaw as Record<string, unknown>;
      // defensive: check possible shapes
      exists = Boolean(asRecord.body ?? asRecord.result ?? true);
    }

    if (exists) {
      console.log(`Index '${INDEX_NAME}' already exists. Skipping creation.`);
      return;
    }

    // Create index using top-level `mappings` to satisfy @elastic/elasticsearch typings
         type IndicesCreateParams = Parameters<typeof client.indices.create>[0];
    const createParams = { index: INDEX_NAME, mappings: MAPPING_DEFINITION } as unknown as IndicesCreateParams;
    const createResponse = await client.indices.create(createParams);

    console.log(`Index created: ${INDEX_NAME}`);
    // Defensive logging: handle boolean/primitive or object shapes
    try {
      const raw = createResponse as unknown;
      if (typeof raw === "object" && raw !== null) {
        const rec = raw as Record<string, unknown>;
        if ("body" in rec) {
          console.log(rec.body);
        } else {
          console.log(rec);
        }
      } else {
        console.log(String(raw));
      }
    } catch {
      /* ignore stringify errors */
    }
  } catch (error) {
    console.error('Error setting up Elasticsearch index:', error);
  }
}

// Immediately invoke setup on module load
setupIndex().catch((err) => {
  console.error('Unexpected error during Elasticsearch index setup:', err);
});
