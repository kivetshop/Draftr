import Image from "next/image";
import Countdown from "./components/Countdown";
import WaitlistForm from "./components/WaitlistForm";
import ImageGrid from "./components/ImageGrid";
import { XIcon, LinkedInIcon, GitHubIcon } from "./components/SocialIcons";
import GhostAdminButton from "./components/GhostAdminButton";
import GitHubStarButton from "./components/GitHubStarButton";
import { getSiteConfig, SiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function AvatarStack({ profiles }: { profiles: string[] }) {
  const list = profiles && profiles.length > 0 ? profiles : [
    "https://i.pravatar.cc/80?img=68",
    "https://i.pravatar.cc/80?img=15",
    "https://i.pravatar.cc/80?img=33",
  ];

  return (
    <div className="flex items-center">
      {list.slice(0, 3).map((src, i) => (
        <div
          key={i}
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#f5f5f5] overflow-hidden -mr-2 last:mr-0 bg-slate-200"
          style={{ zIndex: i }}
        >
          <Image
            src={src}
            alt={`Awaiting profile ${i + 1}`}
            fill
            sizes="40px"
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

function SocialLinks({ githubRepo }: { githubRepo?: string }) {
  const repo = githubRepo || "kivetshop/Draftr";
  const links = [
    { href: "#", icon: <XIcon size={18} />, label: "X (Twitter)" },
    { href: "#", icon: <LinkedInIcon size={24} />, label: "LinkedIn" },
    { href: `https://github.com/${repo}`, icon: <GitHubIcon size={18} />, label: "GitHub" },
  ];

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[10px] sm:text-xs font-bold tracking-[0.18em] gradient-text"
        style={{ fontFamily: "var(--font-zen-dots)" }}
      >
        REACH US
      </span>
      <div className="flex items-center gap-2 sm:gap-3">
        {links.map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={label}
            className="text-[#1a1a1a] hover:opacity-70 transition-opacity duration-150"
          >
            {icon}
          </a>
        ))}
      </div>
    </div>
  );
}

function HDash() {
  return <div className="w-full h-px shrink-0" style={{ borderTop: "1.5px dashed #c8c8c8" }} />;
}

function ContentPane({ config }: { config: SiteConfig }) {
  return (
    <div className="relative flex flex-col w-full">
      <div className="absolute inset-y-0 left-6 sm:left-8 lg:left-10 w-px pointer-events-none" style={{ borderLeft: "1.5px dashed #c8c8c8" }} />
      <div className="absolute inset-y-0 right-6 sm:right-8 lg:right-10 w-px pointer-events-none" style={{ borderRight: "1.5px dashed #c8c8c8" }} />
      <HDash />

      {/* Header bar: Dynamic Brand Word + Star on GitHub */}
      <div className="py-4 sm:py-5 px-10 sm:px-14 lg:px-16 flex items-center justify-between gap-4">
        <span className="gradient-text text-lg sm:text-xl lg:text-2xl font-bold" style={{ fontFamily: "var(--font-zen-dots)" }}>
          {config.brandName || "Draftr."}
        </span>
        <GitHubStarButton variant="glass" />
      </div>

      <HDash />
      <div className="flex flex-col gap-5 sm:gap-6 py-6 sm:py-8 px-10 sm:px-14 lg:px-16">
        {/* Social Proof with dynamic avatars and custom counter ("305+") */}
        <div className="flex items-center gap-3 flex-wrap">
          <AvatarStack profiles={config.profiles} />
          <p className="text-xs sm:text-sm text-[#1a1a1a] font-semibold" style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}>
            Join{" "}
            <span className="gradient-text font-bold" style={{ fontFamily: "var(--font-zen-dots)" }}>
              {config.socialProofCount || "305+"}
            </span>{" "}
            {config.socialProofText || "others on the waitlist"}
          </p>
        </div>

        {/* Dynamic Headlines */}
        <h1
          className="font-bold leading-[1.35] text-sm sm:text-base md:text-lg lg:text-[1.25rem] xl:text-[1.4rem] flex flex-col gap-1"
          style={{ fontFamily: "var(--font-zen-dots)" }}
        >
          <span className="gradient-text block whitespace-nowrap">{config.headlineLine1}</span>
          <span className="gradient-text block whitespace-nowrap">{config.headlineLine2}</span>
        </h1>

        {/* Dynamic Subtitle */}
        <p className="text-xs sm:text-sm text-[#444] leading-relaxed max-w-sm" style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontWeight: 500 }}>
          {config.subtitle}
        </p>

        <div className="w-full max-w-md">
          <WaitlistForm />
        </div>
        <Countdown />
      </div>
      <HDash />
      <div className="flex items-center justify-between gap-4 py-4 sm:py-5 px-10 sm:px-14 lg:px-16">
        <SocialLinks githubRepo={config.githubRepo} />
        <span className="text-[10px] sm:text-xs text-[#999] whitespace-nowrap" style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontWeight: 500 }}>
          <span className="text-[#1a1a1a] font-semibold">Crafted by Kivet</span>
        </span>
      </div>
      <HDash />
    </div>
  );
}

export default async function Home() {
  const config = await getSiteConfig();

  return (
    <>
      <div className="hidden lg:flex h-screen overflow-hidden">
        <div className="w-[48%] shrink-0 flex flex-col justify-center overflow-y-auto">
          <ContentPane config={config} />
        </div>
        <div className="flex-1 overflow-hidden">
          <ImageGrid />
        </div>
      </div>
      <div className="hidden sm:flex lg:hidden flex-col min-h-screen">
        <div className="flex-1 flex flex-col justify-center">
          <ContentPane config={config} />
        </div>
        <div className="w-full h-65 overflow-hidden">
          <ImageGrid />
        </div>
      </div>
      <div className="flex sm:hidden flex-col min-h-screen">
        <div className="flex flex-col justify-center flex-1">
          <ContentPane config={config} />
        </div>
      </div>

      {/* Ghost admin entry — password-protected */}
      <GhostAdminButton />
    </>
  );
}