import { NavigateFunction } from "react-router-dom";

//Check if user is signed in by checking if localStorage has a customToken and a personalSignature in sessionStorage
export const isSignedIn = (navigate: NavigateFunction, destiny: string): boolean => {
    if (localStorage.getItem('customToken') && sessionStorage.getItem('personalSignature')) {
        return true;
    }
    if (!localStorage.getItem('customToken')) {
        sessionStorage.removeItem('personalSignature');
        console.log("no custom token")
        //redirect to login
        if (location.pathname !== "/login" && location.pathname !== "/register") {
            navigate("/login/" + destiny)
        } else {
            console.log("already on login page");
        }
    } else if (!sessionStorage.getItem('personalSignature')) { 
        console.log("no signature")
        //redirect to profile
        location.pathname !== "/profile"
            ? navigate("/login/" + destiny)
            : console.log("already on profile page");
    }
    return false;
} 