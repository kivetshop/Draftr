import Image from "next/image";
import Countdown from "./components/Countdown";
import WaitlistForm from "./components/WaitlistForm";
import ImageGrid from "./components/ImageGrid";
import { XIcon, LinkedInIcon, GitHubIcon } from "./components/SocialIcons";

const TEAM = [
  { src: "https://i.pravatar.cc/80?img=68", alt: "Team member 1" },
  { src: "https://i.pravatar.cc/80?img=15", alt: "Team member 2" },
  { src: "https://i.pravatar.cc/80?img=33", alt: "Team member 3" },
];

function AvatarStack() {
  return (
    <div className="flex items-center">
      {TEAM.map(({ src, alt }, i) => (
        <div
          key={i}
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#f5f5f5] overflow-hidden -mr-2 last:mr-0"
          style={{ zIndex: i }}
        >
          <Image src={src} alt={alt} fill sizes="40px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

function SocialLinks() {
  const links = [
    { href: "#", icon: <XIcon size={18} />, label: "X (Twitter)" },
    { href: "#", icon: <LinkedInIcon size={24} />, label: "LinkedIn" },
    { href: "#", icon: <GitHubIcon size={18} />, label: "GitHub" },
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
          <a key={label} href={href} aria-label={label} className="text-[#1a1a1a] hover:opacity-70 transition-opacity duration-150">
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

function ContentPane() {
  return (
    <div className="relative flex flex-col w-full">
      <div className="absolute inset-y-0 left-6 sm:left-8 lg:left-10 w-px pointer-events-none" style={{ borderLeft: "1.5px dashed #c8c8c8" }} />
      <div className="absolute inset-y-0 right-6 sm:right-8 lg:right-10 w-px pointer-events-none" style={{ borderRight: "1.5px dashed #c8c8c8" }} />
      <HDash />
      <div className="py-4 sm:py-5 px-10 sm:px-14 lg:px-16">
        <span className="gradient-text text-lg sm:text-xl lg:text-2xl font-bold" style={{ fontFamily: "var(--font-zen-dots)" }}>
          Draftr.
        </span>
      </div>
      <HDash />
      <div className="flex flex-col gap-5 sm:gap-6 py-6 sm:py-8 px-10 sm:px-14 lg:px-16">
        <div className="flex items-center gap-3 flex-wrap">
          <AvatarStack />
          <p className="text-xs sm:text-sm text-[#1a1a1a] font-semibold" style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }}>
            Join{" "}
            <span className="gradient-text font-bold" style={{ fontFamily: "var(--font-zen-dots)" }}>
              305+
            </span>{" "}
            others on the waitlist
          </p>
        </div>
        <h1
          className="font-bold leading-[1.35] text-sm sm:text-base md:text-lg lg:text-[1.25rem] xl:text-[1.4rem] flex flex-col gap-1"
          style={{ fontFamily: "var(--font-zen-dots)" }}
        >
          <span className="gradient-text block whitespace-nowrap">Ship your MVP in days, not months.</span>
          <span className="gradient-text block whitespace-nowrap">Launching Soon</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#444] leading-relaxed max-w-sm" style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontWeight: 500 }}>
          The all-in-one developer workspace designed to turn raw product ideas into production-ready software. Join the early waitlist for 40% off at launch.
        </p>
        <div className="w-full max-w-md">
          <WaitlistForm />
        </div>
        <Countdown />
      </div>
      <HDash />
      <div className="flex items-center justify-between gap-4 py-4 sm:py-5 px-10 sm:px-14 lg:px-16">
        <SocialLinks />
        <span className="text-[10px] sm:text-xs text-[#999] whitespace-nowrap" style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontWeight: 500 }}>
          <span className="text-[#1a1a1a] font-semibold">Crafted by Kivet</span>
        </span>
      </div>
      <HDash />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="hidden lg:flex h-screen overflow-hidden">
        <div className="w-[48%] shrink-0 flex flex-col justify-center overflow-y-auto">
          <ContentPane />
        </div>
        <div className="flex-1 overflow-hidden">
          <ImageGrid />
        </div>
      </div>
      <div className="hidden sm:flex lg:hidden flex-col min-h-screen">
        <div className="flex-1 flex flex-col justify-center">
          <ContentPane />
        </div>
        <div className="w-full h-65 overflow-hidden">
          <ImageGrid />
        </div>
      </div>
      <div className="flex sm:hidden flex-col min-h-screen">
        <div className="flex flex-col justify-center flex-1">
          <ContentPane />
        </div>
      </div>
    </>
  );
}