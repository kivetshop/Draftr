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
  X,
  Zap,
  Clock,
  MessageSquare,
  Gift,
  Flame,
} from "lucide-react";
import type { Subscriber } from "@/lib/analytics";

interface Props {
  subscribers: Subscriber[];
}

type AudienceFilter = "Active" | "All" | "Pending";

interface EmailTemplate {
  id: string;
  badge: string;
  title: string;
  description: string;
  iconName: "rocket" | "zap" | "clock" | "chat" | "gift";
  subject: string;
  message: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "alpha-invite",
    badge: "VIP Access",
    title: "Alpha Workspace Invite",
    description: "Welcome early builders, grant private workspace pass & lock in 40% discount.",
    iconName: "rocket",
    subject: "You're in! Welcome to Draftr Early Access",
    message: `Hey there,

Thank you for backing Draftr from day one.

We are officially rolling out our private alpha invites, and your workspace is ready. You can claim your early access pass here:
https://draftr.dev/login?ref=early-access

As an early supporter, you receive:
- Full access to all Pro features during the preview period
- Guaranteed 40% discount for life once public billing starts
- Direct access to our engineering team in our private community

Feel free to reply directly to this email with any feedback or bugs you notice. We read and respond to every message!

Best,
The Draftr Team`,
  },
  {
    id: "changelog",
    badge: "Dev Update",
    title: "Weekly Changelog",
    description: "Showcase latest shipped features, boot speedups & roadmap sneak peeks.",
    iconName: "zap",
    subject: "Draftr Dev Update: Faster builds, Notion sync, and dark mode",
    message: `Hey builders,

Here is a quick look behind the scenes at what our team shipped this week:

What's New:
- Faster workspace boot times: Reduced cold-start container initialization to under 800ms.
- Notion & GitHub sync: Connect your databases and repositories with 1 click.
- Refined light & dark theme polish across all builder panels.

What We're Working on Next:
- Live multi-player pair programming canvas
- Automated Dockerfile and deployment scaffolding

Have a feature request you'd like to see prioritized? Hit reply and let us know!

Cheers,
The Draftr Team`,
  },
  {
    id: "countdown-reminder",
    badge: "High Urgency",
    title: "48-Hour Launch Alert",
    description: "Create conversion urgency before early founder discounts officially expire.",
    iconName: "clock",
    subject: "Final 48 Hours: Secure your 40% launch discount",
    message: `Hey there,

Just a quick heads-up: our public launch is in less than 48 hours!

When the countdown timer on our homepage hits zero, our early founder pricing will officially close.

Your exclusive perks:
- 40% off your subscription for the entire year
- Guaranteed priority queue for all generation jobs
- Founder-tier badge and community access

Claim your early founder spot before the countdown ends:
https://draftr.dev

See you inside,
The Draftr Team`,
  },
  {
    id: "founder-call",
    badge: "1-on-1 Discovery",
    title: "Founder Feedback Chat",
    description: "Personal note asking for 15-minute customer discovery feedback calls.",
    iconName: "chat",
    subject: "Quick question about what you're building (15 min chat?)",
    message: `Hey,

I'm one of the co-founders at Draftr. First off, thank you for joining our early waitlist!

We're currently hopping on quick 15-minute feedback calls with developers and founders to understand what pain points you're hoping Draftr solves for you.

If you have 15 minutes to chat this week, pick a time that works best for you here:
https://cal.com/draftr/founder-chat

No sales pitch at all — just looking to build something you'll love using every day.

Looking forward to connecting!

Warmly,
Draftr Founder`,
  },
  {
    id: "skip-line",
    badge: "Viral Referral",
    title: "Skip the Waitlist Line",
    description: "Push subscribers to invite team members and jump the queue.",
    iconName: "gift",
    subject: "Want to skip the waitlist? Invite 2 fellow builders",
    message: `Hey,

Want early access sooner? We have opened up priority line jumping.

Every time a fellow developer or colleague signs up using your unique referral code, you move up 5 spots on the priority list. Top referrers will also receive free lifetime access to our Pro tier.

Find your personal referral link inside your confirmation email and share it with your team.

Keep building,
The Draftr Team`,
  },
];

export default function BroadcastPanel({ subscribers }: Props) {
  const [audience, setAudience] = useState<AudienceFilter>("Active");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
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

  const handleApplyTemplate = (tmpl: EmailTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setSubject(tmpl.subject);
    setMessage(tmpl.message);
    setResult({
      type: "success",
      text: `Loaded "${tmpl.title}" template! You can fine-tune the text below.`,
    });
  };

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
      setSelectedTemplateId(null);
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

  const renderTemplateIcon = (icon: EmailTemplate["iconName"]) => {
    switch (icon) {
      case "rocket": return <Flame size={14} className="text-orange-600" />;
      case "zap":    return <Zap size={14} className="text-amber-600" />;
      case "clock":  return <Clock size={14} className="text-red-500" />;
      case "chat":   return <MessageSquare size={14} className="text-blue-500" />;
      case "gift":   return <Gift size={14} className="text-emerald-600" />;
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
            className="text-xs opacity-70 hover:opacity-100 p-1 hover:bg-black/5 rounded"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Visual Email Template Gallery */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Sparkles size={13} />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Email Template Gallery</h3>
              <p className="text-[11px] text-slate-400">Click any card to load high-converting copy</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            5 Ready-to-Send Designs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {EMAIL_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative ${
                  isSelected
                    ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-500 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {renderTemplateIcon(tmpl.iconName)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {tmpl.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                  )}
                </div>

                <p className="text-xs font-bold text-slate-900 line-clamp-1">{tmpl.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                  {tmpl.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100/80 text-[10px] text-slate-400 font-mono truncate">
                  {tmpl.subject}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Compose (left) + Preview (right) */}
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
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Select a visual template from above or start typing here..."
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
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-50">
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
            <div className="p-6 space-y-4 bg-white min-h-65">
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
                      Pick a template above or type your announcement. Live preview renders automatically.
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
                <span className="font-medium text-slate-900 truncate max-w-55">{subject}</span>
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