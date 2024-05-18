import { Theme } from "state/user/reducer"

export function getTheme() {
    const theme = localStorage.getItem('theme')
    return theme ?? Theme.LIGHT
}

export function isSafari() {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor;
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(vendor);
    const isChrome = /Chrome/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isOpera = /OPR/.test(userAgent);
    return isSafari && !isChrome && !isEdge && !isFirefox && !isOpera;
}

export function thereIsWebtrasnsport() {
    return typeof WebTransport !== 'undefined'
}