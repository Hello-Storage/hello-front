import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "layouts";

import "react-toastify/dist/ReactToastify.css";
import { setAuthToken } from "api";
import { useAuth } from "hooks";
import PrivateRoute from "components/PrivateRoute";
import state from "state";
import { logoutUser } from "state/user/actions";

import { Spinner3 } from "components/Spinner";

import { Navigate } from "react-router-dom";


const Dashboard = lazy(() => import("pages/Dashboard"));
const MyStorage = lazy(() => import("pages/MyStorage"));
const Referrals = lazy(() => import("pages/Referrals"));
const Shared = lazy(() => import("pages/Shared"));
const Recent = lazy(() => import("pages/Recent"));
const Deleted = lazy(() => import("pages/Deleted"));
const Migration = lazy(() => import("pages/Migration"));
const Api = lazy(() => import("pages/Api"));

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
  const { load } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      setAuthToken(token);
    }

    load();
    // log user out from all tabs if they log out in one tab
    window.addEventListener("storage", () => {
      if (!localStorage.token) state.dispatch(logoutUser());
    });
  }, []);

  return (
    <BrowserRouter>
      <TrackPageViews />
      <Suspense fallback={<Spinner3 />}>
        <Routes>
          <Route path="/" element={<Navigate to="/space/my-storage" replace />} />
          <Route path="/space" element={<PrivateRoute component={AppLayout} />}>
            <Route index element={<Api />} />
            <Route path ="/space/shared/public/:hash" element={<Shared shareType="public" />} />
            <Route path="/space/dashboard" element={<Dashboard />} />
            <Route path="/space/my-storage" element={<MyStorage />} />
            <Route path="/space/folder/*" element={<MyStorage />} />
            <Route path="/space/shared-with-me" element={<Shared shareType="public" />} />
            <Route path="/space/recent" element={<Recent />} />
            <Route path="/space/referrals" element={<Referrals />} />
            <Route path="/space/deleted" element={<Deleted />} />
            <Route path="/space/migration" element={<Migration />} />
          </Route>
          <Route path="/space/login" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
