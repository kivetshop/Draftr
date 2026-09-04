"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
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
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to join waitlist. Please try again.");
      } else {
        setStatus("success");
        setMessage(data.message || "You have been added to the waitlist!");
        setEmail("");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="hidden sm:flex items-stretch">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            disabled={loading}
            className="flex-1 min-w-0 border border-dashed border-[#c8c8c8] bg-transparent px-4 py-3 text-sm text-[#333] placeholder:text-[#aaa] outline-none focus:border-[#999] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontWeight: 500 }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center bg-[#ebebeb] hover:bg-[#e2e2e2] active:bg-[#dadada] border border-l-0 border-[#c8c8c8] transition-colors shrink-0 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span className="px-5 py-3 text-sm font-bold text-[#1a1a1a] whitespace-nowrap">
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
        <div className="flex flex-col gap-0 sm:hidden">
          <label className="text-xs text-[#555] mb-1.5 font-medium">Enter your Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            disabled={loading}
            className="border border-[#ccc] bg-white px-3 py-3 text-sm text-[#1a1a1a] placeholder:text-[#999] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-between bg-[#ebebeb] hover:bg-[#e2e2e2] border border-t-0 border-[#ccc] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span className="px-4 py-3 text-sm font-bold text-[#1a1a1a]">
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
      {message && (
        <div
          className={`text-xs font-semibold px-1 py-1 transition-all ${status === "success" ? "text-[#c85a1a]" : "text-[#d9381e]"}`}
          style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
        >
          {message}
        </div>
      )}
    </div>
  );
}