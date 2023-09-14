import { lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppLayout } from "layouts";

import "react-toastify/dist/ReactToastify.css";
import { setAuthToken } from "api";
import { useAuth } from "hooks";
import PrivateRoute from "components/PrivateRoute";
import state, { useAppSelector } from "state";
import { logoutUser } from "state/user/actions";

const Home = lazy(() => import("pages/Home"));
const Dashboard = lazy(() => import("pages/Dashboard"));
const MyStorage = lazy(() => import("pages/MyStorage"));
const Shared = lazy(() => import("pages/Shared"));
const Recent = lazy(() => import("pages/Recent"));
const Deleted = lazy(() => import("pages/Deleted"));
const Migration = lazy(() => import("pages/Migration"));
const Api = lazy(() => import("pages/Api"));

const Login = lazy(() => import("pages/Auth/Login"));

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
      <Routes>
        <Route path="/" element={<PrivateRoute component={AppLayout} />}>
          <Route index element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-storage" element={<MyStorage />} />
          <Route path="/folder/*" element={<MyStorage />} />
          <Route path="/shared-with-me" element={<Shared />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/deleted" element={<Deleted />} />
          <Route path="/migration" element={<Migration />} />
          <Route path="/api" element={<Api />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
