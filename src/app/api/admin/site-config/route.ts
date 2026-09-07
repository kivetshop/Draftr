import { NextResponse } from "next/server";
import { getSiteConfig, updateSiteConfig, SiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({ config });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { config } = body as { config?: Partial<SiteConfig> };

    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "config object is required" }, { status: 400 });
    }

    const updated = await updateSiteConfig(config);
    return NextResponse.json({ ok: true, config: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}