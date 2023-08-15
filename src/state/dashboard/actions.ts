import { createAction } from "@reduxjs/toolkit";
import { RootResponse } from "api";

export const fetchContent = createAction<RootResponse>(
  "dashboard/fetch-content"
);

export const openDropdown = createAction<string>("dashboard/open-dropdown");
export const closeDropdown = createAction("dashboard/close-dropdown");