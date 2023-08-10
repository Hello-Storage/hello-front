import { createReducer } from "@reduxjs/toolkit";

import { loadUser, logout } from "./actions";

interface User {
  uid: string;
  name: string;
  role: string;
  walletAddress: string;
  authenticated: boolean;
}

const initialState: User = {
  uid: "",
  name: "",
  role: "",
  walletAddress: "",
  authenticated: false,
};

export default createReducer<User>(initialState, (builder) => {
  builder
    .addCase(loadUser, (state, { payload }) => ({
      ...state,
      ...payload,
      authenticated: true,
    }))
    .addCase(logout, (state) => ({
      ...state,
      authenticated: false,
    }));
});
