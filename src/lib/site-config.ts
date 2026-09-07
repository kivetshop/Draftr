import fs from "fs";
import path from "path";
import { SiteConfig, DEFAULT_SITE_CONFIG } from "@/config/site-types";

export * from "@/config/site-types";

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "config", "site.json");

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error("Failed to read site.json:", err);
  }

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

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write site.json:", err);
  }

  return merged;
}