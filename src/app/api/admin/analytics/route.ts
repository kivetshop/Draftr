import { NextResponse } from "next/server";
import { fetchAllDatabasePages } from "@/lib/notion";
import { aggregateAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
      return NextResponse.json({ error: "Missing Notion credentials." }, { status: 500 });
    }

    const pages = await fetchAllDatabasePages(databaseId, apiKey);
    const payload = aggregateAnalytics(pages);

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Analytics route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}