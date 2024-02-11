import { Theme } from "state/user/reducer"

export function getTheme() {
    const theme = localStorage.getItem('theme')
    return theme? theme : Theme.LIGHT
}