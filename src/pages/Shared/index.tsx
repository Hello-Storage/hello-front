/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handleEncryptedFiles } from "utils/encryption/filesCipher";
import {
	refreshAction,
	updateDecryptedSharedFilesAction
} from "state/mystorage/actions";
import "lightbox.js-react/dist/index.css";
import { useAppSelector } from "state";
import { File as FileType } from "api";
import { useAuth, useFetchData } from "hooks";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import Content from "pages/MyStorage/components/Content";
import { FaSquareShareNodes } from "react-icons/fa6";
import ShareModal from "./Components/ShareModal";
import UploadShareModal from "./Components/UploadShareModal";
import Imageview from "components/ImageView/Imageview";

const Shared = () => {
	const [loaded, setloaded] = useState(false);
	const [isOpenShareUpload, setisOpenShareUpload] = useState(false);
	const dispatch = useDispatch();

	const {
		sharedFiles,
		refresh,
		showShareModal,
		showPreview,
	} = useAppSelector((state) => state.mystorage);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [window.location.href]);

	useEffect(() => {
		if (refresh) {
			fetchContent().then(() => {
				setLoading(false);
				dispatch(refreshAction(false))
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refresh]);

	return (
		<section>
			{isOpenShareUpload && (
				<UploadShareModal
					isOpen={isOpenShareUpload}
					setIsopen={setisOpenShareUpload}
				></UploadShareModal>
			)}
			{showShareModal && <ShareModal />}

			<Imageview
				isOpen={showPreview}
				files={[...SharedByMe,
				...SharedwithMe]}
				loaded={loaded}
				setloaded={setloaded}
			></Imageview>
			<h3 className="my-2 text-xl">Shared files</h3>
			<button
				className="animated-bg-btn w-[230px] mb-2 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
				onClick={() => {
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
						actionsAllowed={false}
						loading={loading}
						showHorizontalFolders={false}
						files={SharedByMe}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Shared"
						identifier={1}
						setloaded={setloaded}
					/>
				</div>
				<span className="w-[2%]"></span>
				<div className="w-[99%] share-content">
					<Content
						actionsAllowed={false}
						loading={loading}
						files={SharedwithMe}
						showHorizontalFolders={false}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Received"
						identifier={2}
						setloaded={setloaded}
					/>
				</div>
			</div>
			<div className="lg:hidden w-[99%] flex-col justify-evenly items-center mb-[50px] ">
				<div>
					<Content
						actionsAllowed={false}
						loading={loading}
						files={SharedByMe}
						showHorizontalFolders={false}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Shared"
						identifier={3}
						setloaded={setloaded}
					/>
				</div>
				<div>
					<Content
						actionsAllowed={false}
						loading={loading}
						files={SharedwithMe}
						showHorizontalFolders={false}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Received"
						identifier={4}
						setloaded={setloaded}
					/>
				</div>
			</div>
		</section>

	);
};

export default Shared;
