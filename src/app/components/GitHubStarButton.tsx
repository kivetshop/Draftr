"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { GitHubIcon } from "./SocialIcons";

interface Props {
  className?: string;
  variant?: "outline" | "pill" | "glass";
}

export default function GitHubStarButton({ className = "", variant = "outline" }: Props) {
  const [stars, setStars] = useState<number | null>(null);
  const repoUrl = "https://github.com/kivetshop/Draftr";

  useEffect(() => {
    let isMounted = true;
    fetch("/api/github/stars")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && typeof data.stars === "number") {
          setStars(data.stars);
        }
      })
      .catch(() => {
        if (isMounted) setStars(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Star Draftr on GitHub"
      className={`
        group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
        transition-all duration-200 select-none
        ${
          variant === "glass"
            ? "bg-black/5 hover:bg-black/10 text-[#1a1a1a] border border-[#d4d4d4]"
            : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 shadow-xs"
        }
        ${className}
      `}
      style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}
    >
      <span className="flex items-center gap-1.5 text-[#1a1a1a] group-hover:scale-105 transition-transform">
        <GitHubIcon size={14} />
        <span>Star on GitHub</span>
      </span>

      {typeof stars === "number" ? (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200/60 text-[11px] font-bold">
          <Star size={10} className="fill-orange-500 text-orange-500" />
          <span>{stars.toLocaleString()}</span>
        </span>
      ) : (
        <Star size={12} className="text-orange-500 group-hover:fill-orange-500 transition-colors shrink-0" />
      )}
    </a>
  );
}