import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const BUNDLED_PATH = path.join(process.cwd(), "src", "config", "waitlist.json");
const TMP_PATH = path.join(os.tmpdir(), "draftr_waitlist.json");

// In-memory cache for serverless function warm execution
let memoryTargetDate: string | null = null;

function getStoredDate(): string {
  // 1. In-memory cache
  if (memoryTargetDate) {
    return memoryTargetDate;
  }

  // 2. Check /tmp writable cache (serverless)
  try {
    if (fs.existsSync(TMP_PATH)) {
      const raw = fs.readFileSync(TMP_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.targetDate) {
        memoryTargetDate = parsed.targetDate;
        return parsed.targetDate;
      }
    }
  } catch (err) {
    console.warn("Could not read /tmp waitlist config:", err);
  }

  // 3. Check bundled project config
  try {
    if (fs.existsSync(BUNDLED_PATH)) {
      const raw = fs.readFileSync(BUNDLED_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.targetDate) {
        memoryTargetDate = parsed.targetDate;
        return parsed.targetDate;
      }
    }
  } catch (err) {
    console.warn("Could not read bundled waitlist config:", err);
  }

  // 4. Fallback: 30 days from now
  const fallback = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  memoryTargetDate = fallback;
  return fallback;
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

    const iso = dateObj.toISOString();
    memoryTargetDate = iso;
    const jsonContent = JSON.stringify({ targetDate: iso }, null, 2);

    // Try saving to bundled project location (works locally / VPS)
    let savedToLocal = false;
    try {
      const dir = path.dirname(BUNDLED_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(BUNDLED_PATH, jsonContent, "utf-8");
      savedToLocal = true;
    } catch (localErr) {
      // Expected in serverless (EROFS: read-only file system)
      console.log("Bundled file system is read-only (serverless mode), saving to /tmp");
    }

    // Always also save to /tmp (writable in Vercel/AWS Lambda)
    try {
      fs.writeFileSync(TMP_PATH, jsonContent, "utf-8");
    } catch (tmpErr) {
      console.warn("Could not write to /tmp:", tmpErr);
    }

    return NextResponse.json({ ok: true, targetDate: iso });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update date";
    console.error("Error in countdown route:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}