import { NavigateFunction } from "react-router-dom";
import { connectMetamask } from "../requests/metaRequests";
import { setPersonalSignature } from "./encryption/cipher";
import { getDataCap, getUploadedFilesCount, getUsedStorage, savePersonalSignature } from "../requests/clientRequests";
import { AppDispatch } from "../app/store";
import { setAddress, setCustomToken, setDatacap, setLoading, setRedirectTo, setShowToast, setToastMessage, setUploadedFilesCount, setUsedStorage } from "../features/account/accountSlice";
import axios, { AxiosError } from "axios";
import { baseUrl } from "../constants";

//Check if user is signed in by checking if localStorage has a customToken and a personalSignature in sessionStorage
export const isSignedIn = (navigate: NavigateFunction, destiny: string): boolean => {
    if (localStorage.getItem('customToken') && sessionStorage.getItem('personalSignature')) {
        return true;
    }
    if (!localStorage.getItem('customToken')) {
        sessionStorage.removeItem('personalSignature');
    } else if (!sessionStorage.getItem('personalSignature')) {
        console.log("no signature")
        //redirect to profile
        location.pathname !== "/profile"
            ? navigate("/login/" + destiny)
            : console.log("already on profile page");
    }
    return false;
}
export const handleAuthentication = async (dispatch: AppDispatch) => {
    //create a get request with auth header "Bearer customToken" to /api
    const customToken = localStorage.getItem("customToken");
    if (!customToken) {
        return;
    }

    dispatch(setCustomToken(customToken));
    const response = await axios.get(`${baseUrl}/api/authenticate`, {
        headers: {
            Authorization: `Bearer ${customToken}`,
        },
    });


    dispatch(setToastMessage(response.data.msg))
    dispatch(setShowToast(true));
}


export const loginMetamask = async (dispatch: AppDispatch, destiny?: string) => {
    const addressTemp: (string | Error) = await connectMetamask();
    if (addressTemp instanceof Error) {
        alert(addressTemp.message)
        console.log(addressTemp);
        return;
    } else {
        const signature = await setPersonalSignature(addressTemp);

        await handleAuthentication(dispatch);
        const passwordRequest = await savePersonalSignature(signature);
        const dataCap = await getDataCap(addressTemp);
        const usedStorage = await getUsedStorage(addressTemp);

        const uploadedFilesCount = await getUploadedFilesCount(addressTemp);
        if (dataCap instanceof Error) {

            console.log(dataCap);
            //setLoading to false
            dispatch(setLoading(false));
            //set toast message to error.response.data
            dispatch(setToastMessage(dataCap.message));
            //show toast
            dispatch(setShowToast(true));
            return;
        }
        if (usedStorage instanceof Error) {

            console.log(usedStorage);
            //setLoading to false
            dispatch(setLoading(false));
            //set toast message to error.response.data
            dispatch(setToastMessage(usedStorage.message));
            //show toast
            dispatch(setShowToast(true));
            return;
        }
        if (uploadedFilesCount instanceof Error) {
            console.log(uploadedFilesCount);
            //setLoading to false
            dispatch(setLoading(false));
            //set toast message to error.response.data
            dispatch(setToastMessage(uploadedFilesCount.message));
            //show toast
            dispatch(setShowToast(true));
            return;
        }


        //check if the response is an error
        if (passwordRequest instanceof AxiosError) {
            //extend response so it response.response.data exists
            //alerts "Passwords don't match"
            const errorMessage = passwordRequest.response?.data;
            //remove customToken from localStorage
            localStorage.removeItem("customToken");
            sessionStorage.removeItem("personalSignature");
            //setLoading to false
            dispatch(setLoading(false));
            //set toast message to error.response.data
            dispatch(setToastMessage(errorMessage));
            //show toast
            dispatch(setShowToast(true));
            return;
        }
        dispatch(setDatacap(dataCap));
        dispatch(setUsedStorage(usedStorage));
        dispatch(setUploadedFilesCount(uploadedFilesCount));
        dispatch(setAddress(addressTemp));
        dispatch(setLoading(false));
        if (destiny) {
            dispatch(setRedirectTo(destiny));
        }
    }
}