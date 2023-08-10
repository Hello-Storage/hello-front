import { lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Providers from "providers";
import { AppLayout } from "layouts";

import "react-toastify/dist/ReactToastify.css";
import { setAuthToken } from "api";
import { useAuth } from "hooks";

const Home = lazy(() => import("pages/Home"));
const Login = lazy(() => import("pages/auth/Login"));

function App() {
  const { load } = useAuth();
  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      console.log("token", token);
      setAuthToken(token);
    }

    load();
  }, []);
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
          </Route>

          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
