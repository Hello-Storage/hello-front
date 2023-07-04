import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store"
import { FileDB } from "../../types";

export interface FilesState {
    filesList: FileDB[],
}

const initialState: FilesState = {
    filesList: [],
}


export const filesSlice = createSlice({
    name: "files",
    initialState,
    // The `reducers` filed lets us define reducers and generate associated actions
    reducers: {
        setFilesList: (state, action) => {
            state.filesList = action.payload
        },
        addFile: (state, action) => {
            state.filesList.push(action.payload)
        }
    }
})

export const { setFilesList, addFile } = filesSlice.actions

export const selectFilesList = (state: RootState) => state.files.filesList

export default filesSlice.reducer