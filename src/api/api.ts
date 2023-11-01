import axios from "axios";
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
  (err: any) => {
    const error=err.response?.data.error
    if (err.response?.status === 401 && error && error==="authorization header is not provided") {
      console.error("Axios error: ",error );// the error will still be received from wherever the call is made, I think it is unnecessary to print it here
      // dispatch logout
      state.dispatch(logoutUser()); // this is throwing errors
    }
    return Promise.reject(err);
  }
);

export { default as setAuthToken } from "./setAuthToken";
