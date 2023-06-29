import { createSlice} from "@reduxjs/toolkit"
import { RootState } from "../../app/store"

export interface AccountState {
  showPasswordModal: boolean,
  loading: boolean,
}

const initialState: AccountState = {
  showPasswordModal: false,
  loading: false,
}


export const accountSlice = createSlice({
  name: "account",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    switcher: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.showPasswordModal = !state.showPasswordModal
    },
    setShowPasswordModal: (state, action) => {
        state.showPasswordModal = action.payload
    },
    setLoading: (state, action) => {
        state.loading = action.payload
    },

  },
})

export const { switcher, setShowPasswordModal, setLoading } = accountSlice.actions


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectShowPasswordModal = (state: RootState) => state.account.showPasswordModal
export const selectLoading = (state: RootState) => state.account.loading


export default accountSlice.reducer