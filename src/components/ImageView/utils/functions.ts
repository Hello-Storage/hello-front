
import fullscreenicon1 from "../../../assets/images/file-viewer-resources/fullscreen-1.svg";
import fullscreenicon2 from "../../../assets/images/file-viewer-resources/fullscreen-2.svg";

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


export function handleThumbnail() {
    document.getElementById("thumbnails")?.classList.toggle("hidden-thumbnails");
    document.getElementById("image-preview-content")?.classList.toggle("hidden-thumbnails");
}
export function handleFullScreen() {
    console.log(document.fullscreenElement);
    if (document.fullscreenElement) {
        exitFullscreen();
        document.getElementById("fulls-icon")?.setAttribute("src", fullscreenicon1);
        if (document.getElementById("thumbnails")?.classList.contains("hidden-thumbnails")) {
            handleThumbnail();
        }
    } else {
        document.getElementById("fulls-icon")?.setAttribute("src", fullscreenicon2);
        enterFullscreen(document.documentElement);
        if (!document.getElementById("thumbnails")?.classList.contains("hidden-thumbnails")) {
            handleThumbnail();
        }
    }
}