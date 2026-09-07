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

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        setStatus("success");
        setMessage(data.message || "You are on the list! We will reach out when we launch.");
        setEmail("");
      } else if (response.status === 200) {
        setStatus("already");
        setMessage(data.message || "This email is already on our waitlist. We will be in touch soon!");
      } else if (response.status === 400) {
        setStatus("error");
        setMessage(data.error || "Please enter a valid email address and try again.");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong on our end. Please try again in a moment.");
      }
    } catch {
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder="name@company.com"
            required
            disabled={loading}
            className="flex-1 min-w-0 bg-[#e8e8e8] text-[#1a1a1a] placeholder-[#999] text-xs font-semibold tracking-wide px-3.5 py-2.5 outline-none rounded-none disabled:opacity-60 border-0"
            style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-bold tracking-wide px-4 py-2.5 transition-colors duration-150 rounded-none shrink-0 cursor-pointer disabled:opacity-60"
            style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <span>Notify Me</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder="name@company.com"
            required
            disabled={loading}
            className="w-full bg-[#e8e8e8] text-[#1a1a1a] placeholder-[#999] text-xs font-semibold tracking-wide px-3.5 py-2.5 outline-none rounded-none disabled:opacity-60 border-0"
            style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-bold tracking-wide py-2.5 transition-colors duration-150 rounded-none cursor-pointer disabled:opacity-60"
            style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <span>Notify Me</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </form>

      <FeedbackBanner status={status} message={message} />
    </div>
  );
}