/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handleEncryptedFiles } from "utils/encryption/filesCipher";
import {
	refreshAction,
	setSelectedShareFile,
	setSelectedSharedFiles,
	updateDecryptedSharedFilesAction
} from "state/mystorage/actions";
import { useAppSelector } from "state";
import { File as FileType } from "api";
import { useAuth, useFetchData } from "hooks";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import Content from "pages/MyStorage/components/Content";
import { FaSquareShareNodes } from "react-icons/fa6";
import ShareModal from "./Components/ShareModal";
import UploadShareModal from "./Components/UploadShareModal";
import { useModal } from "components/Modal";
import { CustomFileViewer } from "components/ImageView/CustomFileViewer";

const Shared = () => {
	const [isOpenShareUpload, setisOpenShareUpload] = useState(false);
	const dispatch = useDispatch();



	const {
		sharedFiles,
		sharedFolders,
		refresh,
		showShareModal,
		showPreview,
	} = useAppSelector((state) => state.mystorage);


	console.log(sharedFolders);

	const [SharedByMe, setSharedByMe] = useState<FileType[]>([]);

	const [SharedwithMe, setSharedwithMe] = useState<FileType[]>([]);

	const [loading, setLoading] = useState(false);

	const personalSignatureRef = useRef<string | undefined>();

	const { name } = useAppSelector((state) => state.user);
	const { autoEncryptionEnabled } = useAppSelector(
		(state) => state.userdetail
	);
	const { logout } = useAuth();
	const accountType = getAccountType();
	const { fetchSharedContent } = useFetchData();

	const hasCalledGetPersonalSignatureRef = useRef<boolean>(false);

	async function fetchContent() {
		setLoading(true);

		if (
			!personalSignatureRef.current &&
			!hasCalledGetPersonalSignatureRef.current
		) {
			hasCalledGetPersonalSignatureRef.current = true;

			personalSignatureRef.current = await getPersonalSignature(
				name,
				autoEncryptionEnabled,
				accountType
			); //Promie<string | undefined>
			if (!personalSignatureRef.current) {
				toast.error("Failed to get personal signature");
				logout();
				return;
			}
		}

		const decryptedFilesSharedWithMe = await handleEncryptedFiles(
			sharedFiles.sharedWithMe
				? sharedFiles.sharedWithMe.slice()
				: [],
			personalSignatureRef.current || "",
			name,
			autoEncryptionEnabled,
			accountType,
			logout
		);
		const decryptedFilesSharedByMe = await handleEncryptedFiles(
			sharedFiles.sharedByMe ? sharedFiles.sharedByMe.slice() : [],
			personalSignatureRef.current || "",
			name,
			autoEncryptionEnabled,
			accountType,
			logout
		);

		if (
			decryptedFilesSharedWithMe &&
			decryptedFilesSharedByMe &&
			decryptedFilesSharedWithMe.length > 0 &&
			decryptedFilesSharedByMe.length > 0
		) {
			dispatch(
				updateDecryptedSharedFilesAction({
					sharedByMe: decryptedFilesSharedByMe,
					sharedWithMe: decryptedFilesSharedWithMe,
				})
			);
		}

		setSharedByMe(decryptedFilesSharedByMe || []);
		setSharedwithMe(decryptedFilesSharedWithMe || []);

		if (!decryptedFilesSharedByMe || !decryptedFilesSharedWithMe) {
			toast.error("Failed to decrypt content");
			fetchSharedContent(setLoading);
		}
	}

	useEffect(() => {
		fetchSharedContent()
		dispatch(refreshAction(true))
	}, []);

	useEffect(() => {
		if (refresh) {
			fetchContent().then(() => {
				setLoading(false);
				dispatch(refreshAction(false))
			});
		}
	}, [sharedFiles]);

	const [onPresent] = useModal(<CustomFileViewer
		files={[...SharedByMe,
		...SharedwithMe]}
	/>);

	useEffect(() => {
		if (showPreview && [...SharedByMe,
		...SharedwithMe].length > 0 && !showShareModal) {
			onPresent();
		}
	}, [showPreview]);

	return (
		<section>
			{isOpenShareUpload && (
				<UploadShareModal
					isOpen={isOpenShareUpload}
					setIsopen={setisOpenShareUpload}
				></UploadShareModal>
			)}
			{showShareModal && <ShareModal />}

			<h3 className="my-2 text-xl">Shared files</h3>
			<button
				className="animated-bg-btn w-[230px] mb-2 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
				onClick={() => {
					dispatch(setSelectedSharedFiles(undefined))
					dispatch(setSelectedShareFile(undefined));
					setisOpenShareUpload(!isOpenShareUpload);
				}}
			>
				<span className="btn-transition"></span>
				<label className="flex items-center justify-center w-full gap-2 text-sm text-white">
					<FaSquareShareNodes className="animated-btn-icon" /> Share Files
				</label>
			</button>
			<div className="hidden w-full lg:flex">
				<div className="w-[99%] share-content">
					<Content
						actionsAllowed={true}
						loading={loading}
						showHorizontalFolders={false}
						files={SharedByMe}
						folders={sharedFolders.sharedByMe}
						view="list"
						showFolders={true}
						filesTitle="Shared"
						identifier={1}
					/>
				</div>
				<span className="w-[2%]"></span>
				<div className="w-[99%] share-content">
					<Content
						actionsAllowed={true}
						loading={loading}
						files={SharedwithMe}
						showHorizontalFolders={false}
						folders={sharedFolders.sharedWithMe}
						view="list"
						showFolders={true}
						filesTitle="Received"
						identifier={2}
					/>
				</div>
			</div>
			<div className="lg:hidden w-[99%] flex-col justify-evenly items-center mb-[50px] ">
				<div>
					<Content
						actionsAllowed={true}
						loading={loading}
						files={SharedByMe}
						showHorizontalFolders={false}
						folders={sharedFolders.sharedByMe}
						view="list"
						showFolders={true}
						filesTitle="Shared"
						identifier={3}
					/>
				</div>
				<div>
					<Content
						actionsAllowed={true}
						loading={loading}
						files={SharedwithMe}
						showHorizontalFolders={false}
						folders={sharedFolders.sharedWithMe}
						view="list"
						showFolders={true}
						filesTitle="Received"
						identifier={4}
					/>
				</div>
			</div>
		</section>

	);
};

export default Shared;
