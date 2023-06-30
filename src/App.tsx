import "./App.css";
import { FormEvent, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import FileComponent from "./components/FileComponent";
import { FileDB, FileUploadResponse } from "./types";
import { baseUrl } from "./constants";
import { uploadFile } from "./requests/clientRequests";
import {
	decryptContent,
	getHashFromSignature,
	getKeyFromHash,
} from "./helpers/cipher";
import { useDispatch, useSelector } from "react-redux";
import {
	selectAddress,
	selectLoading,
	setAddress,
	setCustomToken,
} from "./features/counter/accountSlice";
import { AppDispatch } from "./app/store";

function App() {
	const dispatch = useDispatch<AppDispatch>();

	//selectors
	const loading = useSelector(selectLoading);
	const address = useSelector(selectAddress);

	//states
	const [ref, setRef] = useState<HTMLInputElement | null>(null);
	const [fileToUplad, setFileToUpload] = useState<File | null>(null);
	const [filesList, setFilesList] = useState<{ files: FileDB[] }>({
		files: [],
	});
	const [displayedFilesList, setDisplayedFilesList] = useState<{
		files: FileDB[];
	}>({ files: [] });
	const [searchTerm, setSearchTerm] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");

	const onUploadFilePress = () => {
		setFileToUpload(null);
		ref?.click();
	};

	useEffect(() => {
		if (!fileToUplad) {
			return;
		}

		uploadFile(fileToUplad)
			.then((response: AxiosResponse<FileUploadResponse, any> | null) => {
				console.log(response);
				setFileToUpload(null);
				//update files list
				if (!response?.data?.file) {
					return;
				}
				const file: FileDB = response?.data?.file;

				filesList.files.push(file);

				setFilesList({ ...filesList, files: filesList.files });
				setDisplayedFilesList({
					...displayedFilesList,
					files: filesList.files,
				}); // set displayed files list as well

				setToastMessage("File uploaded successfully");
				setShowToast(true);
			})
			.catch((error) => {
				console.log(error);

				setFileToUpload(null);

				setToastMessage("Error uploading file: " + error.message);
				setShowToast(true);
			})
			.catch((error) => {
				console.log(error);
			});
	}, [displayedFilesList, fileToUplad, filesList, filesList.files]);


	const deleteFileFromList = (file: FileDB | null) => {
		if (file !== null) {
			const updatedFilesList = displayedFilesList.files.filter(
				(item: FileDB) => item.ID !== file.ID
			);
			setFilesList({ ...filesList, files: updatedFilesList });
			setDisplayedFilesList({
				...displayedFilesList,
				files: updatedFilesList,
			});
		}
	};

	useEffect(() => {
		//get files list from /api/files with auth header "Bearer customToken"
		const customToken = localStorage.getItem("customToken");
		if (!customToken) {
			return;
		}
		axios
			.get(`${baseUrl}/api/files`, {
				headers: {
					Authorization: `Bearer ${customToken}`,
				},
			})
			.then(async (response) => {
				const filesList: { files: FileDB[] } = await response.data;

				const signature = sessionStorage.getItem("personalSignature");

				const hash = await getHashFromSignature(signature!);
				const key = await getKeyFromHash(hash);
				//iterate through filesList and decrypt metadata
				const decryptedFiles = await Promise.all(
					filesList.files.map(async (file: FileDB) => {
						//decrypt metadata
						const encryptedMetadata = file.encryptedMetadata;

						const encryptedMetadataBytes = Uint8Array.from(
							atob(encryptedMetadata),
							(c) => c.charCodeAt(0)
						);

						const iv = Uint8Array.from(atob(file.iv), (c) =>
							c.charCodeAt(0)
						);

						//decrypt metadata
						const metadataBuffer = await decryptContent(
							iv,
							key,
							encryptedMetadataBytes
						);
						//transform metadata from ArrayBuffer to string
						const decoder = new TextDecoder();
						const metadataString = decoder.decode(metadataBuffer);

						//transform metadata to object
						const metadata = JSON.parse(metadataString);

						//set metadata
						file.metadata = metadata;
						return file;
					})
				);

				const newFileList = { files: decryptedFiles };

				setFilesList(newFileList);
				setDisplayedFilesList(newFileList); // set displayed files list as well
			})
			.catch((error) => {
				console.log(error);
				//logout
				setFilesList({ files: [] });
				setDisplayedFilesList({ files: [] }); // set displayed files list as well
				dispatch(setAddress(null));
				dispatch(setCustomToken(null));
				localStorage.removeItem("customToken");
				sessionStorage.removeItem("personalSignature");
			});
	}, [address]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (filesList && filesList.files) {
			//remove all files from filesList that do not contain searchTerm in their filename

			const filteredFiles = filesList.files.filter((file: FileDB) => {
				if (searchTerm == "") return true;
				return file.metadata!.name.includes(searchTerm);
			});
			// Set a new state with the updated files list.
			setDisplayedFilesList({ ...filesList, files: filteredFiles });
		}
	};

	return (
		<div id="App">
			{/*make h1 on top of everything*/}

			{/*hidden input with ref*/}
			<input
				ref={(ref) => {
					setRef(ref);
				}}
				type="file"
				hidden
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (!file) {
						return;
					}
					setFileToUpload(file);
				}}
			/>

			<div className="container mt-4">
				<button
					onClick={onUploadFilePress}
					className="btn btn-primary mb-4"
				>
					Upload file
				</button>
				<h3>Your uploaded files:</h3>
				<form
					className="d-flex mb-4"
					onSubmit={(e: FormEvent<HTMLFormElement>) =>
						handleSubmit(e)
					}
				>
					<input
						className="form-control"
						type="text"
						placeholder="Enter custom title"
						onChange={(e) => {
							setSearchTerm(e.target.value);
						}}
					/>
					<button className="btn btn-secondary ms-2" type="submit">
						Search
					</button>
				</form>

				<FileComponent
					displayedFilesList={displayedFilesList.files}
					deleteFileFromList={deleteFileFromList}
				/>
			</div>
		</div>
	);
}

export default App;
