import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

import userReducer from "./user/reducer";
import userdetailReducer from "./userdetail/reducer";
import mystorageReducer from "./mystorage/reducer";
import uploadstatusReducer from "./uploadstatus/reducer";

import storage from "redux-persist/es/storage";
import {persistStore, persistReducer} from "redux-persist";

const mystoragePersistConfig = {
  key: 'mystorage',
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
  userdetail: userdetailReducer,
  mystorage: persistReducer(mystoragePersistConfig, mystorageReducer),
  uploadstatus: uploadstatusReducer,
});



export const state = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),

  devTools: import.meta.env.MODE !== "production",
});

export type AppState = ReturnType<typeof state.getState>;
export type AppDispatch = typeof state.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export const persistor = persistStore(state);

export default state;
