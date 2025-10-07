import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

// Prefer non-public env names for secrets; fallback to NEXT_PUBLIC_* only if set.
const ELASTIC_NODE = process.env.ELASTIC_NODE ?? process.env.NEXT_PUBLIC_ELASTIC_NODE;
const ELASTIC_API_KEY = process.env.ELASTIC_API_KEY ?? process.env.NEXT_PUBLIC_ELASTIC_API_KEY;

// Fail early with a clear error so TS knows node/apiKey are strings
if (!ELASTIC_NODE) {
  throw new Error("Missing ELASTIC_NODE environment variable");
}
if (!ELASTIC_API_KEY) {
  throw new Error("Missing ELASTIC_API_KEY environment variable");
}

const client = new Client({
  node: ELASTIC_NODE,
  auth: {
    apiKey: ELASTIC_API_KEY,
  },
});

export { client };
