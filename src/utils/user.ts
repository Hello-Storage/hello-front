import { Theme } from "state/user/reducer"

export function getTheme() {
    let theme = localStorage.getItem('theme')
    return theme? theme : Theme.LIGHT
}