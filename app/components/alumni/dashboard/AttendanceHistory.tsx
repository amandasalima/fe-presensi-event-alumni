"use client";

import { CheckCircle, Calendar } from "lucide-react";

export default function AttendanceHistory() {
  // TODO: Replace with actual data from API
  const history = [
    {
      id: 1,
      event: "Seminar Kewirausahaan",
      date: "20 Mei 2026",
      time: "09:00",
      status: "hadir",
    },
    {
      id: 2,
      event: "Workshop Design Thinking",
      date: "18 Mei 2026",
      time: "13:30",
      status: "hadir",
    },
    {
      id: 3,
      event: "Webinar Digital Marketing",
      date: "15 Mei 2026",
      time: "10:00",
      status: "hadir",
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Riwayat Kehadiran</h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-slate-800 text-sm">{item.event}</h4>
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar size={12} />
              <span>{item.date} • {item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
