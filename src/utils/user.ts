import { Theme } from "state/user/reducer"

export function getTheme() {
    const theme = localStorage.getItem('theme')
    return theme ?? Theme.LIGHT
}

export function isWebTransportSupported(): boolean {
    return typeof (window as any).WebTransport !== 'undefined';
}
