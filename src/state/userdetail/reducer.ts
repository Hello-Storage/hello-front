import { createReducer } from "@reduxjs/toolkit";
import { loadUserDetail, toggleEncryption, toggleAutoEncryption } from "./actions";

interface UserDetail {
  storageUsed: number;
  storageAvailable: number;
  encryptionEnabled?: boolean;
  autoEncryptionEnabled?: boolean;
}

const initialState: UserDetail = {
  storageUsed: 0,
  storageAvailable: 100 * 1024 * 1024 * 1024, // 100 GB
  encryptionEnabled: false,
  autoEncryptionEnabled: false,
};

export default createReducer<UserDetail>(initialState, (builder) => {
  builder.addCase(loadUserDetail, (state, { payload }) => ({
    ...state,
    storageUsed: payload.storage_used,
  }))
  .addCase(toggleEncryption, (state, { payload }) => {
    state.encryptionEnabled = payload;
    if (!payload) {
      state.autoEncryptionEnabled = false;
    }
  })
  .addCase(toggleAutoEncryption, (state, { payload }) => ({
    ...state,
    autoEncryptionEnabled: payload,
  }));
});
