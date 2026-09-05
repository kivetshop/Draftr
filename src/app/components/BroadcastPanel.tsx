"use client";

import { useState } from "react";
import {
  Send,
  Mail,
  Users,
  Eye,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { Subscriber } from "@/lib/analytics";

interface Props {
  subscribers: Subscriber[];
}

type AudienceFilter = "Active" | "All" | "Pending";

export default function BroadcastPanel({ subscribers }: Props) {
  const [audience, setAudience] = useState<AudienceFilter>("Active");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
  const [result, setResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Audience counts
  const activeCount = subscribers.filter((s) => s.status === "Active").length;
  const pendingCount = subscribers.filter((s) => s.status === "Pending").length;
  const allCount = subscribers.length;

  const currentAudienceCount =
    audience === "Active"
      ? activeCount
      : audience === "Pending"
      ? pendingCount
      : allCount;

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setResult({ type: "error", text: "Please enter a valid test email address." });
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setResult({ type: "error", text: "Subject and message cannot be empty." });
      return;
    }

    setIsSendingTest(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          testEmail: testEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email.");
      setResult({
        type: "success",
        text: `Test email sent to ${testEmail}! Check your inbox.`,
      });
    } catch (e) {
      setResult({
        type: "error",
        text: e instanceof Error ? e.message : "Error sending test email.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!subject.trim() || !message.trim()) {
      setResult({ type: "error", text: "Subject and message cannot be empty." });
      setShowConfirm(false);
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          audience,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send broadcast.");

      setResult({
        type: "success",
        text: `Broadcast delivered successfully to ${data.sentCount || currentAudienceCount} subscribers!`,
      });
      setShowConfirm(false);
      setSubject("");
      setMessage("");
    } catch (e) {
      setResult({
        type: "error",
        text: e instanceof Error ? e.message : "Error sending broadcast.",
      });
      setShowConfirm(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Result notification */}
      {result && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
            result.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold">{result.text}</p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Compose (left) + Preview / Settings (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Compose Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Compose Broadcast</h2>
              <p className="text-xs text-slate-500">
                Send product updates, feature announcements, or invitations via Resend.
              </p>
            </div>
            {/* View switcher on smaller screens */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg lg:hidden">
              <button
                type="button"
                onClick={() => setActiveView("edit")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeView === "edit" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
                }`}
              >
                <Edit3 size={13} className="inline mr-1" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeView === "preview" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
                }`}
              >
                <Eye size={13} className="inline mr-1" />
                Preview
              </button>
            </div>
          </div>

          {/* Audience selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users size={13} className="text-slate-400" />
              Target Audience
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "Active", label: "Active Subscribers", count: activeCount },
                  { id: "All", label: "All Subscribers", count: allCount },
                  { id: "Pending", label: "Pending Only", count: pendingCount },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAudience(tab.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    audience === tab.id
                      ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-500"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-800">{tab.label}</span>
                  <span className="text-lg font-bold text-slate-900 mt-1">{tab.count}</span>
                  <span className="text-[10px] text-slate-400">recipients</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Subject Line</label>
              <span className="text-[10px] text-slate-400">{subject.length} characters</span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Draftr 2.0 is live — Here is what's new"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Message Content</label>
              <span className="text-[10px] text-slate-400">Separate paragraphs with double Enter</span>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey there,&#10;&#10;We're excited to share that we just dropped early access invites for our first cohort of builders.&#10;&#10;Here is your private link to jump ahead in line: https://draftr.dev/invite"
              className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-y leading-relaxed font-sans"
            />
          </div>

          {/* Actions: Test & Broadcast */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-48 sm:w-56 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || isSending}
                className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
              >
                {isSendingTest ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Send Test
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isSending || isSendingTest || !subject.trim() || !message.trim() || currentAudienceCount === 0}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Mail size={14} />
              Broadcast to {currentAudienceCount} Users
            </button>
          </div>
        </div>

        {/* Right column: Live Email Preview Frame */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Eye size={14} className="text-slate-400" />
              Live Email Preview
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
              Resend Template
            </span>
          </div>

          {/* Email mockup window */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Window titlebar */}
            <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                {subject || "Draftr Announcement"}
              </span>
            </div>

            {/* Email Meta bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs space-y-1">
              <div className="flex gap-2">
                <span className="text-slate-400 w-12 shrink-0">From:</span>
                <span className="text-slate-700 font-medium">Draftr &lt;updates@draftr.dev&gt;</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-12 shrink-0">To:</span>
                <span className="text-slate-700">{audience} Waitlist ({currentAudienceCount})</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-12 shrink-0">Subject:</span>
                <span className="text-slate-900 font-semibold truncate">
                  {subject || "Your subject line will appear here"}
                </span>
              </div>
            </div>

            {/* Email Body Frame */}
            <div className="p-6 space-y-4 bg-white min-h-[260px]">
              {/* Email Header */}
              <div className="border-b border-dashed border-slate-200 pb-3">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Draftr<span className="text-orange-600">.</span>
                </span>
              </div>

              {/* Email Content */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  {subject || "Product Update Title"}
                </h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-2 whitespace-pre-wrap font-sans">
                  {message || (
                    <span className="text-slate-300 italic">
                      Start typing your update on the left. The live preview will update here in real-time.
                    </span>
                  )}
                </div>
              </div>

              {/* Email Footer */}
              <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-1">
                <p>You received this because you are on the Draftr early access waitlist.</p>
                <p className="text-slate-300">&copy; {new Date().getFullYear()} Draftr. All rights reserved.</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p className="font-semibold text-amber-950">Broadcast Tip</p>
              <p className="text-amber-800">
                Always test send to yourself first. Resend sandbox domains can only deliver to the account owner&apos;s email address until your custom domain is verified.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSending) setShowConfirm(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Broadcast</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Audience:</span>
                <span className="font-semibold text-slate-900">{audience} subscribers</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Recipients:</span>
                <span className="font-bold text-orange-600">{currentAudienceCount} users</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subject:</span>
                <span className="font-medium text-slate-900 truncate max-w-[220px]">{subject}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you ready to send this announcement via Resend to all{" "}
              <strong className="text-slate-800">{currentAudienceCount}</strong> subscribers?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isSending}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                {isSending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Sending Broadcast...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Yes, Send Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}