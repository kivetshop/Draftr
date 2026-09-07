"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import CustomCalendar from "./CustomCalendar";

export default function CountdownController() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Custom offset values
  const [customDays, setCustomDays] = useState<number>(0);
  const [customHours, setCustomHours] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(0);

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
        setSelectedDate(new Date(data.targetDate));
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

  // Update live preview clock for the target
  useEffect(() => {
    const target = selectedDate.getTime();

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
  }, [selectedDate]);

  // Quick preset offsets (from now)
  const handleQuickPreset = (days: number, hours = 0, mins = 0) => {
    const d = new Date(Date.now() + (days * 24 * 60 + hours * 60 + mins) * 60 * 1000);
    setSelectedDate(d);
  };

  // Add custom offset to current selected date
  const handleAddOffset = () => {
    const totalMs =
      (customDays * 24 * 60 * 60 + customHours * 60 * 60 + customMinutes * 60) * 1000;
    if (totalMs === 0) return;

    const base = selectedDate.getTime() > Date.now() ? selectedDate.getTime() : Date.now();
    setSelectedDate(new Date(base + totalMs));
    setCustomDays(0);
    setCustomHours(0);
    setCustomMinutes(0);
  };

  // Set custom duration from now
  const handleSetFromNow = () => {
    const totalMs =
      (customDays * 24 * 60 * 60 + customHours * 60 * 60 + customMinutes * 60) * 1000;
    if (totalMs === 0) return;

    setSelectedDate(new Date(Date.now() + totalMs));
    setCustomDays(0);
    setCustomHours(0);
    setCustomMinutes(0);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const targetIso = selectedDate.toISOString();
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
        message: "Launch date saved successfully! The landing page countdown has synced.",
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

      {/* Main Grid: Custom Calendar & Adjusters (left) + Preview & Details (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Custom Interactive Calendar */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CalendarIcon size={15} className="text-orange-600" />
              Select Date & Time
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click any day to pick</span>
          </div>

          <CustomCalendar value={selectedDate} onChange={setSelectedDate} />
        </div>

        {/* Right Column: Custom Duration Adders & Live Preview */}
        <div className="lg:col-span-6 space-y-6">
          {/* Custom Time Addition Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-orange-600" />
                Add Custom Days, Hours & Minutes
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Flexible Adjuster</span>
            </div>

            {/* Numeric inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Days
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-transparent font-bold text-slate-900 outline-none text-sm font-mono"
                  />
                  <span className="text-xs text-slate-400 font-medium">d</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Hours
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={customHours}
                    onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-transparent font-bold text-slate-900 outline-none text-sm font-mono"
                  />
                  <span className="text-xs text-slate-400 font-medium">h</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Minutes
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-transparent font-bold text-slate-900 outline-none text-sm font-mono"
                  />
                  <span className="text-xs text-slate-400 font-medium">m</span>
                </div>
              </div>
            </div>

            {/* Add action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddOffset}
                disabled={customDays === 0 && customHours === 0 && customMinutes === 0}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <Plus size={13} />
                Add to Selected
              </button>
              <button
                type="button"
                onClick={handleSetFromNow}
                disabled={customDays === 0 && customHours === 0 && customMinutes === 0}
                className="flex-1 py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/60 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <ArrowRight size={13} />
                Set from Now
              </button>
            </div>

            {/* Quick Presets row */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Presets (From Now)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "+1 Day", days: 1 },
                  { label: "+3 Days", days: 3 },
                  { label: "+7 Days", days: 7 },
                  { label: "+14 Days", days: 14 },
                  { label: "+30 Days", days: 30 },
                  { label: "+60 Days", days: 60 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQuickPreset(preset.days)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-slate-700 hover:text-orange-700 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Visitor Preview & Save Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">Scheduled Target Date</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                  {selectedDate.toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  timeRemaining.isPast
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}
              >
                {timeRemaining.isPast ? "In the past" : "Active countdown"}
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

            {/* Save & Reset actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
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
                disabled={saving}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Saving Launch Date...
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
        </div>
      </div>
    </div>
  );
}