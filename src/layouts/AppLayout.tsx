import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "components/Sidebar";
import Appbar from "components/Appbar";

export default function AppLayout() {
  return (
    <div className="flex h-screen">
      <div className="p-6">
        <Sidebar />
      </div>
      <div className="flex-1 px-10 py-4">
        <Appbar />
        <Suspense fallback={<></>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
