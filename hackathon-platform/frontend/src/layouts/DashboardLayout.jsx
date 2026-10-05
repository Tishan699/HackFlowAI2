import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090707] text-zinc-100 flex relative selection:bg-red-600 selection:text-white overflow-hidden">
      {/* Ambient Volcanic Fire Lighting */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-gradient-to-br from-red-600/10 via-orange-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[400px] bg-gradient-to-tr from-amber-900/15 via-red-950/20 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300 relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
