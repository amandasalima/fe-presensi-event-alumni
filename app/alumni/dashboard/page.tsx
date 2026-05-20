"use client";

import AlumniHeader from "@/components/alumni/AlumniHeader";
import AnnouncementBanner from "@/components/alumni/dashboard/AnnouncementBanner";
import StatsRow from "@/components/alumni/dashboard/StatsRow";
import RecommendedEventCard from "@/components/alumni/dashboard/RecommendedEventCard";
import ScanQRButton from "@/components/alumni/dashboard/ScanQRButton";
import TodayEvents from "@/components/alumni/dashboard/TodayEvents";
import UpcomingEvents from "@/components/alumni/dashboard/UpcomingEvents";
import AttendanceHistory from "@/components/alumni/dashboard/AttendanceHistory";
import { useCurrentUser } from "@/hooks/alumni/useCurrentUser";

function GreetingSection() {
  const { data: user, isLoading } = useCurrentUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : "Alumni";

  return (
    <div>
      {isLoading ? (
        <>
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-1.5" />
          <div className="h-3.5 w-56 bg-slate-200 rounded animate-pulse" />
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-slate-800">
            Assalamu&apos;alaikum, {displayName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Selamat datang di dashboard presensi Anda
          </p>
        </>
      )}
    </div>
  );
}

export default function AlumniDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <AlumniHeader />

      {/* Scrollable Content */}
      <main className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-5 pb-10">
        {/* Greeting */}
        <GreetingSection />

        {/* Announcement */}
        <AnnouncementBanner />

        {/* Stats */}
        <StatsRow />

        {/* Recommended Event */}
        <RecommendedEventCard />

        {/* Scan QR */}
        <ScanQRButton />

        {/* Today's Events */}
        <TodayEvents />

        {/* Upcoming Events */}
        <UpcomingEvents />

        {/* Attendance History */}
        <AttendanceHistory />
      </main>
    </div>
  );
}