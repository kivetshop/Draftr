import Countdown from "./components/Countdown";
import WaitlistForm from "./components/WaitlistForm";
import ImageGrid from "./components/ImageGrid";
import { XIcon, LinkedInIcon, GitHubIcon } from "./components/SocialIcons";

/* ─── Avatar Stack ──────────────────────────────────────────────────────── */
function AvatarStack() {
  const avatars = [
    { bg: "#5a7a6a", initial: "A" },
    { bg: "#4a6a8a", initial: "B" },
    { bg: "#6a5a8a", initial: "C" },
  ];
  return (
    <div className="flex items-center">
      {avatars.map(({ bg, initial }, i) => (
        <div
          key={i}
          className="
            w-9 h-9 rounded-full
            border-2 border-[#f5f5f5]
            flex items-center justify-center
            text-white text-[11px] font-bold
            -mr-2 last:mr-0
          "
          style={{ backgroundColor: bg, zIndex: i }}
        >
          {initial}
        </div>
      ))}
    </div>
  );
}

/* ─── Social Links ──────────────────────────────────────────────────────── */
function SocialLinks({ centered = false }: { centered?: boolean }) {
  const links = [
    { href: "#", icon: <XIcon size={18} />, label: "X (Twitter)" },
    { href: "#", icon: <LinkedInIcon size={24} />, label: "LinkedIn" },
    { href: "#", icon: <GitHubIcon size={18} />, label: "GitHub" },
  ];

  return (
    <div
      className={`flex items-center gap-3 ${centered ? "flex-col" : "flex-row"}`}
    >
      <span
        className="
          text-[10px] font-bold tracking-[0.18em]
          gradient-text
        "
      >
        REACH US
      </span>
      <div className="flex items-center gap-3">
        {links.map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="text-[#1a1a1a] hover:opacity-80 transition-opacity"
          >
            {icon}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── Content Pane ──────────────────────────────────────────────────────── */
function ContentPane() {
  return (
    /*
     * Dashed border rectangle — matches the design exactly.
     * The box uses a dashed stroke on all four sides.
     */
    <div className="dashed-box bg-white/40 p-7 sm:p-9 flex flex-col gap-5">
      {/* Logo */}
      <div>
        <span
          className="gradient-text text-xl sm:text-2xl font-bold"
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
          <span className="font-bold gradient-text">305+</span>{" "}
          others on the waitlist
        </p>
      </div>

      {/* Headline */}
      <div>
        <h1
          className="
            gradient-text
            font-bold leading-[1.25]
            text-2xl sm:text-3xl md:text-[2rem]
          "
          style={{ fontFamily: "var(--font-zen-dots)" }}
        >
          Ship your MVP in days, not months.
          <br />
          <span className="text-xl sm:text-2xl md:text-[1.65rem]">
            Launching Soon
          </span>
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

/*
 * ─── Dashed column guides ───────────────────────────────────────────────────
 * In the design there are two thin vertical dashed lines flanking the content
 * on both sides (visible in the left content pane). We render them as
 * absolutely-positioned pseudo-columns.
 */
function DashedColumns() {
  return (
    <>
      {/* Left guide */}
      <div
        className="absolute top-0 bottom-0 left-6 w-px pointer-events-none hidden lg:block"
        style={{ borderLeft: "1.5px dashed #d0d0d0" }}
      />
      {/* Right guide (left pane edge) */}
      <div
        className="absolute top-0 bottom-0 right-6 w-px pointer-events-none hidden lg:block"
        style={{ borderLeft: "1.5px dashed #d0d0d0" }}
      />
    </>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      {/* ── DESKTOP (lg+): side-by-side ───────────────────────────────────── */}
      <div className="hidden lg:flex h-screen overflow-hidden relative">
        <DashedColumns />

        {/* Left — content */}
        <div className="w-[48%] flex-shrink-0 flex flex-col justify-center px-10 py-10 relative">
          {/* Horizontal dashed rules top & bottom of content area */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ borderTop: "1.5px dashed #d0d0d0" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ borderBottom: "1.5px dashed #d0d0d0" }}
          />
          <ContentPane />
        </div>

        {/* Right — image mosaic */}
        <div className="flex-1 overflow-hidden">
          <ImageGrid />
        </div>
      </div>

      {/* ── TABLET (sm–lg): content above, image banner below ─────────────── */}
      <div className="hidden sm:flex lg:hidden flex-col min-h-screen">
        <div className="flex-1 px-8 py-10 relative">
          {/* Horizontal dashed line at top */}
          <div
            className="absolute top-6 left-6 right-6 h-px"
            style={{ borderTop: "1.5px dashed #d0d0d0" }}
          />
          <ContentPane />
          {/* Horizontal dashed line at bottom */}
          <div
            className="absolute bottom-6 left-6 right-6 h-px"
            style={{ borderBottom: "1.5px dashed #d0d0d0" }}
          />
        </div>
        <div className="w-full h-[280px] overflow-hidden">
          <ImageGrid />
        </div>
      </div>

      {/* ── MOBILE (< sm): single column ──────────────────────────────────── */}
      <div className="flex sm:hidden flex-col min-h-screen">
        <div className="flex-1 px-5 py-8">
          <ContentPane />
        </div>
      </div>
    </>
  );
}
