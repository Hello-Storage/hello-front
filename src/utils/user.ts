import { Theme } from "state/user/reducer"

export function getTheme() {
    const theme = localStorage.getItem('theme')
    return theme ?? Theme.LIGHT
}

export function isSafari() {
    const userAgent = navigator.userAgent.toLowerCase();
    const vendor = navigator.vendor.toLowerCase();
    const isSafari = (userAgent.includes("safari") || userAgent.includes("applewebkit")) && vendor.includes("apple computer");
    return isSafari;
}
