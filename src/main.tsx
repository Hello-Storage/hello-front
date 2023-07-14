import React from "react";
import ReactDOM from "react-dom/client";
import Files from "./components/files/Files.tsx";
import App from "./App.tsx";
import Sidebar from "./components/partials/Sidebar.tsx";
import "./index.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import Dashboard from "./components/dashboard/Dashboard.tsx";
import Login from "./components/user/Login.tsx";
import Data from "./components/Data.tsx";
import "./main.css"
import Shared from "./components/files/Shared.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Provider store={store}>
			<Router>
				<div className="app">
					<main className="main-content">
						<Routes>
							<Route path="/" element={<App />} />
							<Route path="/files" element={<Files />} />
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/data" element={<Data />} />
							<Route path="/login" element={<Login />} />
							<Route path="/login/:destiny" element={<Login />} />
							<Route path="/shared/public/:hash" element={<Shared shareType="public" />} />
						</Routes>
					</main>
					<Sidebar />
				</div>
			</Router>
		</Provider>
	</React.StrictMode>
);
