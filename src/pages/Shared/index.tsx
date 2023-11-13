import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublishedFile } from "./Utils/shareUtils";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDispatch } from "react-redux";
import { handleEncryptedFiles } from "utils/encryption/filesCipher";
import { updateDecryptedSharedFilesAction } from "state/mystorage/actions";
import "lightbox.js-react/dist/index.css";
import { useAppSelector } from "state";
import { File as FileType } from "api";
import { useAuth, useFetchData } from "hooks";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import Content from "pages/MyStorage/components/Content";
dayjs.extend(relativeTime);

const Shared = (props: { shareType: string }) => {
	//get the hash from the url
	const { hash } = useParams();
	const shareType = props.shareType;

	const dispatch = useDispatch();

	const { sharedFiles, path } = useAppSelector((state) => state.mystorage);

	const [SharedByMe, setSharedByMe] = useState<FileType[]>([]);

	const [SharedwithMe, setSharedwithMe] = useState<FileType[]>([]);

	const [loading, setLoading] = useState(false);

	const personalSignatureRef = useRef<string | undefined>();

	const [currentPage, setCurrentPage] = useState(1);

	const { name } = useAppSelector((state) => state.user);
	const { autoEncryptionEnabled } = useAppSelector(
		(state) => state.userdetail
	);
	const { logout } = useAuth();
	const accountType = getAccountType();
	const { fetchRootContent } = useFetchData();

	const [personalSignatureDefined, setPersonalSignatureDefined] = useState(
		false
	);
	const hasCalledGetPersonalSignatureRef = useRef<boolean>(false);

	useEffect(() => {
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
				sharedFiles.sharedWithMe? sharedFiles.sharedWithMe.slice() : [],
				personalSignatureRef.current || "",
				name,
				autoEncryptionEnabled,
				accountType,
				logout
			);
			const decryptedFilesSharedByMe = await handleEncryptedFiles(
				sharedFiles.sharedByMe? sharedFiles.sharedByMe.slice() : [],
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
				fetchRootContent(setLoading);
			}
		}
		fetchContent().then(() => {
			setLoading(false);
			setPersonalSignatureDefined(true);
		});
	}, [path, currentPage]);
	useEffect(() => {
		if (personalSignatureDefined) {
			if (!personalSignatureRef.current) {
				return;
			}

			fetchRootContent();
			setCurrentPage(1);
		}
	}, [location, name, personalSignatureRef.current]);

	return (
		<div>
			<h3 className="text-xl py-2">Shared files</h3>
			<div className="hidden lg:flex w-full">
				<div className="w-full">
					<Content
						loading={loading}
						files={SharedByMe}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Recived"
						identifier={1}
					/>
				</div>
				<div className="w-full">
					<Content
						loading={loading}
						files={SharedwithMe}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Shared"
						identifier={2}
					/>
				</div>
			</div>
			<div className="lg:hidden  w-fullflex-row justify-evenly items-center">
				<div>
					<Content
						loading={loading}
						files={SharedByMe}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Recived"
						identifier={3}
					/>
				</div>
				<div>
					<Content
						loading={loading}
						files={SharedwithMe}
						folders={[]}
						view="list"
						showFolders={false}
						filesTitle="Shared"
						identifier={4}
					/>
				</div>
			</div>
		</div>
	);
};

export default Shared;
