import axios, { AxiosError } from "axios";
import state from "state";
import { logout } from "state/user/actions";

// Create an instance of axios
export const Api = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

Api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      // dispatch logout
      state.dispatch(logout());
    }
    return Promise.reject(err);
  }
);
