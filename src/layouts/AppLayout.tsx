import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "components/Sidebar";
import Appbar from "components/Appbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col justify-between">
      <div className="flex flex-grow">
        <div
          className={`px-6 py-4 ${sidebarOpen ? "block" : "hidden"} md:block`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>
        <div
          className={`flex-1 md:px-10 px-5 py-4 ${
            sidebarOpen ? "hidden" : "block"
          }`}
        >
          <Appbar />
          <Suspense fallback={<></>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      {!sidebarOpen && (
        <button
          className="py-6 border-t w-full md:hidden fixed bottom-0 left-0 bg-white z-50 bg-white"
          onClick={() => setSidebarOpen(true)}
        >
          Open Sidebar
        </button>
      )}
    </div>
  );
}
