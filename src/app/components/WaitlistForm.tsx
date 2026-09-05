"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type Status = "idle" | "success" | "already" | "error";

interface FeedbackBannerProps {
  status: Status;
  message: string;
}

function FeedbackBanner({ status, message }: FeedbackBannerProps) {
  if (status === "idle" || !message) return null;

  const config = {
    success: {
      bg: "bg-[#f0fdf4]",
      border: "border-[#86efac]",
      text: "text-[#15803d]",
      icon: <CheckCircle2 size={16} className="text-[#16a34a] shrink-0 mt-px" />,
    },
    already: {
      bg: "bg-[#fffbeb]",
      border: "border-[#fcd34d]",
      text: "text-[#92400e]",
      icon: <AlertCircle size={16} className="text-[#d97706] shrink-0 mt-px" />,
    },
    error: {
      bg: "bg-[#fef2f2]",
      border: "border-[#fca5a5]",
      text: "text-[#991b1b]",
      icon: <XCircle size={16} className="text-[#dc2626] shrink-0 mt-px" />,
    },
  };

  const c = config[status];

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 rounded border ${c.bg} ${c.border}`}
      style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
    >
      {c.icon}
      <span className={`text-xs font-semibold leading-snug ${c.text}`}>{message}</span>
    </div>
  );
}

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setStatus("success");
        setMessage("You are on the list! We will reach out when we launch.");
        setEmail("");
      } else if (response.status === 200) {
        setStatus("already");
        setMessage("This email is already on our waitlist. We will be in touch soon!");
      } else if (response.status === 400) {
        setStatus("error");
        setMessage(data.error || "Please enter a valid email address and try again.");
      } else {
        setStatus("error");
        setMessage("Something went wrong on our end. Please try again in a moment.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("No internet connection detected. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      <form onSubmit={handleSubmit} className="w-full">
        {/* Desktop / Tablet */}
        <div className="hidden sm:flex items-stretch">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={loading || status === "success"}
            className="flex-1 min-w-0 border border-dashed border-[#c8c8c8] bg-transparent px-4 py-3 text-sm text-[#333] placeholder:text-[#aaa] outline-none focus:border-[#999] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontWeight: 500 }}
            required
          />
          <button
            type="submit"
            disabled={loading || status === "success"}
            className="flex items-center bg-[#ebebeb] hover:bg-[#e2e2e2] active:bg-[#dadada] border border-l-0 border-[#c8c8c8] transition-colors shrink-0 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span className="px-5 py-3 text-sm font-bold text-[#1a1a1a] whitespace-nowrap" style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}>
              {loading ? "Joining..." : "Notify Me"}
            </span>
            <span className="flex items-center justify-center w-10 h-full bg-[#1a1a1a] self-stretch">
              {loading ? (
                <Loader2 size={15} className="text-white animate-spin" />
              ) : (
                <ArrowRight size={15} className="text-white" strokeWidth={2.5} />
              )}
            </span>
          </button>
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-0 sm:hidden">
          <label className="text-xs text-[#555] mb-1.5 font-medium" style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}>
            Enter your email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={loading || status === "success"}
            className="border border-[#ccc] bg-white px-3 py-3 text-sm text-[#1a1a1a] placeholder:text-[#999] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            required
          />
          <button
            type="submit"
            disabled={loading || status === "success"}
            className="flex items-center justify-between bg-[#ebebeb] hover:bg-[#e2e2e2] border border-t-0 border-[#ccc] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span className="px-4 py-3 text-sm font-bold text-[#1a1a1a]" style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}>
              {loading ? "Joining..." : "Notify Me"}
            </span>
            <span className="flex items-center justify-center w-12 self-stretch bg-[#1a1a1a]">
              {loading ? (
                <Loader2 size={15} className="text-white animate-spin" />
              ) : (
                <ArrowRight size={15} className="text-white" strokeWidth={2.5} />
              )}
            </span>
          </button>
        </div>
      </form>

      {/* Feedback Banner */}
      <FeedbackBanner status={status} message={message} />
    </div>
  );
}