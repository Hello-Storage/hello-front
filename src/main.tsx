import React from "react";
import ReactDOM from "react-dom/client";
import Files from "./components/Files.tsx";
import App from "./App.tsx";
import Sidebar from "./components/Sidebar.tsx";
import "./index.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Provider store={store}>
			<Router basename="/">
				<Sidebar />
				<Routes>
          <Route path="/" element={<App />} />
					<Route path="/files" element={<Files />} />
				</Routes>
			</Router>
		</Provider>
	</React.StrictMode>
);
