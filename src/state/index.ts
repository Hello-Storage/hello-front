import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

import userReducer from "./user/reducer";
import userdetailReducer from "./userdetail/reducer";
import mystorageReducer from "./mystorage/reducer";

const rootReducer = combineReducers({
  user: userReducer,
  userdetail: userdetailReducer,
  mystorage: mystorageReducer,
});

export const state = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE !== "production",
});

export type AppState = ReturnType<typeof state.getState>;
export type AppDispatch = typeof state.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export default state;
