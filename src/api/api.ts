import axios from "axios";
import { toast } from "react-toastify";
import state from "state";
import { logoutUser } from "state/user/actions";

// Create an instance of axios
export const Api = axios.create({
	baseURL: import.meta.env.VITE_API_ENDPOINT,
	headers: {
		"Content-Type": "application/json",
		// "Cross-Origin-Opener-Policy": "same-origin",
	},
	maxBodyLength: 5 * 1024 * 1024 * 1024, // 5GB
});

Api.interceptors.response.use(
	(res) => res,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(err: any) => {
		console.log(err.response);
		const error = err.response?.data.error;
		if (
			error &&
			err.response?.status === 401 &&
			[
				"authorization header is not provided",
				"token has expired",
			].includes(error) && !(document.location.pathname.endsWith("/login") || document.location.pathname.endsWith("/stats"))
		) {
			if (localStorage.getItem("access_token")) {
				toast.error("Session Expired")
				localStorage.removeItem("access_token")
			}
			state.dispatch(logoutUser());
		}
		return Promise.reject(err);
	}
);

export { default as setAuthToken } from "./setAuthToken";
