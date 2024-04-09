
import videotmb from "../../../assets/images/file-thumbs/video-thmb.svg";
import imgtmb from "../../../assets/images/file-thumbs/img-thmb.svg";
import filetmb from "../../../assets/images/file-thumbs/file-thmb.svg";
import { useDispatch } from "react-redux";
import { File } from "api";
import { setFileViewAction } from "state/mystorage/actions";
import { imageExtensions, videoExtensions } from "../utils/consts";
import { CancelTokenSource } from "axios";
import { setUploadStatusAction } from "state/uploadstatus/actions";

interface ThumbnailProps {
    name: string
    src: string
    selected: boolean
    files: File[];
    uid: string;
    CancelToken?: CancelTokenSource
}
export const Thumbnail: React.FC<ThumbnailProps> = ({ src, name, selected, uid, files, CancelToken }) => {
    const fileExtension = name.split('.').pop() ?? ''
    const dispatch = useDispatch();

    function changeSelected(uid: string) {
        try {
            CancelToken?.cancel();
        } catch (error) {
            console.log(error);
        }
        dispatch(
            setUploadStatusAction({
                uploading: false,
            })
        );
        dispatch(setFileViewAction({ file: files.find(file => file.uid === uid) }));
    }

    return (
        <button className={"thumbnail modal " + (selected ? "selected" : "")} title={name}
            onClick={() => changeSelected(uid)}
        >
            {(src && imageExtensions.includes(fileExtension)) ? (
                <img src={src} alt={name} draggable={false} />
            )
                : imageExtensions.includes(fileExtension) ?
                    (
                        <img src={imgtmb} alt={name} draggable={false} />
                    ) :
                    videoExtensions.includes(fileExtension) ?
                        (
                            <img src={videotmb} alt={name} draggable={false} />
                        )
                        :
                        (
                            <img src={filetmb} alt={name} draggable={false} />
                        )
            }
        </button>
    )
}