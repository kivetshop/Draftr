"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire up to your backend / Resend / Mailchimp
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-sm text-[#c85a1a] font-medium py-2">
        🎉 You&apos;re on the list! We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* ── Desktop / Tablet ────────────────────────────────────── */}
      <div className="hidden sm:flex">
        {/* Dashed-border input */}
        {/* Dashed-border input — same dash style as outer container */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email"
          className="
            flex-1 min-w-0
            border border-dashed border-[#bbb]
            border border-dashed border-[#c8c8c8]
            bg-transparent
            px-4 py-3
            text-sm text-[#1a1a1a] placeholder:text-[#999]
            outline-none
            focus:border-[#888]
            text-sm text-[#333] placeholder:text-[#aaa]
            outline-none focus:border-[#999]
          "
          style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontWeight: 500 }}
          required
        />

        {/* Notify Me button — light gray body + black arrow square */}
        <button
          type="submit"
          className="
            flex items-center
            bg-[#ebebeb] hover:bg-[#e2e2e2]
            border border-l-0 border-[#bbb]
            transition-colors
            shrink-0
          "
        >
          <span className="px-5 py-3 text-sm font-bold text-[#1a1a1a] whitespace-nowrap">
            Notify Me
          </span>
          <span
            className="
              flex items-center justify-center
              w-10 h-full
              bg-[#1a1a1a]
              self-stretch
            "
          >
            <ArrowRight size={15} className="text-white" strokeWidth={2.5} />
          </span>
        </button>
      </div>

      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0 sm:hidden">
        <label className="text-xs text-[#555] mb-1.5">Enter your Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="
            border border-[#ccc]
            bg-white px-3 py-3
            text-sm text-[#1a1a1a] placeholder:text-[#999]
            outline-none
          "
          required
        />
        <button
          type="submit"
          className="
            flex items-center justify-between
            bg-[#ebebeb] hover:bg-[#e2e2e2]
            border border-t-0 border-[#ccc]
            transition-colors
          "
        >
          <span className="px-4 py-3 text-sm font-bold text-[#1a1a1a]">
            Notify Me
          </span>
          <span className="flex items-center justify-center w-12 self-stretch bg-[#1a1a1a]">
            <ArrowRight size={15} className="text-white" strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </form>
  );
}
