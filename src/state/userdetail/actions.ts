import { createAction } from "@reduxjs/toolkit";
import { UserDetailResponse } from "api";

export const loadUserDetail =
  createAction<UserDetailResponse>("user-detail/load");
