import { NextRequest, NextResponse } from "next/server";
import { client } from "../../../elastic/elastic-client";

const INDEX_NAME = "search-jmbj";

/**
 * Defensive helper to extract bulk items from different @elastic/elasticsearch response shapes.
 * Returns an array of item objects or an empty array.
 */

function isArrayOfRecords(v: unknown): v is Array<Record<string, unknown>> {
return Array.isArray(v) && (v as unknown[]).every(item => typeof item === "object" && item !== null);
}

function extractBulkItems(resp: unknown): Array<Record<string, unknown>> {
  if (!resp || typeof resp !== "object") return [];

  const asRecord = resp as Record<string, unknown>;

  // Case A: { body: { items: [...] } }
  if ("body" in asRecord && asRecord.body && typeof asRecord.body === "object") {
    const body = asRecord.body as Record<string, unknown>;
    const maybeItems = body["items"];
    if (isArrayOfRecords(maybeItems)) return maybeItems;
  }

  // Case B: { items: [...] }
  const topItems = asRecord["items"];
  if (isArrayOfRecords(topItems)) return topItems;

  return [];
}

export async function POST(request: NextRequest) {
  try {
    const raw = (await request.json()) as unknown;

    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json({ message: "Contributor data is missing or invalid." }, { status: 400 });
    }

    const contributorData = raw as Array<Record<string, unknown>>;

    // Build idempotent bulk update/upsert operations
    const operations: Array<Record<string, unknown>> = contributorData.flatMap((doc) => {
      const id = String(doc.id ?? `${String(doc.login ?? "unknown")}-${String(doc.id ?? "0")}`);
      return [
        { update: { _index: INDEX_NAME, _id: id } },
        { doc: { ...doc }, doc_as_upsert: true },
      ];
    });

    // Call bulk API (cast to unknown to accommodate client version typings)
    const bulkResponse = await client.bulk({ refresh: true, operations } as unknown as Record<string, unknown>);

    // Extract items defensively (supports multiple client response shapes)
    const items = extractBulkItems(bulkResponse);

    const itemErrors = items.filter((it) => {
      const firstAction = Object.values(it)[0];
      return !!(firstAction && (firstAction as Record<string, unknown>).error);
    });

    if (itemErrors.length > 0) {
      console.error("Bulk indexing item errors:", itemErrors.slice(0, 5));
      return NextResponse.json(
        {
          success: false,
          message: "Indexing completed with some errors.",
          errors: itemErrors.slice(0, 10),
        },
        { status: 207 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully indexed ${contributorData.length} documents.`,
        indexedCount: contributorData.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Elasticsearch indexing error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: "Internal server error during indexing.", error: message }, { status: 500 });
  }
}