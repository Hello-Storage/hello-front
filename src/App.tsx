import { lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Providers from "providers";
import { AppLayout } from "layouts";

import "react-toastify/dist/ReactToastify.css";
import { setAuthToken } from "api";
import { useAuth } from "hooks";
import PrivateRoute from "components/PrivateRoute";
import state from "state";
import { logoutUser } from "state/user/actions";

const Home = lazy(() => import("pages/Home"));
const Login = lazy(() => import("pages/auth/Login"));

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
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PrivateRoute component={AppLayout} />}>
            <Route index element={<Home />} />
          </Route>

          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
