import { createAction } from "@reduxjs/toolkit";
import { LoadUserResponse } from "api";

export const loadUser = createAction<LoadUserResponse>("user/load");
export const logout = createAction("user/logout");
