import axios from "axios";
import { toast } from "react-toastify";
import state from "state";
import { logoutUser } from "state/user/actions";

// Create an instance of axios
export const Api = axios.create({
	baseURL: import.meta.env.VITE_API_ENDPOINT,
	headers: {
		"Content-Type": "application/json",
	},
	maxBodyLength: 5 * 1024 * 1024 * 1024, // 5GB
});

Api.interceptors.response.use(
	(res) => res,
	(err: any) => {
		const error = err.response?.data.error;
		if (
			error &&
			err.response?.status === 401 &&
			[
				"authorization header is not provided",
				"token has expired",
			].includes(error)
		) {
			if (localStorage.getItem("access_token") &&
				!(document.location.pathname.endsWith("/login") || document.location.pathname.endsWith("/stats"))) {
				toast.error("Session Expired")
				localStorage.removeItem("access_token")
			}
			state.dispatch(logoutUser());
		}
		return Promise.reject(err);
	}
);

export { default as setAuthToken } from "./setAuthToken";
