import { createAction } from "@reduxjs/toolkit";
import { RootResponse } from "api";

export const fetchContent = createAction<RootResponse>(
  "dashboard/fetch-content"
);
