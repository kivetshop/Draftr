"use client";

import { useState } from "react";
import { BarChart2, Users } from "lucide-react";
import WaitlistDashboard from "@/app/components/WaitlistDashboard";
import AudienceTable from "@/app/components/AudienceTable";
import type { AnalyticsPayload } from "@/lib/analytics";

const TABS = [
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "audience",  label: "Audience",  icon: Users    },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  data: AnalyticsPayload;
}

export default function DashboardShell({ data }: Props) {
  const [tab, setTab] = useState<TabId>("analytics");
  const { subscribers, ...dashboardData } = data;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "analytics" && <WaitlistDashboard {...dashboardData} />}
      {tab === "audience"  && <AudienceTable initialSubscribers={subscribers} />}
    </div>
  );
}