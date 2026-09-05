"use client";

import { useState } from "react";
import { Settings, X, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

// ← Change this to your preferred password
const ADMIN_PASSWORD = "kivet@2026";

export default function GhostAdminButton() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const close = () => {
    setOpen(false);
    setPw("");
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      close();
      router.push("/admin/dashboard");
    } else {
      setError(true);
      setPw("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <>
      {/* Ghost trigger — nearly invisible */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Admin"
        className="fixed bottom-4 right-4 p-1.5 opacity-[0.06] hover:opacity-40 transition-opacity duration-500 z-50 cursor-default"
      >
        <Settings size={13} className="text-white" strokeWidth={1.5} />
      </button>

      {/* Password modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 relative">
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-3.5 right-3.5 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={15} />
            </button>

            {/* Icon + title */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                <Lock size={15} className="text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Admin Access</p>
              <p className="text-xs text-slate-400">Enter your password to continue.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="Password"
                autoFocus
                className={`w-full border px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all ${
                  error
                    ? "border-red-300 bg-red-50 placeholder:text-red-300 text-red-600"
                    : "border-slate-200 focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                }`}
                style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
              />

              {error && (
                <p className="text-xs text-red-500 text-center font-medium">
                  Incorrect password. Try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}