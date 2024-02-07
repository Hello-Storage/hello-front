
import videotmb from "../../../assets/images/file-thumbs/video-thmb.svg";
import imgtmb from "../../../assets/images/file-thumbs/img-thmb.svg";
import filetmb from "../../../assets/images/file-thumbs/file-thmb.svg";
import { useDispatch } from "react-redux";
import { File } from "api";
import { setFileViewAction } from "state/mystorage/actions";

interface ThumbnailProps {
    name: string
    src: string
    selected: boolean
    files: File[];
    uid: string;

}
export const Thumbnail: React.FC<ThumbnailProps> = ({ src, name, selected, uid, files }) => {
    const fileExtension = name.split('.').pop() || ''
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']
    const videoExtensions = ['mp4', 'webm', 'ogg']
    const dispatch = useDispatch();

    function changeSelected(uid: string) {
        dispatch(setFileViewAction({ file: files.find(file => file.uid === uid)}));
    }

    return (
        <>
            {src ? (
                <div className={"thumbnail modal " + (selected ? "selected" : "")}
                    onClick={() => changeSelected(uid)}
                >
                    <img src={src} alt={name} draggable={false} />
                </div>
            )
                : imageExtensions.includes(fileExtension) ?
                    (
                        <div className={"thumbnail modal " + (selected ? "selected" : "")}
                            onClick={() => changeSelected(uid)}
                        >
                            <img src={imgtmb} className="h-[70px]" alt={name} draggable={false} />
                        </div>
                    ) :
                    videoExtensions.includes(fileExtension) ?
                        (
                            <div className={"thumbnail modal " + (selected ? "selected" : "")}
                                onClick={() => changeSelected(uid)}
                            >
                                <img src={videotmb} className="h-[70px]" alt={name} draggable={false} />
                            </div>
                        )
                        :
                        (
                            <div className={"thumbnail modal " + (selected ? "selected" : "")}
                                onClick={() => changeSelected(uid)}
                            >
                                <img src={filetmb} className="h-[70px]" alt={name} draggable={false} />
                            </div>
                        )
            }
        </>
    )
}