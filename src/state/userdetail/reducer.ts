import { createReducer } from "@reduxjs/toolkit";
import { loadUserDetail, toggleEncryption, toggleAutoEncryption } from "./actions";

interface UserDetail {
  storageUsed: number;
  storageAvailable: number;
  encryptionEnabled?: boolean;
  autoEncryptionEnabled: boolean;
}

const initialState: UserDetail = {
  storageUsed: 0,
  storageAvailable: 100 * 1024 * 1024 * 1024, // 100 GB
  encryptionEnabled: localStorage.getItem("encryptionEnabled") === "true" ? true : true,
  autoEncryptionEnabled: localStorage.getItem("autoEncryption") === "true" ? true : true,
};

export default createReducer<UserDetail>(initialState, (builder) => {
  builder
    .addCase(loadUserDetail, (state, { payload }) => ({
      ...state,
      storageUsed: payload.storage_used,
    }))
    .addCase(toggleEncryption, (state, { payload }) => {
      state.encryptionEnabled = payload;
      if (!payload) {
        state.autoEncryptionEnabled = false;
      }
      localStorage.setItem("encryptionEnabled", payload.toString());
      return state;
    })
    .addCase(toggleAutoEncryption, (state, { payload }) => {
      const newState = {
        ...state,
        autoEncryptionEnabled: payload,
      };
      localStorage.setItem("autoEncryption", payload.toString());
      return newState;
    });
});
