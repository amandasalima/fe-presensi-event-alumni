"use client";

export default function AdminHeader({
  title,
}: {
  title: string;
}) {
  return (
    <header className="h-24 bg-white border-b flex items-center justify-between px-10 sticky top-0 z-40 shadow-sm">
      <h2 className="text-4xl font-bold text-gray-800">
        {title}
      </h2>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-2xl px-5 py-3 w-96">
          <input
            type="text"
            placeholder="Search Here..."
            className="bg-transparent outline-none w-full"
          />
        </div>

        {/* Notification */}
        <button className="relative text-2xl">
          🔔
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h4 className="font-semibold text-gray-700">
              Administrator
            </h4>

            <p className="text-sm text-gray-400">
              Admin
            </p>
          </div>

          <div className="w-14 h-14 rounded-full bg-linear-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xl">
            A
          </div>
        </div>
      </div>
    </header>
  );
}