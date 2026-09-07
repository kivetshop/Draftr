import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTION_VERSION = "2022-06-28";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
      console.error("Missing NOTION_API_KEY or NOTION_DATABASE_ID in environment variables.");
      return NextResponse.json(
        {
          error: "Server configuration error: NOTION_API_KEY or NOTION_DATABASE_ID is missing in your deployment environment variables.",
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    };

    // 1. Query the database to check for duplicate email
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          filter: { property: "Email", title: { equals: email } },
          page_size: 1,
        }),
      }
    );

    if (!queryRes.ok) {
      const err = await queryRes.json().catch(() => ({}));
      console.error("Notion query error:", err);
      const detail = err.message ? `: ${err.message}` : "";
      return NextResponse.json(
        { error: `Could not connect to Notion waitlist database${detail}. Make sure the database is shared with your integration.` },
        { status: 500 }
      );
    }

    const queryData = await queryRes.json();

    if (queryData.results && queryData.results.length > 0) {
      return NextResponse.json(
        { message: "You are already on our waitlist!" },
        { status: 200 }
      );
    }

    // 2. Insert new row into Notion database
    const createRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Email: {
            title: [{ text: { content: email } }],
          },
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      console.error("Notion create error:", err);
      const detail = err.message ? `: ${err.message}` : "";
      return NextResponse.json(
        { error: `Could not save your email to Notion${detail}.` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "You have been added to the waitlist!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist route error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Something went wrong: ${message}` },
      { status: 500 }
    );
  }
}