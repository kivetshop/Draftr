// ─────────────────────────────────────────────────────────────────
// src/lib/notion.ts
// Low-level Notion REST helpers — no SDK, stable HTTP API v1
// ─────────────────────────────────────────────────────────────────

const NOTION_VERSION = "2022-06-28";
const BASE_URL = "https://api.notion.com/v1";

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

// ── Property extractors (safely handle missing/null props) ────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTitle(prop: any): string {
  return prop?.title?.[0]?.plain_text ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRichText(prop: any): string {
  return prop?.rich_text?.[0]?.plain_text ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSelect(prop: any): string {
  return prop?.select?.name ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNumber(prop: any): number {
  return typeof prop?.number === "number" ? prop.number : 0;
}

// "Joined At" is a Created-time property type in Notion.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCreatedTimeProp(prop: any, fallback: string): string {
  return prop?.created_time ?? fallback;
}

// ── Paginated database query ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAllDatabasePages(databaseId: string, apiKey: string): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`${BASE_URL}/databases/${databaseId}/query`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Notion query error: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    results.push(...(data.results ?? []));
    hasMore = data.has_more ?? false;
    cursor = data.next_cursor ?? undefined;
  }

  return results;
}

// ── Page status update ────────────────────────────────────────────

export async function updatePageStatus(pageId: string, status: string, apiKey: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/pages/${pageId}`, {
    method: "PATCH",
    headers: headers(apiKey),
    body: JSON.stringify({
      properties: {
        Status: { select: { name: status } },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Notion update error: ${JSON.stringify(err)}`);
  }
}