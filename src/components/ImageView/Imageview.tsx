import { Api } from "api";
import { AxiosProgressEvent } from "axios";
import { EncryptionStatus, File as FileType } from "api/types";
import { SlideshowLightbox } from "lightbox.js-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "state";
import { PreviewImage, setFileViewAction, setImageViewAction } from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import {
	blobToArrayBuffer,
	decryptFileBuffer,
} from "utils/encryption/filesCipher";
import Spinner4 from "components/Spinner/Spinner4";

interface ImageviewProps {
	isOpen: boolean;
	files: FileType[];
	loaded: boolean;
	setloaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const Imageview: React.FC<ImageviewProps> = ({ isOpen, files, loaded, setloaded }) => {
	const dispatch = useAppDispatch();
	const [preview, setpreview] = useState<void | PreviewImage[]>([]);
	const { selectedShowFile } = useAppSelector((state) => state.mystorage);

	// Estado para la caché de blobs descargadas
	const [cache, setCache] = useState<Record<string, Blob>>({});

	const onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
		dispatch(
			setUploadStatusAction({
				info: `${"Loading"} ` + selectedShowFile?.name,
				uploading: true,
			})
		);
		dispatch(
			setUploadStatusAction({
				read: progressEvent.loaded,
				size: selectedShowFile?.size,
			})
		);
	};

	function isInList(list: FileType[], file: FileType): boolean {
		for (const x of list) {
			if (x.uid === file.uid) {
				return true;
			}
		}
		return false;
	}

	const handleView = async (selectedShowFiles: FileType[] | undefined) => {
		if (selectedShowFiles && selectedShowFiles.length > 0 && selectedShowFile) {
			const originalOrder: PreviewImage[] = [];

			if (selectedShowFiles.length > 0) {
				const selectedShowFile = selectedShowFiles[0];
				await downloadAndProcessFile(selectedShowFile, originalOrder);
			}

			setloaded(true);

			const otherFiles = selectedShowFiles.slice(1);
			const promises = otherFiles.map((file) => downloadAndProcessFile(file, originalOrder));

			await Promise.all(promises);

			const filteredMediaItems = originalOrder.filter((item) => item !== undefined);
			setpreview(filteredMediaItems);
		}
	};

	const downloadAndProcessFile = async (file: FileType, originalOrder: PreviewImage[]) => {
		try {
			// Verificar si el archivo está en la caché
			if (cache[file.uid]) {
				// Usar la versión en caché en lugar de descargar
				const blob = cache[file.uid];
				const url = window.URL.createObjectURL(blob);

				let mediaItem: PreviewImage;
				if (file.mime_type.startsWith("video/")) {
					mediaItem = {
						type: "htmlVideo",
						videoSrc: url,
						alt: file.name,
					};
				} else if (file.mime_type === "application/pdf" || file.mime_type === "text/plain") {
					window.open(url, "_blank"); // PDF or TXT en una nueva pestaña
					dispatch(setFileViewAction({ file: undefined }));
					dispatch(setImageViewAction({ show: false }));
					return;
				} else {
					mediaItem = {
						src: url,
						alt: file.name,
					};
				}

				originalOrder.push(mediaItem);
				return mediaItem;
			}

			// Si no está en caché, realizar la descarga
			const res = await Api.get(`/file/download/${file.uid}`, {
				responseType: "blob",
				onDownloadProgress: onDownloadProgress,
			});

			dispatch(
				setUploadStatusAction({
					info: "Finished downloading data",
					uploading: false,
				})
			);

			let binaryData = res.data;

			if (file.encryption_status === EncryptionStatus.Encrypted) {
				const originalCid = file.cid_original_encrypted;
				binaryData = await blobToArrayBuffer(binaryData);
				binaryData = await decryptFileBuffer(binaryData, originalCid, (percentage) => {
					dispatch(
						setUploadStatusAction({
							info: "Decrypting...",
							read: percentage,
							size: 100,
							uploading: true,
						})
					);
				});

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

			// Almacenar la blob en la caché
			setCache((prevCache) => ({
				...prevCache,
				[file.uid]: blob,
			}));

			const url = window.URL.createObjectURL(blob);

			let mediaItem: PreviewImage;
			if (file.mime_type.startsWith("video/")) {
				mediaItem = {
					type: "htmlVideo",
					videoSrc: url,
					alt: file.name,
				};
			} else if (file.mime_type === "application/pdf" || file.mime_type === "text/plain") {
				window.open(url, "_blank"); // PDF or TXT en una nueva pestaña
				dispatch(setFileViewAction({ file: undefined }));
				dispatch(setImageViewAction({ show: false }));
				return;
			} else {
				mediaItem = {
					src: url,
					alt: file.name,
				};
			}

			originalOrder.push(mediaItem);
			return mediaItem;
		} catch (err) {
			console.error("Error downloading file:", err);
		}
	};

	useEffect(() => {
		dispatch(setFileViewAction({ file: undefined }));
		dispatch(setImageViewAction({ show: false }));
		setloaded(false);
		setpreview([]);
		// Limpiar la caché al montar el componente
		setCache({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setpreview([]);
		if (isOpen && selectedShowFile && !loaded) {
			if (selectedShowFile.mime_type.startsWith("video/") || selectedShowFile.mime_type.startsWith("image/")) {
				const tempList = [];
				tempList.push(selectedShowFile);
				for (const file of files) {
					if (!isInList(tempList, file) && (file.mime_type.startsWith("video/") || file.mime_type.startsWith("image/"))) {
						tempList.push(file);
					}
				}
				handleView(tempList);
			} else {
				handleView([selectedShowFile]);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedShowFile, isOpen, loaded]);

	if (!isOpen) {
		return <></>;
	} else if (!loaded || !preview || preview.length === 0) {
		return <Spinner4 />;
	} else {
		return (
			<SlideshowLightbox
				images={preview}
				showThumbnails={true}
				showThumbnailIcon={true}
				open={loaded}
				lightboxIdentifier="lbox1"
				backgroundColor="#0f0f0fcc"
				iconColor="#ffffff"
				modalClose="button"
			/>
		);
	}
};

export default Imageview;
