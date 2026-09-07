import fs from "fs";
import path from "path";
import os from "os";
import { SiteConfig, DEFAULT_SITE_CONFIG } from "@/config/site-types";

export * from "@/config/site-types";

const BUNDLED_CONFIG_PATH = path.join(process.cwd(), "src", "config", "site.json");
const TMP_CONFIG_PATH = path.join(os.tmpdir(), "draftr_site.json");

// In-memory runtime cache for serverless warm execution
let memorySiteConfig: SiteConfig = DEFAULT_SITE_CONFIG;
let hasLoaded = false;

export async function getSiteConfig(): Promise<SiteConfig> {
  // 1. In-memory cache
  if (hasLoaded) {
    return memorySiteConfig;
  }

  // 2. Read from /tmp (updated at runtime on Vercel)
  try {
    if (fs.existsSync(TMP_CONFIG_PATH)) {
      const raw = fs.readFileSync(TMP_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.brandName) {
        memorySiteConfig = { ...DEFAULT_SITE_CONFIG, ...parsed };
        hasLoaded = true;
        return memorySiteConfig;
      }
    }
  } catch (err) {
    console.warn("Could not read /tmp site config:", err);
  }

  // 3. Read from bundled project config
  try {
    if (fs.existsSync(BUNDLED_CONFIG_PATH)) {
      const raw = fs.readFileSync(BUNDLED_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.brandName) {
        memorySiteConfig = { ...DEFAULT_SITE_CONFIG, ...parsed };
        hasLoaded = true;
        return memorySiteConfig;
      }
    }
  } catch (err) {
    console.warn("Could not read bundled site config:", err);
  }

  hasLoaded = true;
  memorySiteConfig = DEFAULT_SITE_CONFIG;
  return DEFAULT_SITE_CONFIG;
}

export async function updateSiteConfig(newConfig: Partial<SiteConfig>): Promise<SiteConfig> {
  const current = await getSiteConfig();
  const merged: SiteConfig = {
    ...current,
    ...newConfig,
    profiles: Array.isArray(newConfig.profiles) && newConfig.profiles.length === 3
      ? newConfig.profiles
      : current.profiles,
  };

  memorySiteConfig = merged;
  hasLoaded = true;
  const jsonContent = JSON.stringify(merged, null, 2);

  // Try saving to bundled project location (works locally / VPS)
  try {
    const dir = path.dirname(BUNDLED_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BUNDLED_CONFIG_PATH, jsonContent, "utf-8");
  } catch (localErr) {
    // Expected in serverless (EROFS: read-only file system)
    console.log("Bundled file system is read-only (serverless mode), saving to /tmp");
  }

  // Always also save to /tmp (writable in Vercel/AWS Lambda)
  try {
    fs.writeFileSync(TMP_CONFIG_PATH, jsonContent, "utf-8");
  } catch (tmpErr) {
    console.warn("Could not write to /tmp:", tmpErr);
  }

  return merged;
}