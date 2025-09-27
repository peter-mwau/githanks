
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://cd4c81c879a0450d8f73557509ba34d4.us-central1.gcp.cloud.es.io:443',
  auth: {
    apiKey: 'cENrV2pKa0JWc1BHNmtSSHI2Rm86SXRpbVBaMVZ0VHBIenNYY0cza2ZsQQ=='
  },
});

const index = 'gitthanks';
const mapping = {
  "text": {
    "type": "semantic_text"
  }
};

const updateMappingResponse = await client.indices.putMapping({
  index,
  properties: mapping,
});
console.log(updateMappingResponse);

export {client};