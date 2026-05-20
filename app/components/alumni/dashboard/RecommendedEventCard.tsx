"use client";

import { Calendar, MapPin, Users } from "lucide-react";

export default function RecommendedEventCard() {
  // TODO: Replace with actual data from API
  const event = {
    title: "Workshop Web Development",
    date: "25 Mei 2026",
    time: "09:00 - 12:00",
    location: "Aula Utama",
    participants: 45,
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Event Rekomendasi</h3>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
          Trending
        </span>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 mb-3">
        <h4 className="font-bold text-slate-800 mb-2">{event.title}</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar size={14} />
            <span>{event.date} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Users size={14} />
            <span>{event.participants} peserta terdaftar</span>
          </div>
        </div>
      </div>

      <button className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition">
        Daftar Sekarang
      </button>
    </div>
  );
}
