"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import type { Subscriber } from "@/lib/analytics";

const TABS = ["All", "Active", "Pending", "Unsubscribed"] as const;
type Tab = (typeof TABS)[number];

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  Active: {
    label: "Active",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  Pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  Unsubscribed: {
    label: "Unsub",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-600 border border-red-200",
  },
};

interface Props {
  initialSubscribers: Subscriber[];
}

export default function AudienceTable({ initialSubscribers }: Props) {
  const [subs, setSubs] = useState<Subscriber[]>(initialSubscribers);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = activeTab === "All" ? subs : subs.filter((s) => s.status === activeTab);
  const tabCount = (tab: Tab) =>
    tab === "All" ? subs.length : subs.filter((s) => s.status === tab).length;

  const toggleStatus = async (sub: Subscriber) => {
    const next = sub.status === "Active" ? "Unsubscribed" : "Active";
    setUpdating(sub.id);
    setError(null);
    try {
      const res = await fetch("/api/waitlist/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: sub.id, status: next }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      setSubs((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status: next } : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit flex-wrap shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {tab}
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                activeTab === tab
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          <XCircle size={13} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Email", "Status", "Referral Code", "Invites", "Source", "Joined", "Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No subscribers in this category.
                  </td>
                </tr>
              )}
              {filtered.map((sub) => {
                const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.Pending;
                const isUpdating = updating === sub.id;
                const joined = sub.joinedAt
                  ? new Date(sub.joinedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr
                    key={sub.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0"
                  >
                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-slate-800 font-mono max-w-[200px] truncate">
                      {sub.email}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Referral code */}
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {sub.referralCode || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Invites */}
                    <td className="px-4 py-3 text-sm text-slate-700 tabular-nums font-medium">
                      {sub.referralCount}
                    </td>

                    {/* UTM Source */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sub.utmSource || "direct"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {joined}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(sub)}
                        disabled={isUpdating || sub.status === "Pending"}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          sub.status === "Active"
                            ? "border-red-200 text-red-600 hover:bg-red-50 bg-white"
                            : sub.status === "Unsubscribed"
                            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                            : "border-slate-200 text-slate-400 bg-white cursor-default"
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : sub.status === "Active" ? (
                          <><XCircle size={11} /> Unsubscribe</>
                        ) : sub.status === "Unsubscribed" ? (
                          <><CheckCircle2 size={11} /> Activate</>
                        ) : (
                          <Clock size={11} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="text-slate-700 font-semibold">{filtered.length}</span> of{" "}
            <span className="text-slate-700 font-semibold">{subs.length}</span> subscribers
          </p>
        </div>
      </div>
    </div>
  );
}