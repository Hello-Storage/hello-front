import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "components/Sidebar";
import Appbar from "components/Appbar";
import { SearchContext } from "../contexts/SearchContext";
import { FiMenu } from "react-icons/fi";
import LogoHello from "@images/beta.png";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="flex h-screen flex-col justify-between">
        {!sidebarOpen && (
          <div className="flex items-center justify-between sticky px-5 py-2 w-full bg-gray-100 md:hidden">
            <div className="flex items-center gap-3">
              <label className="text-xl font-semibold font-[Outfit]">
                Hello.storage
              </label>
              <img src={LogoHello} alt="beta" className="w-10 h-5" />
            </div>
            <button onClick={() => setSidebarOpen(true)}>
              <div className="bg-white p-1 border rounded-xl">
                <FiMenu size={24} />
              </div>
            </button>
          </div>
        )}
        <div className="flex flex-grow">
          <div
            className={`w-full md:w-72 ${
              sidebarOpen ? "block" : "hidden"
            } md:block`}
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
