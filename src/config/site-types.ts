export interface SiteConfig {
  brandName: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
  socialProofCount: string;
  socialProofText: string;
  profiles: string[];
  githubRepo: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandName: "Draftr.",
  headlineLine1: "Ship your MVP in days, not months.",
  headlineLine2: "Launching Soon",
  subtitle:
    "The all-in-one developer workspace designed to turn raw product ideas into production-ready software. Join the early waitlist for 40% off at launch.",
  socialProofCount: "305+",
  socialProofText: "others on the waitlist",
  profiles: [
    "https://i.pravatar.cc/80?img=68",
    "https://i.pravatar.cc/80?img=15",
    "https://i.pravatar.cc/80?img=33",
  ],
  githubRepo: "kivetshop/Draftr",
};