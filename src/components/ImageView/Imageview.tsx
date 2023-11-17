import { Api } from "api";
import { AxiosProgressEvent } from "axios";
import { EncryptionStatus, File as FileType } from "api/types";
import { Spinner3 } from "components/Spinner";
import { SlideshowLightbox } from "lightbox.js-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "state";
import { PreviewImage, setImageViewAction } from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import {
	blobToArrayBuffer,
	decryptFileBuffer,
} from "utils/encryption/filesCipher";

interface ImageviewProps {
	isOpen: boolean;
	setIsopen: React.Dispatch<React.SetStateAction<boolean>>;
	file: FileType;
	files: FileType[];
}

const Imageview: React.FC<ImageviewProps> = ({ isOpen, setIsopen, file, files }) => {
	const dispatch = useAppDispatch();
	const { preview } = useAppSelector((state) => state.mystorage);
	const [loaded, setloaded] = useState(false);
	const closeShareModal = () => {
		setIsopen(false);
	};

	const onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
		dispatch(
			setUploadStatusAction({
				info: `${"Loading"} ` + file.name,
				uploading: true,
			})
		);

		dispatch(
			setUploadStatusAction({
				read: progressEvent.loaded,
				size: file.size,
			})
		);
	};

    function findIndex(lista: FileType[], uid: string): number {
        for (let i = 0; i < lista.length; i++) {
            if (lista[i].uid === uid) {
                return i;
            }
        }
        return -1;
    }

	const handleView = () => {
		Api.get(`/file/download/${file.uid}`, {
			responseType: "blob",
			onDownloadProgress: onDownloadProgress,
		})
			.then(async (res) => {
				dispatch(
					setUploadStatusAction({
						info: "Finished downloading data",
						uploading: false,
					})
				);
				let binaryData = res.data;
				if (file.encryption_status === EncryptionStatus.Encrypted) {
					const originalCid = file.cid_original_encrypted;
					console.log(originalCid);
					binaryData = await blobToArrayBuffer(binaryData);
					binaryData = await decryptFileBuffer(
						binaryData,
						originalCid,
						(percentage) => {
							dispatch(
								setUploadStatusAction({
									info: "Decrypting...",
									read: percentage,
									size: 100,
									uploading: true,
								})
							);
						}
					);

					dispatch(
						setUploadStatusAction({
							info: "Decryption done",
							uploading: false,
						})
					);
				}
				const blob = new Blob([binaryData], { type: file.mime_type });
				if (!blob) {
					console.error("Error downloading file:", file);
					return;
				}
				const url = window.URL.createObjectURL(blob);

				let mediaItem: PreviewImage;
				if (file.mime_type.startsWith("video/")) {
					mediaItem = {
						type: "htmlVideo",
						videoSrc: url,
						alt: file.name,
					};
				} else if (
					file.mime_type === "application/pdf" ||
					file.mime_type === "text/plain"
				) {
					window.open(url, "_blank"); // PDF or TXT in a new tab
					return;
				} else {
					mediaItem = {
						src: url,
						alt: file.name,
					};
				}
                setloaded(true)
				dispatch(setImageViewAction({ img: mediaItem, show: true }));
			})
			.catch((err) => {
				console.error("Error downloading file:", err);
			});
	};
    
    const index=findIndex(files,file.uid)

	if (!isOpen) {
		return <></>;
	} else {
		if (!loaded) {
			return <Spinner3 />;
		} else {
			return (
				<>
					<div>prev</div>
					<div>next</div>
					<SlideshowLightbox
						images={[preview]}
						showThumbnails={false}
						showThumbnailIcon={false}
						open={isOpen}
						lightboxIdentifier="lbox1"
						backgroundColor="#0f0f0fcc"
						iconColor="#ffffff"
						modalClose="clickOutside"
						onClose={() => {
							dispatch(setImageViewAction({ show: false }));
						}}
					/>
				</>
			);
		}
	}
};

export default Imageview;
