import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Providers from "Providers";
import { AppLayout } from "layouts";
import { API_ENDPOINT } from "config";

import "react-toastify/dist/ReactToastify.css";

const Home = lazy(() => import("pages/Home"));

function App() {
  console.log(API_ENDPOINT);
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
