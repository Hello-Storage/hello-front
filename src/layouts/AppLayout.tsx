import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "components/Sidebar";
import Appbar from "components/Appbar";
import { SearchContext } from "../contexts/SearchContext";
import { FiMenu } from "react-icons/fi";
import LogoHello from "@images/beta.png";
import getPersonalSignature from "api/getPersonalSignature";
import { useAppSelector } from "state";
import setPersonalSignature from "api/setPersonalSignature";
import { useAccount, useConnect } from "wagmi";
import getAccountType from "api/getAccountType";
import { AccountType } from "api";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const { name } = useAppSelector((state) => state.user);
  const { autoEncryptionEnabled } = useAppSelector(
    (state) => state.userdetail
  );

  const accountType = getAccountType();

  const { connector: activeConnector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  useEffect(() => {

    // Automatically connect to the first connector (assuming it's MetaMask).
    // You might want to check if it's the desired connector before connecting.
    const connectToMetaMask = async () => {
      const metaMaskConnector = connectors[0];
      if (metaMaskConnector && metaMaskConnector.ready) {
        connect({ connector: metaMaskConnector });
      }
    };


    if (accountType === AccountType.Provider && !isConnected) {
      connectToMetaMask();
    } /*else {
      alert("no web3")
      getPersonalSignature(name, autoEncryptionEnabled, accountType).then((personalSignature) => {
        if (personalSignature) {
          setPersonalSignature(personalSignature);
        } else {
          alert("no signature");
        }
      });
    }*/
  }, [connectors, isConnected, connect, name, autoEncryptionEnabled]);

  /*
  useEffect(() => {
    if (isConnected) {
      getPersonalSignature(name, autoEncryptionEnabled, accountType).then((personalSignature) => {
        if (personalSignature) {
          setPersonalSignature(personalSignature);
        } else {
          alert("no signature");
        }
      });
    }
  }, [isConnected, name, autoEncryptionEnabled]);
*/
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
        <div
          className={`fixed inset-0 bg-black opacity-50 z-10 ${sidebarOpen ? "block" : "hidden"
            } md:hidden`}
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="flex flex-grow">
          <div
            className={`w-5/6 md:w-72 z-20 bg-white ${sidebarOpen ? "block" : "hidden"
              } md:block`}
          >
            <Sidebar setSidebarOpen={setSidebarOpen} />
          </div>
          <div
            className={`flex flex-col flex-1 md:px-10 px-5 py-4 ${sidebarOpen ? "md:ml-72 overflow-hidden w-full blur-sm" : ""
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
