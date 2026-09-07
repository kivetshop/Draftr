"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutTemplate,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Eye,
  Type,
  GitBranch,
} from "lucide-react";
import type { SiteConfig } from "@/config/site-types";
import { DEFAULT_SITE_CONFIG } from "@/config/site-types";
import { GitHubIcon } from "./SocialIcons";

const AVATAR_PRESET_PACKS = [
  {
    name: "Default Tech",
    urls: [
      "https://i.pravatar.cc/80?img=68",
      "https://i.pravatar.cc/80?img=15",
      "https://i.pravatar.cc/80?img=33",
    ],
  },
  {
    name: "Diverse Builders",
    urls: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
    ],
  },
  {
    name: "Modern Founders",
    urls: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=faces",
    ],
  },
];

export default function SiteContentController() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-config");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
      }
    } catch (e) {
      console.error("Failed to load site config:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleProfileChange = (index: number, url: string) => {
    const updated = [...config.profiles];
    updated[index] = url;
    setConfig({ ...config, profiles: updated });
  };

  const handleApplyPresetPack = (urls: string[]) => {
    setConfig({ ...config, profiles: urls });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save configuration.");

      setConfig(data.config);
      setStatus({
        type: "success",
        message: "Waitlist content updated successfully! Homepage is now serving your new text and profiles.",
      });
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "Error saving configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading CMS configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {status && (
        <div
          className={`flex items-start gap-2.5 p-4 rounded-xl border text-xs font-semibold ${
            status.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Main Grid: CMS Form (left) + Live Mockup Preview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LayoutTemplate size={18} className="text-orange-600" />
              Customize Waitlist Landing Page
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dynamically control the product name, headlines, social proof number, and waiting profiles displayed on your public page.
            </p>
          </div>

          {/* Brand / Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Type size={13} className="text-slate-400" />
              Product / Brand Word (Logo)
            </label>
            <input
              type="text"
              value={config.brandName}
              onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
              placeholder="Draftr."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <p className="text-[11px] text-slate-400">
              Displayed in bold gradient in the top left header of the waitlist page.
            </p>
          </div>

          {/* Social Proof Counter ("305+" & label) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users size={13} className="text-slate-400" />
                Waitlist Counter Text
              </label>
              <input
                type="text"
                value={config.socialProofCount}
                onChange={(e) => setConfig({ ...config, socialProofCount: e.target.value })}
                placeholder="305+"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Counter Subtitle Label
              </label>
              <input
                type="text"
                value={config.socialProofText}
                onChange={(e) => setConfig({ ...config, socialProofText: e.target.value })}
                placeholder="others on the waitlist"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* 3 Profiles Awaiting */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Users size={14} className="text-orange-600" />
                3 Profiles Awaiting (Avatar Stack)
              </label>
              <div className="flex items-center gap-1">
                {AVATAR_PRESET_PACKS.map((pack) => (
                  <button
                    key={pack.name}
                    type="button"
                    onClick={() => handleApplyPresetPack(pack.urls)}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-orange-50 hover:text-orange-700 px-2 py-0.5 rounded-md text-slate-600 transition-colors"
                  >
                    {pack.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {config.profiles.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                    <Image
                      src={url || "https://i.pravatar.cc/80"}
                      alt={`Profile ${idx + 1}`}
                      fill
                      sizes="36px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleProfileChange(idx, e.target.value)}
                    placeholder={`https://... profile avatar ${idx + 1}`}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Headlines */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Headline Line 1</label>
              <input
                type="text"
                value={config.headlineLine1}
                onChange={(e) => setConfig({ ...config, headlineLine1: e.target.value })}
                placeholder="Ship your MVP in days, not months."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Headline Line 2</label>
              <input
                type="text"
                value={config.headlineLine2}
                onChange={(e) => setConfig({ ...config, headlineLine2: e.target.value })}
                placeholder="Launching Soon"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Subtitle Description</label>
              <textarea
                rows={3}
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="Product description and early access callout..."
                className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 outline-none focus:border-orange-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* GitHub Repo */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <GitHubIcon size={13} />
              GitHub Repository (for Star on GitHub button)
            </label>
            <input
              type="text"
              value={config.githubRepo}
              onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
              placeholder="kivetshop/Draftr"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={fetchConfig}
              disabled={saving}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save Content Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Eye size={14} className="text-slate-400" />
              Live Homepage Preview
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
              Synchronized Real-Time
            </span>
          </div>

          {/* Mockup Card */}
          <div className="bg-[#f5f5f5] border border-slate-300/80 rounded-2xl p-6 shadow-sm space-y-5 text-[#1a1a1a]">
            {/* Mock header bar */}
            <div className="flex items-center justify-between border-b border-dashed border-[#c8c8c8] pb-3">
              <span
                className="gradient-text text-xl font-bold"
                style={{ fontFamily: "var(--font-zen-dots)" }}
              >
                {config.brandName || "Draftr."}
              </span>
              <span className="text-[10px] font-semibold bg-white border border-slate-300 px-2.5 py-1 rounded-full text-slate-700 shadow-2xs">
                Star on GitHub
              </span>
            </div>

            {/* Social proof row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center">
                {config.profiles.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden -mr-2 last:mr-0 bg-slate-200"
                    style={{ zIndex: i }}
                  >
                    <Image
                      src={src || "https://i.pravatar.cc/80"}
                      alt={`Preview profile ${i + 1}`}
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <p
                className="text-xs text-[#1a1a1a] font-semibold"
                style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
              >
                Join{" "}
                <span
                  className="gradient-text font-bold"
                  style={{ fontFamily: "var(--font-zen-dots)" }}
                >
                  {config.socialProofCount || "305+"}
                </span>{" "}
                {config.socialProofText || "others on the waitlist"}
              </p>
            </div>

            {/* Headlines */}
            <div className="space-y-1">
              <h3
                className="text-base sm:text-lg font-bold leading-tight"
                style={{ fontFamily: "var(--font-zen-dots)" }}
              >
                <span className="gradient-text block">
                  {config.headlineLine1 || "Ship your MVP in days, not months."}
                </span>
                <span className="gradient-text block">
                  {config.headlineLine2 || "Launching Soon"}
                </span>
              </h3>
            </div>

            {/* Subtitle */}
            <p
              className="text-xs text-[#555] leading-relaxed line-clamp-3"
              style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
            >
              {config.subtitle}
            </p>

            {/* Form mock */}
            <div className="pt-2 border-t border-dashed border-[#c8c8c8] flex gap-2">
              <div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] text-slate-400 font-mono">
                name@company.com
              </div>
              <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-[11px] font-bold">
                Notify Me
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}