import { createReducer } from "@reduxjs/toolkit";

import { loadUser, loadingUser, loadUserFail, logout } from "./actions";

interface User {
  uid: string;
  name: string;
  role: string;
  walletAddress: string;
  authenticated: boolean;
  loading: boolean;
}

const initialState: User = {
  uid: "",
  name: "",
  role: "",
  walletAddress: "",
  authenticated: false,
  loading: true,
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
    .addCase(logout, (state) => ({
      ...state,
      authenticated: false,
    }));
});
