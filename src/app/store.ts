import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import counterReducer from "../features/counter/counterSlice.ts"
import accountReducer from "../features/counter/accountSlice.ts"
import filesReducer from "../features/files/dataSlice.ts"

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    account: accountReducer,
    files: filesReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>