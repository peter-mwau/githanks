
import { Client } from '@elastic/elasticsearch';

import dotenv from 'dotenv';
dotenv.config();

const elasticApiKey = process.env.ELASTIC_API_KEY;
const client = new Client({
  node: 'https://cd4c81c879a0450d8f73557509ba34d4.us-central1.gcp.cloud.es.io:443',
  auth: {
    apiKey: elasticApiKey,
  },
});

export {client};