// ─────────────────────────────────────────────────────────────────
// src/lib/analytics.ts
// Pure aggregation: takes raw Notion pages → structured payload
// ─────────────────────────────────────────────────────────────────

import { getTitle, getRichText, getSelect, getNumber, getCreatedTimeProp } from "@/lib/notion";

// ── Exported types ────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  joinedAt: string;
  referralCode: string;
  referredBy: string;
  referralCount: number;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  status: string;
}

export interface AnalyticsPayload {
  metrics: {
    totalSignups: number;
    activeSubscribers: number;
    viralCoefficient: number;
    topSource: string;
  };
  velocityData: { date: string; signups: number; cumulative: number }[];
  attributionData: { source: string; count: number }[];
  topReferrers: { email: string; referralCode: string; referralCount: number }[];
  recentActivity: { email: string; joinedAt: string; relativeTime: string; source: string }[];
  subscribers: Subscriber[];
}

// ── Helpers ───────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const prefix = local.slice(0, Math.min(2, local.length));
  return `${prefix}***@${domain}`;
}

function relativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Main aggregation ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aggregateAnalytics(pages: any[]): AnalyticsPayload {
  // 1. Extract structured rows
  const rows: Subscriber[] = pages.map((p) => {
    const props = p.properties ?? {};
    return {
      id: p.id as string,
      email: getTitle(props.Email),
      joinedAt: getCreatedTimeProp(props["Joined At"], p.created_time ?? ""),
      referralCode: getRichText(props.ReferralCode),
      referredBy: getRichText(props.ReferredBy),
      referralCount: getNumber(props.ReferralCount),
      utmSource: getSelect(props.UTMSource) || "direct",
      utmMedium: getRichText(props.UTMMedium),
      utmCampaign: getRichText(props.UTMCampaign),
      status: getSelect(props.Status) || "Pending",
    };
  });

  // 2. Metrics
  const totalSignups = rows.length;
  const activeSubscribers = rows.filter((r) => r.status === "Active").length;
  const referredCount = rows.filter((r) => r.referredBy.trim() !== "").length;
  const directCount = totalSignups - referredCount;
  const viralCoefficient =
    directCount > 0 ? parseFloat((referredCount / directCount).toFixed(2)) : 0;

  // Source frequency map
  const sourceMap: Record<string, number> = {};
  rows.forEach((r) => {
    const src = r.utmSource || "direct";
    sourceMap[src] = (sourceMap[src] ?? 0) + 1;
  });
  const topSource =
    Object.entries(sourceMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // 3. Velocity data (sorted by date)
  const byDate: Record<string, number> = {};
  rows.forEach((r) => {
    const date = r.joinedAt ? r.joinedAt.slice(0, 10) : "unknown";
    byDate[date] = (byDate[date] ?? 0) + 1;
  });
  let cumulative = 0;
  const velocityData = Object.keys(byDate)
    .sort()
    .map((date) => {
      cumulative += byDate[date];
      return { date, signups: byDate[date], cumulative };
    });

  // 4. Attribution data
  const attributionData = Object.entries(sourceMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // 5. Top referrers (top 5 by referralCount, masked email)
  const topReferrers = [...rows]
    .filter((r) => r.referralCount > 0)
    .sort((a, b) => b.referralCount - a.referralCount)
    .slice(0, 5)
    .map((r) => ({
      email: maskEmail(r.email),
      referralCode: r.referralCode,
      referralCount: r.referralCount,
    }));

  // 6. Recent activity (last 5, sorted newest first, masked email)
  const recentActivity = [...rows]
    .filter((r) => r.joinedAt)
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, 5)
    .map((r) => ({
      email: maskEmail(r.email),
      joinedAt: r.joinedAt,
      relativeTime: relativeTime(r.joinedAt),
      source: r.utmSource || "direct",
    }));

  return {
    metrics: { totalSignups, activeSubscribers, viralCoefficient, topSource },
    velocityData,
    attributionData,
    topReferrers,
    recentActivity,
    subscribers: rows,
  };
}