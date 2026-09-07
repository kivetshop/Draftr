"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function CountdownController() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [inputDate, setInputDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Time remaining preview
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  // Fetch current setting
  const fetchCountdown = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist/countdown");
      const data = await res.json();
      if (data.targetDate) {
        setCurrentDate(data.targetDate);
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const d = new Date(data.targetDate);
        const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setInputDate(localIso);
      }
    } catch (err) {
      console.error("Error loading countdown:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountdown();
  }, []);

  // Update live preview clock
  useEffect(() => {
    if (!currentDate) return;
    const target = new Date(currentDate).getTime();

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      setTimeRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isPast: false,
      });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [currentDate]);

  const handlePreset = (daysToAdd: number) => {
    const d = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setInputDate(localIso);
  };

  const handleSave = async () => {
    if (!inputDate) return;
    setSaving(true);
    setStatus(null);

    try {
      const targetIso = new Date(inputDate).toISOString();
      const res = await fetch("/api/waitlist/countdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: targetIso }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update launch date.");

      setCurrentDate(data.targetDate);
      setStatus({
        type: "success",
        message: "Launch date updated successfully! The landing page countdown has synced.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Error saving countdown.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading timer settings...</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-orange-600" />
              Configure Launch Countdown
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Set the exact date and time your waitlist countdown on the homepage ticks down to.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Quick Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "+7 Days", days: 7 },
                { label: "+14 Days", days: 14 },
                { label: "+30 Days", days: 30 },
                { label: "+60 Days", days: 60 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handlePreset(preset.days)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-slate-700 hover:text-orange-700 transition-all text-center"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Select Launch Date & Time (Local)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Pick the deadline when early access opens or the MVP ships.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={fetchCountdown}
              disabled={saving}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !inputDate}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save Launch Date
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Preview of the Countdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              Live Visitor Preview
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
              Homepage Widget
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">Scheduled Target</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                  {currentDate
                    ? new Date(currentDate).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Not configured"}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  timeRemaining.isPast
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}
              >
                {timeRemaining.isPast ? "Expired / Live" : "Active Countdown"}
              </span>
            </div>

            {/* Countdown Tiles Preview */}
            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-center gap-3 sm:gap-4 select-none">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-lg text-slate-900 shadow-xs font-mono">
                  {timeRemaining.days}
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">DAYS</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-lg text-slate-900 shadow-xs font-mono">
                  {String(timeRemaining.hours).padStart(2, "0")}
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">HOURS</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-lg text-slate-900 shadow-xs font-mono">
                  {String(timeRemaining.minutes).padStart(2, "0")}
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">MINUTES</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-lg text-orange-600 shadow-xs font-mono">
                  {String(timeRemaining.seconds).padStart(2, "0")}
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">SECONDS</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed text-center">
              Visitors to your landing page will see these digit tiles ticking down to your scheduled launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}