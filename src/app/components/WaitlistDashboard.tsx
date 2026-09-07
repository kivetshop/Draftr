"use client";

import {
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UserCheck,
  TrendingUp,
  Megaphone,
  Trophy,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import type { AnalyticsPayload } from "@/lib/analytics";

// ── Stat Card ─────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={`bg-white border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${
        accent ? "border-orange-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span className={accent ? "text-orange-400" : "text-slate-300"}>{icon}</span>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="text-slate-900 font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────

type Props = Omit<AnalyticsPayload, "subscribers">;

export default function WaitlistDashboard({
  metrics,
  velocityData,
  attributionData,
  topReferrers,
  recentActivity,
}: Props) {
  const pct =
    metrics.totalSignups > 0
      ? Math.round((metrics.activeSubscribers / metrics.totalSignups) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={16} />}
          label="Total Signups"
          value={metrics.totalSignups}
          sub="All time"
          accent
        />
        <StatCard
          icon={<UserCheck size={16} />}
          label="Active Subscribers"
          value={metrics.activeSubscribers}
          sub={`${pct}% of total`}
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Viral Ratio (K-Factor)"
          value={metrics.viralCoefficient}
          sub="Referred signups ÷ Direct"
        />
        <StatCard
          icon={<Megaphone size={16} />}
          label="Primary Channel"
          value={metrics.topSource || "—"}
          sub="Top UTM source"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Signup velocity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-800 mb-1">Signup Velocity</p>
          <p className="text-xs text-slate-400 mb-4">Daily additions vs. cumulative growth</p>
          {velocityData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-slate-400">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={velocityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-signups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="signups"
                  fill="url(#grad-signups)"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Daily"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                  name="Cumulative"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Traffic attribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-800 mb-1">Traffic Attribution</p>
          <p className="text-xs text-slate-400 mb-4">Signups by UTM source</p>
          {attributionData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-slate-400">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={attributionData}
                layout="vertical"
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="source"
                  type="category"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#f97316"
                  radius={[0, 4, 4, 0]}
                  name="Signups"
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent + Referrers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Signups Feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={13} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">Recent Signups</p>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.length === 0 && (
              <p className="text-xs text-slate-400 py-4">No signups yet.</p>
            )}
            {recentActivity.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{entry.email}</p>
                  <p className="text-xs text-slate-400">{entry.source}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 ml-4 bg-slate-100 px-2 py-0.5 rounded-full">
                  {entry.relativeTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers Leaderboard */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={13} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">Top Referrers</p>
          </div>
          <div className="divide-y divide-slate-100">
            {topReferrers.length === 0 && (
              <p className="text-xs text-slate-400 py-4">No referrals recorded yet.</p>
            )}
            {topReferrers.map((ref, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    i === 0
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                      : i === 1
                      ? "bg-slate-200 text-slate-700 ring-1 ring-slate-300"
                      : i === 2
                      ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{ref.email}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {ref.referralCode || "no code"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-orange-500 shrink-0 bg-orange-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={11} />
                  <span className="text-xs font-bold">{ref.referralCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}