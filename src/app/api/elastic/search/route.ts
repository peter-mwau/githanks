import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/elastic/elastic-client";

const INDEX_NAME = "search-jmbj";

/* Minimal types describing the shapes we expect from Elasticsearch responses */
interface ElasticHit {
  _source?: Record<string, unknown>;
}
interface HitsWrapper {
  hits?: {
    hits?: ElasticHit[];
  };
}
type ElasticResponseShape = { body?: HitsWrapper } | HitsWrapper | { hits?: { hits?: ElasticHit[] } };

/* Type-safe helper to extract hits array from various client response shapes */
function extractHits(resp: unknown): ElasticHit[] {
  if (!resp || typeof resp !== "object") return [];

  const asRecord = resp as Record<string, unknown>;

  // Case A: { body: { hits: { hits: [...] } } }
  if ("body" in asRecord && asRecord.body && typeof asRecord.body === "object") {
    const body = asRecord.body as Record<string, unknown>;
    if ("hits" in body && body.hits && typeof body.hits === "object") {
      const hitsWrapper = body.hits as Record<string, unknown>;
      const arr = hitsWrapper["hits"];
      if (Array.isArray(arr)) return arr as ElasticHit[];
    }
  }

  // Case B: { hits: { hits: [...] } } (some client versions)
  if ("hits" in asRecord && asRecord.hits && typeof asRecord.hits === "object") {
    const hitsWrapper = asRecord.hits as Record<string, unknown>;
    const arr = hitsWrapper["hits"];
    if (Array.isArray(arr)) return arr as ElasticHit[];
  }

  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { message: "Search query 'q' is required.", results: [] },
        { status: 400 }
      );
    }

    // Check index existence (client may return boolean or object)
    try {
      const existsRaw = await client.indices.exists({ index: INDEX_NAME });
      let exists = false;
      if (typeof existsRaw === "boolean") {
        exists = existsRaw;
      } else if (existsRaw && typeof existsRaw === "object") {
        exists = Boolean((existsRaw as Record<string, unknown>)?.body ?? (existsRaw as Record<string, unknown>)?.result ?? true);
      }

      if (!exists) {
        return NextResponse.json(
          {
            results: [],
            total: 0,
            query,
            message: "Index not found. No contributors have been indexed yet.",
          },
          { status: 200 }
        );
      }
    } catch (indexErr: unknown) {
      console.error("❌ Error checking index existence:", indexErr);
      return NextResponse.json(
        {
          results: [],
          total: 0,
          query,
          message: "Error connecting to Elasticsearch",
        },
        { status: 200 }
      );
    }

    // Execute search
    const searchResponse = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query,
                  fields: ["name^2", "login"],
                  type: "best_fields",
                },
              },
              {
                match: {
                  bio: {
                    query,
                    fuzziness: "AUTO",
                  },
                },
              },
              {
                match: {
                  "user_details.location": {
                    query,
                    fuzziness: "AUTO",
                  },
                },
              },
              {
                match: {
                  "user_details.company": {
                    query,
                    fuzziness: "AUTO",
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
    } as unknown as Record<string, unknown>); // keep call flexible across client versions

    // Debug - can be toggled off in production
    try {

      console.debug("📊 Raw Elasticsearch response:", JSON.stringify(searchResponse, null, 2));
    } catch {
      /* ignore stringify errors */
    }

    const hits = extractHits(searchResponse as ElasticResponseShape);
    const results = hits
     .map((h) => h._source)
     .filter((r): r is Record<string, unknown> => r != null);

    return NextResponse.json(
      {
        results,
        total: results.length,
        query,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // safe error handling
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Elasticsearch Search Error:", error);
    // Provide limited internal detail but keep a stable JSON response shape
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during search.",
        error: message,
        results: [],
      },
      { status: 500 }
    );
  }
}