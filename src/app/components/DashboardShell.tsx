"use client";

import { useState } from "react";
import { BarChart2, Users, Send } from "lucide-react";
import WaitlistDashboard from "@/app/components/WaitlistDashboard";
import AudienceTable from "@/app/components/AudienceTable";
import BroadcastPanel from "@/app/components/BroadcastPanel";
import type { AnalyticsPayload } from "@/lib/analytics";

const TABS = [
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "audience",  label: "Audience",  icon: Users     },
  { id: "broadcast", label: "Broadcast", icon: Send      },
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
            {id === "broadcast" && (
              <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded font-semibold ml-0.5">
                Resend
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "analytics" && <WaitlistDashboard {...dashboardData} />}
      {tab === "audience"  && <AudienceTable initialSubscribers={subscribers} />}
      {tab === "broadcast" && <BroadcastPanel subscribers={subscribers} />}
    </div>
  );
}