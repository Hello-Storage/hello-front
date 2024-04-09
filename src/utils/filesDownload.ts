import { AppDispatch } from "state";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { logoutUser } from "state/user/actions";
import { blobToArrayBuffer, decryptContentUtil, decryptFileBuffer, getAesKey } from "utils/encryption/filesCipher";
import { Api, EncryptionStatus, File as FileType } from "api";
import { addCache, addCancelToken } from "state/mystorage/actions";
import { toast } from "react-toastify";
import axios, { AxiosProgressEvent } from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const downloadMultipart = async (
	file: FileType,
	dispatch: AppDispatch
) => {
	const apiEndpoint =
		import.meta.env.VITE_API_ENDPOINT +
		`/file/download/multipart/${file.uid}`;
	if (!localStorage.getItem("access_token")) {
		logoutUser();
	}

	const response = await fetch(apiEndpoint, {
		headers: {
			"Content-Type": "application/octet-stream",
			Authorization: "Bearer " + localStorage.getItem("access_token"),
		},
	});
	let encrypted = false;
	if (file.encryption_status === "encrypted") {
		encrypted = true;
	}
	dispatch(
		setUploadStatusAction({
			info: "Downloading...",
			uploading: true,
			size: file.size,
		})
	);
	const stream = new ReadableStream({
		async pull(controller) {
			if (!response.ok || !response.body) {
				logoutUser();
				const message = `An error has occured: ${response.status}`;
				throw new Error(message);
			}
			const reader = response.body.getReader();
			let isFirstChunk = true;
			let aesKey: CryptoKey | undefined;
			let iv,
				accumulated = new Uint8Array();
			let totalProcessed = 0; // Variable to track the total processed data

			const shouldContinue = true;
			while (shouldContinue) {
				const { done, value } = await reader.read();
				if (done) break;

				// Append new data to the accumulated buffer
				const tempBuffer = new Uint8Array(
					accumulated.length + value.length
				);

				tempBuffer.set(accumulated);
				tempBuffer.set(value, accumulated.length);
				accumulated = tempBuffer;

				// Process first chunk separately
				if (isFirstChunk) {
					if (accumulated.length >= 28) {
						const salt = accumulated.slice(0, 16);
						iv = accumulated.slice(16, 28);
						if (encrypted) {
							const keyInfo = await getAesKey(
								file.cid_original_encrypted,
								["decrypt"],
								salt,
								iv
							);
							aesKey = keyInfo.aesKey;
						}
						isFirstChunk = false;
						accumulated = accumulated.slice(28);
					}
				}

				// Decrypt when we have enough data or it's the last chunk
				while (accumulated.length >= CHUNK_SIZE) {
					const chunk = accumulated.slice(0, CHUNK_SIZE);
					accumulated = accumulated.slice(CHUNK_SIZE);

					// Decrypt the chunk
					if (encrypted) {
						if (aesKey && iv) {
							const decryptedChunk = await decryptContentUtil(
								chunk,
								aesKey,
								iv
							);
							controller.enqueue(new Uint8Array(decryptedChunk));
						}
					} else {
						controller.enqueue(chunk);
					}
					totalProcessed += CHUNK_SIZE; // Update total processed data
				}
				dispatch(
					setUploadStatusAction({
						read: totalProcessed,
					})
				);
			}

			// Enqueue any remaining data
			if (accumulated.length > 0) {
				if (encrypted) {
					if (aesKey && iv) {
						const decryptedChunk = await decryptContentUtil(
							accumulated,
							aesKey,
							iv
						);
						controller.enqueue(new Uint8Array(decryptedChunk));
					} else {
						controller.enqueue(accumulated);
					}
				}
			}

			controller.close();
		},
	});

	// Create blob for download
	const responseBlob = new Response(stream);
	return new Blob([await responseBlob.blob()], { type: file.mime_type });
};

export const triggerDownload = (blob: Blob, filename: string) => {
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	toast.success("Download complete!");
	window.URL.revokeObjectURL(url);
};
export const viewMultipart = async (file: FileType, dispatch: AppDispatch, videoRef: any) => {
    const apiEndpoint =
        import.meta.env.VITE_API_ENDPOINT +
        `/file/download/multipart/${file.uid}`;
    if (!localStorage.getItem("access_token")) {
        logoutUser();
    }

    const response = await fetch(apiEndpoint, {
        headers: {
            "Content-Type": "application/octet-stream",
            Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
    });

    let encrypted = false;
    if (file.encryption_status === "encrypted") {
        encrypted = true;
    }

    const stream = new ReadableStream({
        async start(controller) {
            if (!response.ok || !response.body) {
                logoutUser();
                const message = `An error has occured: ${response.status}`;
                throw new Error(message);
            }
            const reader = response.body.getReader();
            let isFirstChunk = true;
            let aesKey: CryptoKey | undefined;
            let iv,
                accumulated = new Uint8Array();
            let totalProcessed = 0; // Variable to track the total processed data

            const shouldContinue = true;
            while (shouldContinue) {
                const { done, value } = await reader.read();
                if (done) break;

                // Append new data to the accumulated buffer
                const tempBuffer = new Uint8Array(
                    accumulated.length + value.length
                );

                tempBuffer.set(accumulated);
                tempBuffer.set(value, accumulated.length);
                accumulated = tempBuffer;

                // Process first chunk separately
                if (isFirstChunk) {
                    if (accumulated.length >= 28) {
                        const salt = accumulated.slice(0, 16);
                        iv = accumulated.slice(16, 28);
                        if (encrypted) {
                            const keyInfo = await getAesKey(
                                file.cid_original_encrypted,
                                ["decrypt"],
                                salt,
                                iv
                            );
                            aesKey = keyInfo.aesKey;
                        }
                        isFirstChunk = false;
                        accumulated = accumulated.slice(28);
                    }
                }

                // Decrypt when we have enough data or it's the last chunk
                while (accumulated.length >= CHUNK_SIZE) {
                    const chunk = accumulated.slice(0, CHUNK_SIZE);
                    accumulated = accumulated.slice(CHUNK_SIZE);

                    // Decrypt the chunk
                    if (encrypted) {
                        if (aesKey && iv) {
                            const decryptedChunk = await decryptContentUtil(
                                chunk,
                                aesKey,
                                iv
                            );
                            controller.enqueue(new Uint8Array(decryptedChunk));
                        }
                    } else {
                        controller.enqueue(chunk);
                    }
                    totalProcessed += CHUNK_SIZE; // Update total processed data
                    dispatch(
                        setUploadStatusAction({
                            read: totalProcessed,
                        })
                    );
                    createVideoChunk(controller, videoRef);
                }
            }

            // Enqueue any remaining data
            if (accumulated.length > 0) {
                if (encrypted) {
                    if (aesKey && iv) {
                        const decryptedChunk = await decryptContentUtil(
                            accumulated,
                            aesKey,
                            iv
                        );
                        controller.enqueue(new Uint8Array(decryptedChunk));
                    } else {
                        controller.enqueue(accumulated);
                    }
                }
                dispatch(
                    setUploadStatusAction({
                        read: totalProcessed + accumulated.length,
                    })
                );
                createVideoChunk(controller, videoRef);
            }

            controller.close();
        },
    });

    const createVideoChunk = (controller: any, videoRef: React.MutableRefObject<HTMLVideoElement | undefined>) => {
        const responseBlob = new Response(controller);
        responseBlob.blob().then((blob) => {
			console.log("actualizado blob");
            const url = URL.createObjectURL(blob);
			if (videoRef.current) videoRef.current.src = url;
        });
    };

    dispatch(
        setUploadStatusAction({
            info: "Finished downloading data",
            uploading: false,
        })
    );
};


export const downloadSingleFile = async (
	file: FileType,
	cache: {
		[key: string]: Blob;
	},
	dispatch: AppDispatch
) => {
	try {
		
		const cancelTokenSource = axios.CancelToken.source();
		dispatch(addCancelToken({[file.uid]: cancelTokenSource}));
		// Check if the file is already in the cache
		const blob = cache[file.uid];
		if (!(blob instanceof Blob)) {
			// If file not in cache, download it
			const res = await Api.get(`/file/download/${file.uid}`, {
				cancelToken: cancelTokenSource.token,
				responseType: "blob",
				onDownloadProgress: (progressEvent) =>
					onDownloadProgress(progressEvent, file, dispatch),
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

            // Check and handle file decryption if needed
			if (file.file_share_state && file.file_share_state.id !== 0) {
				const originalCid =
					file.file_share_state.public_file.cid_original_decrypted;
				if (originalCid != "") {
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
					).catch(() => {
						toast.error("Error downloading file");
					});

					dispatch(
						setUploadStatusAction({
							info: "Decryption done",
							uploading: false,
						})
					);
				} else {
					binaryData = await blobToArrayBuffer(binaryData);
				}
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
			dispatch(addCache({ [file.uid]: blob }));
			
            return blob;
        }
		
		return blob;
	} catch (err: any) {
		toast.error(err.message);
	}
};

// Update download status
const onDownloadProgress = (
	progressEvent: AxiosProgressEvent,
	file: FileType,
	dispatch: AppDispatch
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