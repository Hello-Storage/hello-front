import { Theme } from "state/user/reducer"

export function getTheme() {
    const theme = localStorage.getItem('theme')
    return theme ?? Theme.LIGHT
}

export function isSafari() {
    const userAgent = navigator.userAgent.toLowerCase();
    const vendor = navigator.vendor.toLowerCase();
    const isSafari = userAgent.includes("safari") && vendor.includes("apple computer");
    const isChrome = userAgent.includes("chrome");
    const isEdge = userAgent.includes("edg");
    const isFirefox = userAgent.includes("firefox");
    const isOpera = userAgent.includes("opr");
    return isSafari && !isChrome && !isEdge && !isFirefox && !isOpera;
}
