import { createReducer } from "@reduxjs/toolkit";
import { loadUserDetail } from "./actions";

interface UserDetail {
  storageUsed: number;
  storageAvailable: number;
}

const initialState: UserDetail = {
  storageUsed: 0,
  storageAvailable: 100 * 1024 * 1024 * 1024, // 100 GB
};

export default createReducer<UserDetail>(initialState, (builder) => {
  builder.addCase(loadUserDetail, (state, { payload }) => ({
    ...state,
    storageUsed: payload.storage_used,
  }));
});
