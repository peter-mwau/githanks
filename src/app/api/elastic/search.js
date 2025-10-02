// pages/api/search.js
import { client } from '../../lib/elastic-client'; // Import the established client

export default async function handler(req, res) {
  const { q: query } = req.query; // Search query from URL: /api/search?q=elastic-expert

  if (!query) {
    return res.status(400).json({ message: "Search query 'q' is required." });
  }

  try {
    const searchResponse = await client.search({
      index: INDEX_NAME, // Use your defined index
      body: {
        query: {
          // *** Hybrid Search Query (Real-Time) ***
          bool: {
            should: [
              // 1. Best Fields Match (Keyword Search) - Higher boost for names
              {
                multi_match: {
                  query: query,
                  fields: ['name^2', 'login'],
                  type: 'best_fields',
                },
              },
              // 2. Fuzzy Text Match (Semantic Search/Bio)
              {
                match: {
                  bio: {
                    query: query,
                    fuzziness: 'AUTO', // Allows for typos (excellent for real-time)
                  }
                }
              }
            ],
            minimum_should_match: 1, // Must match at least one clause
          },
        },
      },
    });

    // Extract the source documents and send back to the client
    const results = searchResponse.body.hits.hits.map(hit => hit._source);
    res.status(200).json({ results });

  } catch (error) {
    console.error('Elasticsearch Search Error:', error);
    res.status(500).json({ message: 'Error performing search.' });
  }
}