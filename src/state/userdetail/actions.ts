import { createAction } from "@reduxjs/toolkit";
import { UserDetailResponse } from "api";

export const loadUserDetail =
  createAction<UserDetailResponse>("user-detail/load");

export const toggleEncryption =
  createAction<boolean>("user-detail/toggle-encryption");

export const toggleAutoEncryption =
  createAction<boolean>("user-detail/toggle-auto-encryption");