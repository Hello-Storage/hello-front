import { Suspense, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "components/Sidebar";
import Appbar from "components/Appbar";
import { SearchContext } from "../contexts/SearchContext";
import { FiMenu } from "react-icons/fi";
import LogoHello from "@images/beta.png";
import { useAppSelector } from "state";
import { useAccount, useConnect } from "wagmi";
import getAccountType from "api/getAccountType";
import { AccountType } from "api";
import useTitle from "hooks/useTitle";
import { Theme } from "state/user/reducer";

export default function AppLayout() {

  useTitle("hello.app | Space");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { name } = useAppSelector((state) => state.user);
  const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);

  const accountType = getAccountType();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { connector: activeConnector, isConnected } = useAccount();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

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

	const {theme} = useAppSelector((state) => state.user);

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div style={{fontFamily: "SF Mono", height: "100%"}} className="flex flex-col justify-between">
        {!sidebarOpen && (
          <div className={"sticky flex items-center justify-between w-full px-5 py-2 lg:hidden"+(theme===Theme.DARK? " dark-theme4" : " bg-gray-100")}>
            <div className="flex items-center gap-3">
              <Link to="/space/my-storage" className="text-xl font-semibold font-[Outfit]">
                hello.app
              </Link>
              <img src={LogoHello} alt="beta" className="w-10 h-5" />
            </div>
            
          <a href="https://www.linkedin.com/posts/alvaropintado_álvaro-pintado-ceo-de-helloapp-anuncia-activity-7179024480378175488-DD73?utm_source=share&utm_medium=member_android" target="_blank">
            <button className={"flex items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm "
              + (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}>              
                Join Our Crowfunding
            </button>
          </a>
            <button onClick={() => setSidebarOpen(true)}>
              <div className={"p-1 border rounded-xl"+(theme===Theme.DARK? " dark-theme3" : " bg-white")}>
                <FiMenu size={24} />
              </div>
            </button>
          </div>
        )}
        <div
          className={`fixed inset-0 bg-black opacity-50 z-10 ${
            sidebarOpen ? "block" : "hidden"
          } lg:hidden`}
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="flex flex-grow lg:h-screen" style={{
          height: "calc(100vh - 50px)"
        }}>
          <div
            className={`overflow-y-auto w-5/6 md:w-72 z-20 bg-white ${
              sidebarOpen ? "block" : "hidden"
            } lg:block`}
          >
            <Sidebar setSidebarOpen={setSidebarOpen} />
          </div>
          <div

            className={`flex flex-col flex-1 md:px-10 px-5 py-4 overflow-y-auto h-full ${(theme===Theme.DARK? " dark-theme" : "")} ${
              sidebarOpen ? "md:ml-72 overflow-hidden w-full blur-sm" : ""
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
