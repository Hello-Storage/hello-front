import { createAction } from "@reduxjs/toolkit";
import { Folder, RootResponse } from "api";

export const fetchContent = createAction<RootResponse>(
  "dashboard/fetch-content"
);

export const createFolder = createAction<Folder>("dashboard/create-folder");

export const openDropdown = createAction<string>("dashboard/open-dropdown");
export const closeDropdown = createAction("dashboard/close-dropdown");
