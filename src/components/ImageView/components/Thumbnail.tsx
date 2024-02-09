
import videotmb from "../../../assets/images/file-thumbs/video-thmb.svg";
import imgtmb from "../../../assets/images/file-thumbs/img-thmb.svg";
import filetmb from "../../../assets/images/file-thumbs/file-thmb.svg";
import { useDispatch } from "react-redux";
import { File } from "api";
import { setFileViewAction } from "state/mystorage/actions";
import { imageExtensions, videoExtensions } from "../utils/consts";
// import { useState } from "react";
// import axios from "axios";
// import sharp from "sharp";

interface ThumbnailProps {
    name: string
    src: string
    selected: boolean
    files: File[];
    uid: string;
    loading: boolean;
}
export const Thumbnail: React.FC<ThumbnailProps> = ({ src, name, selected, uid, files, loading }) => {
    const fileExtension = name.split('.').pop() || ''
    const dispatch = useDispatch();
    // const [thumbnail, setThumbnail] = useState<any>();

    function changeSelected(uid: string) {
        if (loading) return;
        dispatch(setFileViewAction({ file: files.find(file => file.uid === uid) }));
    }

    // future implementation to generate thumbnails of images (trouble: cant generate thumbnails of 
    // videos and files, desactivated for now till implementation of video and file thumbnails)
    // TODO: read doc of pdf-thumbnail and fluent-ffmpeg

    // async function generateThumbnail(url: string, width: number, height: number) {
    //     try {
    //         const response = await axios.get(url, { responseType: 'arraybuffer' });
    //         const imageBuffer = Buffer.from(response.data, 'binary');

    //         const thumbnailBuffer = await sharp(imageBuffer)
    //             .resize({ width, height })
    //             .toBuffer();

    //         setThumbnail(thumbnailBuffer);

    //     } catch (error) {
    //         console.error('Error al generar el thumbnail:', error);
    //     }
    // }

    return (
        <>
            {(src && imageExtensions.includes(fileExtension)) ? (
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
                            <img src={imgtmb} alt={name} draggable={false} />
                        </div>
                    ) :
                    videoExtensions.includes(fileExtension) ?
                        (
                            <div className={"thumbnail modal " + (selected ? "selected" : "")}
                                onClick={() => changeSelected(uid)}
                            >
                                <img src={videotmb} alt={name} draggable={false} />
                            </div>
                        )
                        :
                        (
                            <div className={"thumbnail modal " + (selected ? "selected" : "")}
                                onClick={() => changeSelected(uid)}
                            >
                                <img src={filetmb} alt={name} draggable={false} />
                            </div>
                        )
            }
        </>
    )
}