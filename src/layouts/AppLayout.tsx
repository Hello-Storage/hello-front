import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "components/Sidebar";
import Appbar from "components/Appbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <div className={`p-6 ${sidebarOpen ? "block" : "hidden"} md:block`}>
        <Sidebar setSidebarOpen={setSidebarOpen} />
      </div>
      <div className={`flex-1 px-10 py-4 ${sidebarOpen ? "hidden" : "block"}`}>
        <button onClick={() => setSidebarOpen(true)}>Open Sidebar</button>
        <Appbar />
        <Suspense fallback={<></>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
