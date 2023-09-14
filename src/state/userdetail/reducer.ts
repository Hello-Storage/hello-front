import { createReducer } from "@reduxjs/toolkit";
import {
  loadUserDetail,
  toggleEncryption,
  toggleAutoEncryption,
} from "./actions";

interface UserDetail {
  storageUsed: number;
  storageAvailable: number;
  encryptionEnabled?: boolean;
  autoEncryptionEnabled: boolean;
}

const getLocalStorageOrDefault = (
  key: string,
  defaultValue: boolean
): boolean => {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) {
    return defaultValue;
  }
  return storedValue === "true";
};

const initialState: UserDetail = {
  storageUsed: 0,
  storageAvailable: 10 * 1024 * 1024 * 1024, // 100 GB
  encryptionEnabled: getLocalStorageOrDefault("encryptionEnabled", true),
  autoEncryptionEnabled: getLocalStorageOrDefault("autoEncryption", true),
};

export default createReducer<UserDetail>(initialState, (builder) => {
  builder
    .addCase(loadUserDetail, (state, { payload }) => ({
      ...state,
      storageUsed: payload.storage_used,
    }))
    .addCase(toggleEncryption, (state, { payload }) => {
      // If encryption is disabled, don't enable autoEncryption
      state.encryptionEnabled = payload;
      if (!payload) {
        state.autoEncryptionEnabled = false;
        localStorage.setItem("autoEncryption", "false");
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
