import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CONFIG_PATH = path.join(process.cwd(), "src", "config", "waitlist.json");

function getStoredDate(): string {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.targetDate) return parsed.targetDate;
    }
  } catch (err) {
    console.error("Error reading countdown config:", err);
  }
  // Default: 30 days from now
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

export async function GET() {
  const targetDate = getStoredDate();
  return NextResponse.json({ targetDate });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { targetDate } = body as { targetDate?: string };

    if (!targetDate) {
      return NextResponse.json({ error: "targetDate is required" }, { status: 400 });
    }

    const dateObj = new Date(targetDate);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ targetDate: dateObj.toISOString() }, null, 2), "utf-8");

    return NextResponse.json({ ok: true, targetDate: dateObj.toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update date";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}