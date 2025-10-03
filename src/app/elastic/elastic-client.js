
import { Client } from '@elastic/elasticsearch';

import dotenv from 'dotenv';
dotenv.config();

const elasticApiKey = process.env.NEXT_PUBLIC_ELASTIC_API_KEY;
const client = new Client({
  node: process.env.NEXT_PUBLIC_ELASTIC_NODE,
  auth: {
    apiKey: elasticApiKey,
  },
});

export { client };