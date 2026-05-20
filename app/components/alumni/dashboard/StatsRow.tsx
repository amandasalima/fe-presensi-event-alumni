"use client";

import { Calendar, CheckCircle, Clock } from "lucide-react";

export default function StatsRow() {
  // TODO: Replace with actual data from API
  const stats = [
    { label: "Event Dihadiri", value: "12", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Event Mendatang", value: "3", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Jam Kehadiran", value: "48", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-xl p-3 border border-slate-200">
          <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
            <stat.icon size={16} className={stat.color} />
          </div>
          <p className="text-lg font-bold text-slate-800">{stat.value}</p>
          <p className="text-xs text-slate-500 leading-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
