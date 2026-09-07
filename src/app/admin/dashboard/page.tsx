import { Suspense } from "react";
import Link from "next/link";
import { fetchAllDatabasePages } from "@/lib/notion";
import { aggregateAnalytics } from "@/lib/analytics";
import DashboardShell from "@/app/components/DashboardShell";
import GitHubStarButton from "@/app/components/GitHubStarButton";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-100 border border-slate-200 rounded-xl h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-100 border border-slate-200 rounded-xl h-64" />
        <div className="bg-slate-100 border border-slate-200 rounded-xl h-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-100 border border-slate-200 rounded-xl h-48" />
        <div className="bg-slate-100 border border-slate-200 rounded-xl h-48" />
      </div>
    </div>
  );
}

async function DashboardData() {
  const apiKey = process.env.NOTION_API_KEY ?? "";
  const databaseId = process.env.NOTION_DATABASE_ID ?? "";

  let errorMsg: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null;

  try {
    const pages = await fetchAllDatabasePages(databaseId, apiKey);
    data = aggregateAnalytics(pages);
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to load data.";
  }

  if (errorMsg) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Could not load Notion data</p>
          <p className="text-slate-500 text-sm max-w-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return <DashboardShell data={data} />;
}

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            title="Return to Waitlist Homepage"
            className="text-lg font-bold text-slate-900 hover:opacity-75 transition-opacity inline-flex items-center group cursor-pointer"
            style={{ fontFamily: "var(--font-zen-dots, monospace)" }}
          >
            Draftr<span className="text-orange-500">.</span>
          </Link>
          <span className="text-xs text-slate-500 border border-slate-300 px-2 py-0.5 rounded-full font-medium bg-slate-100">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <GitHubStarButton />
          <form action="/admin/dashboard" method="GET">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors bg-white shadow-2xs"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </form>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Waitlist Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics, audience management, countdown timer, and email broadcasts.
          </p>
        </div>
        <Suspense fallback={<Skeleton />}>
          <DashboardData />
        </Suspense>
      </main>
    </div>
  );
}