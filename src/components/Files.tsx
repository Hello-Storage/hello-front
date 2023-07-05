import "../App.css";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import FileComponent from "./FileComponent";
import { FileDB, FileUploadResponseWithTime } from "../types";
import { baseUrl } from "../constants";
import { uploadFile } from "../requests/clientRequests";
import {
	getHashFromSignature,
	getKeyFromHash,
} from "../helpers/cipher";
import { useDispatch, useSelector } from "react-redux";
import {
	selectAddress,
	selectCustomToken,
	setAddress,
	setCustomToken,
	setShowToast,
	setToastMessage,
} from "../features/counter/accountSlice";

import {
	selectFilesList,
	setFilesList,
	addFile,
	selectEncryptionTime,
	setEncryptionTime,
} from "../features/files/dataSlice";
import { AppDispatch } from "../app/store";
import { useLocation, useNavigate } from "react-router-dom";
import { isSignedIn } from "../helpers/userHelper";
import { decryptMetadata } from "../helpers/fileHelper";
import NProgress from 'nprogress';
import TopBarProgress from "react-topbar-progress-indicator";
import 'nprogress/nprogress.css'; // Import CSS



TopBarProgress.config({
	barColors: {
		"0": "#fff",
		"1.0": "#fff"
	},
	shadowBlur: 5,
})


function Files() {


	const [uploadProgress, setUploadProgress] = useState(0);


	useEffect(() => {
		NProgress.configure({ showSpinner: false })
		NProgress.set(uploadProgress)
	}, [uploadProgress])

	useEffect(() => {
		NProgress.remove()
	}, [])

	const location = useLocation();
	const navigate = useNavigate();

	const dispatch = useDispatch<AppDispatch>();

	//selectors
	const address = useSelector(selectAddress);
	const customToken = useSelector(selectCustomToken);
	const encryptionTime = useSelector(selectEncryptionTime);

	//states
	const [ref, setRef] = useState<HTMLInputElement | null>(null);
	const [fileToUplad, setFileToUpload] = useState<File | null>(null);


	const filesList = useSelector(selectFilesList);





	const [displayedFilesList, setDisplayedFilesList] = useState<{
		files: FileDB[];
	}>({ files: [] });
	const [searchTerm, setSearchTerm] = useState("");

	const onUploadFilePress = () => {
		setFileToUpload(null);
		ref?.click();
	};

	useEffect(() => {
		if (!fileToUplad) {
			return;
		}
		//wrap uploadProgresss and setUploadProgress in a function
		//to be able to pass it to uploadFile
		const updateUploadProgress = (progress: number) => {
			setUploadProgress(progress);
		};
		uploadFile(fileToUplad, updateUploadProgress)
			.then(
				async (
					uploadFileResponse: FileUploadResponseWithTime | null
				) => {
					NProgress.done()
					//console.log(uploadFileResponse);
					dispatch(setEncryptionTime(uploadFileResponse?.encryptionTime || 0));
					setFileToUpload(null);
					//update files list
					if (!uploadFileResponse?.response.data?.file) {
						return;
					}
					
					const file: FileDB = uploadFileResponse?.response.data?.file;

					//decrypt metadata
					const signature = sessionStorage.getItem("personalSignature");

					if (!signature) {
						navigate("/profile");
						return;
					}

					const hash = await getHashFromSignature(signature);
					const key = await getKeyFromHash(hash);
					const metadata = await decryptMetadata(file.encryptedMetadata, file.iv, key);
					//set metadata
					file.metadata = metadata;
					//add file to files list
					dispatch(addFile(file));
					//add file to displayed files list



					setDisplayedFilesList({
						...displayedFilesList,
						files: [...displayedFilesList.files, file],
					});

					dispatch(setToastMessage(`File uploaded successfully.\nEncryption time: ${encryptionTime}ms`));
					dispatch(setShowToast(true));
				}
			)
			.catch((error) => {
				NProgress.remove()
				console.log(error);

				setFileToUpload(null);

				dispatch(
					setToastMessage("Error uploading file: " + error.message)
				);
				dispatch(setShowToast(true));
			})
			.catch((error) => {
				console.log(error);
			});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, displayedFilesList, fileToUplad, navigate]);

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

	//if not signed in, remove all credentials and redirect to login
	useEffect(() => {
		if (!isSignedIn(navigate, "files")) {
			return;
		}
	}, [navigate])

	useEffect(() => {
		//get files list from /api/files with auth header "Bearer customToken"
		if (!customToken) {
			//go to /login if no customToken
			dispatch(setAddress(null));
			dispatch(setCustomToken(null));
			sessionStorage.removeItem("personalSignature");
			//redirect to login
			location.pathname !== "/login" && location.pathname !== "/register"
				? navigate("/login/files")
				: console.log("already on login page");

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

				if (!signature) {
					return;
				}

				const hash = await getHashFromSignature(signature);
				const key = await getKeyFromHash(hash);
				//iterate through filesList and decrypt metadata
				const decryptedFiles = await Promise.all(
					filesList.files.map(async (file: FileDB) => {
						//decrypt metadata
						const metadata = await decryptMetadata(file.encryptedMetadata, file.iv, key);
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
	}, [address, customToken, dispatch, location.pathname, navigate]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (filesList && filesList) {
			//remove all files from filesList that do not contain searchTerm in their filename

			const filteredFiles = filesList.filter((file: FileDB) => {
				if (searchTerm == "") return true;
				return file.metadata?.name.includes(searchTerm);
			});
			// Set a new state with the updated files list.
			setDisplayedFilesList({ ...filesList, files: filteredFiles });
		}
	};

	return (
		<div >
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

export default Files;
