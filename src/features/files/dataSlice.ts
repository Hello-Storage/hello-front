import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store"
import { FileDB } from "../../types";

export interface FilesState {
    filesList: FileDB[],
    displayFilesList: FileDB[],
    encryptionTime: number,
}

const initialState: FilesState = {
    filesList: [],
    displayFilesList: [],
    encryptionTime: 0,
}


export const dataSlice = createSlice({
    name: "files",
    initialState,
    // The `reducers` filed lets us define reducers and generate associated actions
    reducers: {
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

    }
})

export const { setFilesList, setDisplayedFilesList, addFile,
                setEncryptionTime } = dataSlice.actions

export const selectFilesList = (state: RootState) => state.files.filesList
export const selectEncryptionTime = (state: RootState) => state.files.encryptionTime
export const selectDisplayedFilesList = (state: RootState) => state.files.displayFilesList

export default dataSlice.reducer