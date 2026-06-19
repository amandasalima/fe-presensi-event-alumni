"use client";

import { Clock, MapPin } from "lucide-react";

export default function TodayEvents() {
  // TODO: Replace with actual data from API
  const events = [
    {
      id: 1,
      title: "Seminar Teknologi AI",
      time: "10:00 - 12:00",
      location: "Ruang Seminar A",
      status: "ongoing",
    },
    {
      id: 2,
      title: "Diskusi Alumni",
      time: "14:00 - 16:00",
      location: "Aula Utama",
      status: "upcoming",
    },
  ];

  if (events.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Event Hari Ini</h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-slate-800 text-sm">{event.title}</h4>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  event.status === "ongoing"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {event.status === "ongoing" ? "Berlangsung" : "Mendatang"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock size={12} />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin size={12} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
