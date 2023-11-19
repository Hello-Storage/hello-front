import { createReducer } from "@reduxjs/toolkit";

import { loadUser, loadingUser, loadUserFail, logoutUser, setRedirectUrl } from "./actions";

export interface User {
  uid: string;
  name: string;
  role: string;
  walletAddress: string;
  authenticated: boolean;
  loading: boolean;
  redirectUrl?: string;
  message?: string;
}

const initialState: User = {
  uid: "",
  name: "",
  role: "",
  walletAddress: "",
  authenticated: false,
  loading: true,
  redirectUrl: undefined,
  message: undefined,
};

export default createReducer<User>(initialState, (builder) => {
  builder
    .addCase(loadingUser, (state) => ({
      ...state,
      loading: true,
    }))
    .addCase(loadUser, (state, { payload }) => ({
      ...state,
      ...payload,
      authenticated: true,
      loading: false,
    }))
    .addCase(loadUserFail, (state) => ({
      ...state,
      loading: false,
    }))
    .addCase(logoutUser, (state) => (
      console.log("logged out user"),
      {
      ...initialState,
      redirectUrl: state.redirectUrl,
      loading: false,
    }))
    .addCase(setRedirectUrl, (state, { payload } ) => (
      {
      ...state,
      redirectUrl: payload,
    }));
});
