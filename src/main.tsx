import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@styles/index.scss";
import Providers from "providers";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  // </React.StrictMode>
);
