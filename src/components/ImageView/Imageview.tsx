import { Api } from "api";
import { AxiosProgressEvent } from "axios";
import { EncryptionStatus, File as FileType } from "api/types";
import { SlideshowLightbox } from "lightbox.js-react";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "state";
import {
	PreviewImage,
	setFileViewAction,
	setImageViewAction,
} from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import {
	blobToArrayBuffer,
	decryptFileBuffer,
} from "utils/encryption/filesCipher";
import Spinner4 from "components/Spinner/Spinner4";
import { toast } from "react-toastify";

// Props interface for the Imageview component.
interface ImageviewProps {
	isOpen: boolean; // Indicates if the lightbox is open.
	files: FileType[]; // Array of files to be displayed.
	loaded: boolean; // Flag to check if files are loaded.
	setloaded: React.Dispatch<React.SetStateAction<boolean>>; // Function to set the 'loaded' state.
}

const Imageview: React.FC<ImageviewProps> = React.memo(
	({ isOpen, files, loaded, setloaded }) => {
		const maxSize = 5000000; // Maximum file size for preview.

		const dispatch = useAppDispatch();
		const [file, setfile] = useState<FileType>();
		const [preview, setpreview] = useState<void | PreviewImage[]>([]);
		const { selectedShowFile } = useAppSelector((state) => state.mystorage);
		const [cache, setCache] = useState<Record<string, Blob>>({});

		/**
		 * Function to handle download progress
		 * @param progressEvent - The event of download progress
		 * @param file - The file being downloaded
		 */
		const onDownloadProgress = (
			progressEvent: AxiosProgressEvent,
			file: FileType
		) => {
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

		/**
		 * Function to check if a file is in a list.
		 * @param list An array of FileType objects representing the list of files.
		 * @param file A FileType object representing the file to check for in the list.
		 * @returns boolean True if the file is found in the list, false otherwise.
		 */
		function isInList(list: FileType[], file: FileType): boolean {
			for (const x of list) {
				if (x.uid === file.uid) {
					return true;
				}
			}
			return false;
		}

		// con esta implementacion la lista se va actualizando mientras se van descargando, pero se ve demasiado forzado
		//  /**
		//  * Handles the viewing process of selected files.
		//  * @param selectedShowFiles An array of FileType objects or undefined. Represents the selected files to be viewed.
		//  */
		// const handleView = async (
		// 	selectedShowFiles: FileType[] | undefined
		// ) => {
		// 	if (selectedShowFiles && selectedShowFiles.length > 0) {
		// 		const uniqueFiles = selectedShowFiles.filter(
		// 			(file, index, self) =>
		// 				index === self.findIndex((t) => t.uid === file.uid)
		// 		);
		// 		const originalOrder: PreviewImage[] = [];

		// 		// Procesa y muestra el primer archivo inmediatamente
		// 		if (uniqueFiles.length > 0) {
		// 			const selectedShowFile = uniqueFiles[0];
		// 			if (selectedShowFile.size < maxSize || aceptDownload) {
		// 				const firstMediaItem = await downloadAndProcessFile(
		// 					selectedShowFile,
		// 					originalOrder
		// 				);
		// 				if (firstMediaItem) {
		// 					setpreview([firstMediaItem]); // Actualizar la vista previa con el primer archivo
		// 				}
		// 			}
		// 		}

		// 		setloaded(true);

		// 		// Procesa los archivos restantes
		// 		const otherFiles = uniqueFiles.slice(1);
		// 		for (const file of otherFiles) {
		// 			if (file.size < maxSize || aceptDownload) {
		// 				const mediaItem = await downloadAndProcessFile(
		// 					file,
		// 					originalOrder
		// 				);
		// 				if (mediaItem) {
		// 					setpreview((prev) => {
		// 						if (prev) {
		// 							return [...prev, mediaItem];
		// 						}
		// 						return [mediaItem];
		// 					}); // Actualizar la vista previa agregando el nuevo archivo
		// 				}
		// 			}
		// 		}
		// 	}
		// };

		/**
		 * Handles the viewing process of selected files.
		 * @param selectedShowFiles An array of FileType objects or undefined. Represents the selected files to be viewed.
		 */
		const handleView = async (
			selectedShowFiles: FileType[] | undefined
		) => {
			// Check if there are selected files
			if (selectedShowFiles && selectedShowFiles.length > 0) {
				// Remove duplicate files based on their UID
				const uniqueFiles = selectedShowFiles.filter(
					(file, index, self) =>
						index === self.findIndex((t) => t.uid === file.uid)
				);
				const originalOrder: PreviewImage[] = [];

				// Process the first file in the unique list if it meets the size criteria
				if (uniqueFiles.length > 0) {
					const selectedShowFile = uniqueFiles[0];
					// Download and process the first file
					await downloadAndProcessFile(
						selectedShowFile,
						originalOrder
					);
				}

				// Mark the loading process as complete
				setloaded(true);

				// Process the remaining files in the unique list
				const otherFiles = uniqueFiles.slice(1);
				const promises = otherFiles.map(
					(file) =>
						file.size < maxSize || cache[file.uid]
							? downloadAndProcessFile(file, originalOrder) // Download and process if the file size is within limits
							: Promise.resolve(undefined) // Otherwise, resolve the promise immediately
				);

				// Wait for all file processing promises to complete
				await Promise.all(promises);

				// Filter out any undefined items from the processed files
				const filteredMediaItems = originalOrder.filter(
					(item) => item !== undefined
				);
				// Update the state to reflect the processed files for preview
				setpreview(filteredMediaItems);
			}
		};

		/**
		 * Function to download and process a file.
		 *
		 * This function handles the downloading of a file and its subsequent processing
		 * based on its MIME type. It either adds the file to a preview list or opens it
		 * in a new tab, depending on its type. It also handles decryption for encrypted files.
		 *
		 * @param file A FileType object representing the file to be downloaded and processed.
		 * @param originalOrder An array of PreviewImage objects. The processed file is added to this array.
		 * @returns A PreviewImage object representing the processed file, or undefined if the process is not completed.
		 */
		const downloadAndProcessFile = async (
			file: FileType,
			originalOrder: PreviewImage[]
		) => {
			try {
				// Check if the file is already in the cache
				if (!cache[file.uid]) {
					// If file not in cache, download it
					const res = await Api.get(`/file/download/${file.uid}`, {
						responseType: "blob",
						onDownloadProgress: (progressEvent) =>
							onDownloadProgress(progressEvent, file),
					});

					// Update status after download
					dispatch(
						setUploadStatusAction({
							info: "Finished downloading data",
							uploading: false,
						})
					);

					let binaryData = res.data;

					// Check and handle file decryption if needed
					if (file.encryption_status === EncryptionStatus.Encrypted) {
						const originalCid = file.cid_original_encrypted;
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

					const blob = new Blob([binaryData], {
						type: file.mime_type,
					});

					// Check for blob creation success
					if (!blob) {
						console.error("Error downloading file:", file);
						return;
					}

					// Update cache with the new file
					setCache((prevCache) => ({
						...prevCache,
						[file.uid]: blob,
					}));

					const url = window.URL.createObjectURL(blob);

					// Process downloaded file based on MIME type
					let mediaItem: PreviewImage;
					if (file.mime_type.startsWith("video/")) {
						// Handle video files
						mediaItem = {
							type: "htmlVideo",
							videoSrc: url,
							// Default thumbnail for video
							src:
								"https://firebasestorage.googleapis.com/v0/b/booksapp-6c6a2.appspot.com/o/videothumbnail.png?alt=media&token=fc61d2e9-ebdf-497d-977b-5c6d2ad2215a",
							alt: file.name,
						};
					} else if (
						file.mime_type === "application/pdf" ||
						file.mime_type === "text/plain"
					) {
						// Open PDF or TXT files in a new tab
						window.open(url, "_blank");
						dispatch(setFileViewAction({ file: undefined }));
						dispatch(setImageViewAction({ show: false }));
						return;
					} else {
						// Handle other file types
						mediaItem = {
							src: url,
							alt: file.name,
						};
					}

					originalOrder.push(mediaItem);
					return mediaItem;
				} else {
					const blob = cache[file.uid];
					const url = window.URL.createObjectURL(blob);

					// Process file based on MIME type
					let mediaItem: PreviewImage;
					if (file.mime_type.startsWith("video/")) {
						// Handle video files
						mediaItem = {
							type: "htmlVideo",
							videoSrc: url,
							// Default thumbnail for video
							src:
								"https://firebasestorage.googleapis.com/v0/b/booksapp-6c6a2.appspot.com/o/videothumbnail.png?alt=media&token=fc61d2e9-ebdf-497d-977b-5c6d2ad2215a",
							alt: file.name,
						};
					} else if (
						file.mime_type === "application/pdf" ||
						file.mime_type === "text/plain"
					) {
						// Open PDF or TXT files in a new tab
						window.open(url, "_blank");
						dispatch(setFileViewAction({ file: undefined }));
						dispatch(setImageViewAction({ show: false }));
						return;
					} else {
						// Handle other file types
						mediaItem = {
							src: url,
							alt: file.name,
						};
					}

					originalOrder.push(mediaItem);
					return mediaItem;
				}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (err: any) {
				clear();
				dispatch(setFileViewAction({ file: undefined }));
				dispatch(
					setUploadStatusAction({
						uploading: false,
					})
				);
				toast.error(err.message);
			}
		};

		/**
		 * Function to clear the component state.
		 */
		function clear() {
			dispatch(setImageViewAction({ show: false }));
		}

		// useEffect to clear states and cache.
		useEffect(() => {
			dispatch(setFileViewAction({ file: undefined }));
			clear();
			setCache({});
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// useEffect to reset states on selected file change.
		useEffect(() => {
			setloaded(false);
			setpreview([]);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [selectedShowFile]);

		// useEffect to handle opening of image view and file selection logic.
		useEffect(() => {
			if (selectedShowFile && !loaded) {
				setfile(selectedShowFile);
				if (isOpen) {
					if (
						selectedShowFile.mime_type.startsWith("video/") ||
						selectedShowFile.mime_type.startsWith("image/")
					) {
						const tempList = [];
						tempList.push(selectedShowFile);
						for (const file of files) {
							if (
								!isInList(tempList, file) &&
								(file.mime_type.startsWith("video/") ||
									file.mime_type.startsWith("image/"))
							) {
								tempList.push(file);
							}
						}
						handleView(tempList);
					} else {
						handleView([selectedShowFile]);
					}
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
					key={preview.length}
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
	}
);

export default Imageview;
