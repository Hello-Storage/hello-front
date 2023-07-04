import { NavigateFunction } from "react-router-dom";
import { baseName } from "../constants";

//Check if user is signed in by checking if localStorage has a customToken and a personalSignature in sessionStorage
export const isSignedIn = (navigate: NavigateFunction, destiny: string): boolean => {
    if (localStorage.getItem('customToken') && sessionStorage.getItem('personalSignature')) {
        return true;
    }
    if (!localStorage.getItem('customToken')) {
        sessionStorage.removeItem('personalSignature');
        //redirect to login
        location.pathname !== "/login" && location.pathname !== "/register"
            ? navigate(baseName + "/login/" + destiny) 
            : console.log("already on login page");
    } else if (!sessionStorage.getItem('personalSignature')) {
        //redirect to profile
        location.pathname !== "/profile"
            ? navigate(baseName + "/profile/" + destiny)
            : console.log("already on profile page");
    }
    return false;
} 