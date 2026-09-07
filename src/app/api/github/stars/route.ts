import { NextResponse } from "next/server";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  const repo = "kivetshop/Draftr";
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Draftr-Waitlist-App",
      },
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        stars: typeof data.stargazers_count === "number" ? data.stargazers_count : null,
        repoUrl: `https://github.com/${repo}`,
      });
    }
  } catch (e) {
    console.error("Failed to fetch github stars:", e);
  }

  // No mock numbers — return null if repo is private or unstarred
  return NextResponse.json({
    stars: null,
    repoUrl: `https://github.com/${repo}`,
  });
}