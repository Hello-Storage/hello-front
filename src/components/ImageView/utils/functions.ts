
export function enterFullscreen(element: any) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

export function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
    }
}