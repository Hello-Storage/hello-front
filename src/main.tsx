import React from "react";
import ReactDOM from "react-dom/client";
import Files from "./components/Files.tsx";
import App from "./App.tsx";
import Sidebar from "./components/partials/Sidebar.tsx";
import "./index.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import Dashboard from "./components/Dashboard.tsx";
import Login from "./components/user/Login.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Provider store={store}>
			<Router>
				<Routes>
					<Route path="/" element={<App />} />
					<Route path="/files" element={<Files />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/login" element={<Login/>} />
				</Routes>
				<Sidebar />
			</Router>
		</Provider>
	</React.StrictMode>
);
