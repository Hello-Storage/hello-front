import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, HashRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AppLayout } from "layouts";

import "react-toastify/dist/ReactToastify.css";
import { setAuthToken } from "api";
import { useAuth } from "hooks";
import PrivateRoute from "components/PrivateRoute";

import { Spinner3 } from "components/Spinner";

import ShareSharedWithMeGroupdWithMe from "pages/Shared/SharedWithMeGroup";
import { FolderShared } from "pages/Shared/FolderShared";
import NotFound from "pages/NotFound";
import OnePage from "pages/OnePage/layouts/page";





const Dashboard = lazy(() => import("pages/Dashboard"));
const MyStorage = lazy(() => import("pages/MyStorage"));
const Referrals = lazy(() => import("pages/Referrals"));
const SharedWithMe = lazy(() => import("pages/Shared/SharedWithMe"));
const Shared = lazy(() => import("pages/Shared"));
const Recent = lazy(() => import("pages/Recent"));
const Deleted = lazy(() => import("pages/Deleted"));
const Migration = lazy(() => import("pages/Migration"));
const Api = lazy(() => import("pages/Api"));
const Statistics = lazy(() => import("pages/Statistics"));
const PrivacyPolicy = lazy(() => import("pages/PrivacyPolicy"));
const Snapshots = lazy(() => import("pages/Snapshots"));
const InvestClient = lazy(() => import("pages/InvestClients"));
const InvestStats = lazy(() => import("pages/InvestStats"));
const Settings = lazy(() => import("pages/Settings"));





const Login = lazy(() => import("pages/Auth/Login"));

const TrackPageViews = () => {
  const location = useLocation();


  useEffect(() => {
    // Check if the `dataLayer` object exists (it should be injected by the Google Tag Manager script)

    if ((window as any).dataLayer) {

      // Push a pageview event to the dataLayer
      (window as any).dataLayer.push({
        event: "page_view",
        page_path: location.pathname, // Get the current path
      });
    }
  }, [location]); // Re-run this effect when the location changes

  return null; // This component does not render anything
};


function App() {

  const [innerHeight, setInnerHeight] = useState(window.innerHeight)
  // const [innerWidth, setInnerWidth] = useState(window.innerWidth)

  useEffect(()=>{
    const handleResize = () => {
      setInnerHeight(window.innerHeight);
      // setInnerWidth(window.innerWidth)
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  },[])


  const { load, logout } = useAuth();

  const RouterMethod = import.meta.env.VITE_ROUTER === 'browser-router' ? BrowserRouter : HashRouter

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAuthToken(token);
    }
    load();


    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" && !localStorage.getItem("access_token")) {
        logout();
      } else if (window.location.pathname.includes("login") && localStorage.getItem("access_token")) {
        window.location.reload();
      }
    }
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [load, logout]);


  return (
    <RouterMethod>
     <div style={{height: `${innerHeight}px`, maxHeight:`${innerHeight}px` }} className="flex flex-col justify-between overflow-hidden">
        <TrackPageViews />
        <Suspense fallback={<Spinner3 />}>
          <Routes>
            <Route path="*" element={<Navigate to="/404" replace />} />
            <Route path="/404" element={<NotFound />} />
            <Route
              path="/"
              element={
                localStorage.getItem("access_token") ? (
                  <Navigate to="/space/my-storage" replace />
                ) : (
                  <OnePage />
                )
              }
            />
            <Route path="/invest/:code" element={<InvestClient />} />
            <Route path="/stinv-asdqwe" element={<InvestStats />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/snapshots" element={< Snapshots />} />

            <Route path="/stats" element={
              <Statistics />
            } />
            <Route path="/ns" element={<Navigate to="/space/login?ref=ns" replace />} />
            <Route path="/space" element={<PrivateRoute component={AppLayout} />}>
              <Route index element={<Api />} />
              <Route path="/space/shared/public/:hash" element={<SharedWithMe shareType="public" />} />
              <Route path="/space/shared/folder/:folderuid" element={<FolderShared />} />
              <Route path="/space/shared/group/:group_id" element={<ShareSharedWithMeGroupdWithMe />} />
              <Route path="/space/settings" element={<Settings />} />
              <Route path="/space/dashboard" element={<Dashboard />} />
              <Route path="/space/my-storage" element={<MyStorage />} />
              <Route path="/space/folder/*" element={<MyStorage />} />
              <Route path="/space/shared" element={<Shared />} />
              <Route path="/space/recent" element={<Recent />} />
              <Route path="/space/referrals" element={<Referrals />} />
              <Route path="/space/deleted" element={<Deleted />} />
              <Route path="/space/migration" element={<Migration />} />
              <Route path="/space/api" element={<Api />} />
            </Route>
            <Route path="/space/login" element={<Login />} />
          </Routes>
        </Suspense>
      </div>
    </RouterMethod>
  );
}

export default App;
