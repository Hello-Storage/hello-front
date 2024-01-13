import { Api, EncryptionStatus } from "api";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { Modal, useModal } from "components/Modal";
import { ChangeEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "state";
import { createFolderAction } from "state/mystorage/actions";
import { bufferToHex, encryptBuffer } from "utils/encryption/filesCipher";
import { useAuth } from "hooks";
import { Theme } from "state/user/reducer";

export default function CreateFolderModal() {
	const [, onDismiss] = useModal(<></>);
	const [title, setTitle] = useState("");
	const [loading, setLoading] = useState(false);
	const dispatch = useAppDispatch();
	const { walletAddress } = useAppSelector((state) => state.user);
	const accountType = getAccountType();
	const { encryptionEnabled, autoEncryptionEnabled } = useAppSelector(
		(state) => state.userdetail
	);
	const { logout } = useAuth();

	const getRoot = () =>
		window.location.pathname.includes("/space/folder")
			? window.location.pathname.split("/")[3]
			: "/";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onChange: ChangeEventHandler = (e: any) => {
		setTitle(e.target.value);
	};

	const handleCreateNewFolder = async () => {
		const root = getRoot();
		if (title === "") {
			toast.error("Please enter a title");
			return;
		}
		let titleFinal = title;

		let encryption_status = EncryptionStatus.Public;

		setLoading(true);
		if (encryptionEnabled) {
			const personalSignature = await getPersonalSignature(
				walletAddress,
				autoEncryptionEnabled,
				accountType,
				logout
			);
			const encryptedTitleBuffer = await encryptBuffer(
				new TextEncoder().encode(title),
				personalSignature
			);
			if (!encryptedTitleBuffer) {
				toast.error("Failed to encrypt buffer");
				return null;
			}
			titleFinal = bufferToHex(encryptedTitleBuffer);
			encryption_status = EncryptionStatus.Encrypted;
		}
		Api.post("/folder/create", {
			root: root,
			title: titleFinal,
			encryption_status: encryption_status,
		})
			.then((resp) => {
				toast.success("folder created!");
				dispatch(createFolderAction(resp.data));
			})
			.catch(() => {
				toast.error("failed!");
			})
			.finally(() => {
				setLoading(false);
				onDismiss();
			});
	};

	const { theme } = useAppSelector((state) => state.user);

	return (
		<Modal className={"p-5 rounded-lg w-80" + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
			<label className="text-xl">New Folder</label>
			<div className="mt-3">
				<input
					type="text"
					className={"w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg lock focus:border-blue-500 focus:outline-none"
						+ (theme === Theme.DARK ? " dark-theme3" : "")}
					placeholder="input folder name"
					value={title}
					onChange={onChange}
				/>
			</div>

			<div className="mt-3 text-right">
				<button
					type="button"
					className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
						+ (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
					disabled={loading}
					onClick={onDismiss}
				>
					Cancel
				</button>
				<button
					type="button"
					className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
						+ (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
					disabled={loading}
					onClick={handleCreateNewFolder}
				>
					Create
				</button>
			</div>
		</Modal>
	);
}
