import { createSlice } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"

export interface AccountState {
    showPasswordModal: boolean,
    loading: boolean,
    address: string | null,
    customToken: string | null,
    toastMessage: string | null,
    showToast: boolean,
    selectedPage: string | null,
    destiny: string | null,
    redirectTo: string | null,
    datacap: number | null,
    usedStorage: number | null,
    uploadedFilesCount: number,
}

const initialState: AccountState = {
    showPasswordModal: false,
    loading: false,
    address: null,
    toastMessage: null,
    showToast: false,
    customToken: localStorage.getItem('customToken') || null,
    selectedPage: localStorage.getItem('selectedPage') || null,
    destiny: null,
    redirectTo: null,
    datacap: null,
    usedStorage: null,
    uploadedFilesCount: 0,
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
        setAddress: (state, action) => {
            state.address = action.payload
        },
        setShowToast: (state, action) => {
            state.showToast = action.payload
        },
        setToastMessage: (state, action) => {
            state.toastMessage = action.payload
        },
        setCustomToken: (state, action) => {
            state.customToken = action.payload
            localStorage.setItem('customToken', action.payload)
        },
        removeCustomToken: (state) => {
            state.customToken = null
            localStorage.removeItem('customToken')
        },
        setSelectedPage: (state, action) => {
            state.selectedPage = action.payload
            localStorage.setItem('selectedPage', action.payload)
        },
        setDestiny: (state, action) => {
            state.destiny = action.payload
        },
        setRedirectTo: (state, action) => {
            state.redirectTo = action.payload
        },
        setDatacap: (state, action) => {
            state.datacap = action.payload
        },
        setUsedStorage: (state, action) => {
            state.usedStorage = action.payload
        },
        setUploadedFilesCount: (state, action) => {
            state.uploadedFilesCount = action.payload
        },

    },
})

export const { switcher,
    setShowPasswordModal,
    setLoading,
    setAddress,
    setShowToast,
    setToastMessage,
    setCustomToken,
    setSelectedPage,
    setDestiny,
    setRedirectTo,
    setDatacap,
    removeCustomToken,
    setUsedStorage,
    setUploadedFilesCount } = accountSlice.actions


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectShowPasswordModal = (state: RootState) => state.account.showPasswordModal
export const selectLoading = (state: RootState) => state.account.loading
export const selectAddress = (state: RootState) => state.account.address
export const selectToastMessage = (state: RootState) => state.account.toastMessage
export const selectShowToast = (state: RootState) => state.account.showToast
export const selectCustomToken = (state: RootState) => state.account.customToken
export const selectSelectedPage = (state: RootState) => state.account.selectedPage
export const selectDestiny = (state: RootState) => state.account.destiny
export const selectRedirectTo = (state: RootState) => state.account.redirectTo
export const selectDatacap = (state: RootState) => state.account.datacap
export const selectUsedStorage = (state: RootState) => state.account.usedStorage
export const selectUploadedFilesCount = (state: RootState) => state.account.uploadedFilesCount


export default accountSlice.reducer