import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@styles/index.scss";
import Providers from "providers";
import { LanguageProvider } from "languages/LanguageProvider";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <Providers>
        <App />
      </Providers>
    </LanguageProvider>
  </React.StrictMode>
);
