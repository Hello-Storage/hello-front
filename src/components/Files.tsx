import "../App.css";
import { FormEvent, useEffect, useState } from "react";
import FileComponent from "./FileComponent";
import { FileDB, FileUploadResponseWithTime } from "../types";
import { uploadFile } from "../requests/clientRequests";
import {
	getHashFromSignature,
	getKeyFromHash,
} from "../helpers/cipher";
import { useDispatch, useSelector } from "react-redux";
import {
	selectCustomToken,
	setAddress,
	removeCustomToken,
	setShowToast,
	setToastMessage,
} from "../features/counter/accountSlice";

import {
	selectFilesList,
	setFilesList,
	addFile,
	selectEncryptionTime,
	setEncryptionTime,
	selectDisplayedFilesList,
	setDisplayedFilesList,
} from "../features/files/dataSlice";
import { AppDispatch } from "../app/store";
import { useLocation, useNavigate } from "react-router-dom";
import { isSignedIn } from "../helpers/userHelper";
import { decryptMetadata } from "../helpers/storageHelper";
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

const currentPage = "files";

function Files() {


	const [uploadProgress, setUploadProgress] = useState(0);

	//if not signed in, remove all credentials and redirect to login
	useEffect(() => {
		if (!isSignedIn(navigate, currentPage)) {
			return;
		}
		if (!customToken) {
			//go to /login if no customToken
			dispatch(setAddress(null));
			dispatch(removeCustomToken())
			sessionStorage.removeItem("personalSignature");
			//redirect to login
			location.pathname !== "/login" && location.pathname !== "/register"
				? navigate(`/login/${currentPage}`)
				: console.log("already on login page");

			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		NProgress.configure({ showSpinner: false })
		NProgress.set(uploadProgress)
	}, [uploadProgress])

	const location = useLocation();
	const navigate = useNavigate();

	const dispatch = useDispatch<AppDispatch>();

	//selectors
	//const address = useSelector(selectAddress);
	const customToken = useSelector(selectCustomToken);
	const encryptionTime = useSelector(selectEncryptionTime);

	//states
	const [ref, setRef] = useState<HTMLInputElement | null>(null);
	const [fileToUplad, setFileToUpload] = useState<File | null>(null);


	const filesList = useSelector(selectFilesList);


	useEffect(() => {
		NProgress.remove()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);



	const displayedFilesList = useSelector(selectDisplayedFilesList);

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
					dispatch(setDisplayedFilesList([
						...displayedFilesList, file
					]));

					dispatch(setToastMessage(`File uploaded successfully.\nEncrypting took: ${encryptionTime}ms`));
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
			const updatedFilesList = displayedFilesList.filter(
				(item: FileDB) => item.ID !== file.ID
			);
			setFilesList( [...filesList, updatedFilesList ]);
			dispatch(setDisplayedFilesList({
				updatedFilesList
			}))
		}
	};




	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (filesList && filesList) {
			//remove all files from filesList that do not contain searchTerm in their filename

			const filteredFiles = filesList.filter((file: FileDB) => {
				if (searchTerm == "") return true;
				return file.metadata?.name.toLowerCase().includes(searchTerm.toLowerCase());
			});
			// Set a new state with the updated files list.
			dispatch(setDisplayedFilesList( filteredFiles ));
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

			<div className="container mt-5">
				<button
					onClick={onUploadFilePress}
					className="btn btn-primary mb-4 z-index-1"
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
				{displayedFilesList.length === 0 ? <h4>No files found</h4> :
					<>
						<FileComponent
							deleteFileFromList={deleteFileFromList}
						/>
					</>
				}			</div>
		</div>
	);
}

export default Files;
