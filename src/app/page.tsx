import Countdown from "./components/Countdown";
import WaitlistForm from "./components/WaitlistForm";
import ImageGrid from "./components/ImageGrid";
import { XIcon, LinkedInIcon, GitHubIcon } from "./components/SocialIcons";

/* ─── Avatar stack ─────────────────────────────────────────────────────── */
function AvatarStack() {
  const colors = ["#5a7a6a", "#4a6a8a", "#6a5a8a"];
  const initials = ["A", "B", "C"];
  return (
    <div className="flex items-center">
      {colors.map((color, i) => (
        <div
          key={i}
          className="
            w-8 h-8 sm:w-10 sm:h-10
            rounded-full border-2 border-[#f5f5f5]
            flex items-center justify-center
            text-white text-xs font-bold
            -mr-2 last:mr-0
          "
          style={{ backgroundColor: color, zIndex: i }}
        >
          {initials[i]}
        </div>
      ))}
    </div>
  );
}

/* ─── Social Links ──────────────────────────────────────────────────────── */
function SocialLinks({ centered = false }: { centered?: boolean }) {
  const links = [
    { href: "#", icon: <XIcon size={20} />, label: "X (Twitter)" },
    { href: "#", icon: <LinkedInIcon size={26} />, label: "LinkedIn" },
    { href: "#", icon: <GitHubIcon size={20} />, label: "GitHub" },
  ];

  return (
    <div
      className={`flex items-center gap-3 ${centered ? "flex-col" : "flex-row"}`}
    >
      <span
        className={`
          text-[10px] sm:text-xs font-bold tracking-widest
          text-[#c85a1a]
          ${centered ? "text-center" : ""}
        `}
      >
        REACH US
      </span>
      <div className="flex items-center gap-3">
        {links.map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="
              text-[#1a1a1a] hover:text-[#c85a1a]
              transition-colors duration-150
            "
          >
            {icon}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── Left / Content pane ──────────────────────────────────────────────── */
function ContentPane() {
  return (
    <div className="flex flex-col justify-center gap-5 sm:gap-6 px-8 sm:px-10 md:px-14 lg:px-16 py-10 sm:py-12 md:py-14 lg:py-0">
      {/* Logo */}
      <div>
        <span
          className="text-lg sm:text-xl md:text-2xl text-[#c85a1a]"
          style={{ fontFamily: "var(--font-zen-dots)" }}
        >
          Draftr.
        </span>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-3 flex-wrap">
        <AvatarStack />
        <p className="text-xs sm:text-sm text-[#1a1a1a]">
          Join{" "}
          <span className="font-bold text-[#c85a1a]">305+</span>{" "}
          others on the waitlist
        </p>
      </div>

      {/* Headline */}
      <div>
        <h1
          className="leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-4xl text-[#c85a1a]"
          style={{ fontFamily: "var(--font-zen-dots)" }}
        >
          Ship your MVP in days, not months.
          <br />
          <span className="text-xl sm:text-2xl md:text-3xl">Launching Soon</span>
        </h1>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-[#333] leading-relaxed max-w-sm">
        The all-in-one developer workspace designed to turn raw product ideas
        into production-ready software. Join the early waitlist for 40% off at
        launch.
      </p>

      {/* Waitlist form */}
      <div className="w-full max-w-md">
        <WaitlistForm />
      </div>

      {/* Countdown */}
      <Countdown />

      {/* Social links */}
      <SocialLinks />
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      {/*
        ── DESKTOP layout (lg+) ─────────────────────────────────────────────
        Left 45% = content, right 55% = image grid, full viewport height
      */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Content — left */}
        <div className="w-[45%] flex-shrink-0 flex flex-col justify-center overflow-y-auto">
          <ContentPane />
        </div>

        {/* Image grid — right, full height */}
        <div className="flex-1 overflow-hidden">
          <ImageGrid />
        </div>
      </div>

      {/*
        ── TABLET layout (sm–lg) ────────────────────────────────────────────
        Content stacked above a 3-column image grid banner
      */}
      <div className="hidden sm:flex lg:hidden flex-col min-h-screen">
        {/* Content */}
        <div className="flex-1">
          <ContentPane />
        </div>

        {/* Image banner — 3 cols, fixed height */}
        <div className="w-full h-[280px] overflow-hidden">
          <ImageGrid />
        </div>
      </div>

      {/*
        ── MOBILE layout (< sm) ─────────────────────────────────────────────
        Single column, no image grid shown (matches design — image not visible
        in the mobile mockup)
      */}
      <div className="flex sm:hidden flex-col min-h-screen">
        <div className="flex-1">
          <ContentPane />
        </div>
      </div>
    </>
  );
}
