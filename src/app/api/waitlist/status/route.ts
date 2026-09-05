import { NextResponse } from "next/server";
import { updatePageStatus } from "@/lib/notion";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Notion credentials." }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { pageId, status } = body as { pageId?: string; status?: string };

    if (!pageId || typeof pageId !== "string") {
      return NextResponse.json({ error: "pageId is required." }, { status: 400 });
    }

    const allowed = ["Active", "Pending", "Unsubscribed"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    await updatePageStatus(pageId, status, apiKey);
    return NextResponse.json({ ok: true, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Status update error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}