import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "components/Sidebar";
import Appbar from "components/Appbar";
import { SearchContext } from "../contexts/SearchContext";
import { FiMenu } from "react-icons/fi";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="flex h-screen flex-col justify-between">
        {!sidebarOpen && (
          <button
            className="md:hidden right-4 top-4 absolute"
            onClick={() => setSidebarOpen(true)}
          >
            <div className="bg-white p-1 border rounded-xl">
              <FiMenu size={24} />
            </div>
          </button>
        )}
        <div className="flex flex-grow">
          <div
            className={`px-6 py-4 ${sidebarOpen ? "block" : "hidden"} md:block`}
          >
            <Sidebar setSidebarOpen={setSidebarOpen} />
          </div>
          <div
            className={`flex flex-col flex-1 md:px-10 px-5 py-4 ${
              sidebarOpen ? "hidden" : "block"
            }`}
          >
            <Appbar onSearchChange={(e) => setSearchTerm(e.target.value)} />
            <Suspense fallback={<></>}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
