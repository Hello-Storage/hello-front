import { Modal, useModal } from "components/Modal";
import { Folder } from "api/types";
import { useAppSelector } from "state";
import { Theme } from "state/user/reducer";

interface DeleteFolderProps {
	folder: Folder;
	setDeleteAcepted: React.Dispatch<React.SetStateAction<boolean>>;
}
export const DeleteFolderModal: React.FC<DeleteFolderProps> = ({
	folder,
	setDeleteAcepted,
}) => {
	const [, onDismiss] = useModal(<></>);

	function handleConfirm() {
		setDeleteAcepted(true);
		onDismiss()
	}

	const { theme } = useAppSelector((state) => state.user);

	return (
		<Modal className={"p-5 rounded-lg w-80" + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
			<h2 className="text-xl">Delete Folder</h2>
			<label>
				Are you sure you want to delete {folder.title} and all of its
				content?
			</label>
			<div className="mt-3 text-right">
				<button
					type="button"
					className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
						+ (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
					onClick={onDismiss}
				>
					Cancel
				</button>
				<button
					type="button"
					className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
						+ (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
					onClick={handleConfirm}
				>
					Confirm
				</button>
			</div>
		</Modal>
	);
};
