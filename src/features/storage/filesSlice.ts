import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store"
import { FileDB } from "../../types";

export interface FilesState {
    filesList: FileDB[],
    displayFilesList: FileDB[],
    encryptionTime: number,
    showShareModal: boolean,
}

const initialState: FilesState = {
    filesList: [],
    displayFilesList: [],
    encryptionTime: 0,
    showShareModal: false,
}


export const filesSlice = createSlice({
    name: "files",
    initialState,
    // The `reducers` filed lets us define reducers and generate associated actions
    reducers: {
        switcher: (state) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.showShareModal = !state.showShareModal
        },
        setFilesList: (state, action) => {
            state.filesList = action.payload
        },
        setDisplayedFilesList: (state, action) => {
            state.displayFilesList = action.payload
        },
        addFile: (state, action) => {
            state.filesList.push(action.payload)
        },
        setEncryptionTime: (state, action) => {
            state.encryptionTime = action.payload
        },
        setShowShareModal: (state, action) => {
            state.showShareModal = action.payload
        }

    }
})

export const { setFilesList, setDisplayedFilesList, addFile,
                setEncryptionTime, setShowShareModal } = filesSlice.actions

// The function below is called a selector and it allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectFilesList = (state: RootState) => state.files.filesList
export const selectEncryptionTime = (state: RootState) => state.files.encryptionTime
export const selectDisplayedFilesList = (state: RootState) => state.files.displayFilesList
export const selectShowShareModal = (state: RootState) => state.files.showShareModal

export default filesSlice.reducer