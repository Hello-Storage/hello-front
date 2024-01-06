import { Modal, useModal } from "components/Modal";
import { Folder } from "api/types";

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

	return (
		<Modal className="p-5 bg-white rounded-lg w-80">
			<h2 className="text-xl">Delete Folder</h2>
			<label>
				Are you sure you want to delete {folder.title} and all of its
				content?
			</label>
			<div className="mt-3 text-right">
				<button
					type="button"
					className="text-blue-700 bg-transparent hover:bg-gray-200 focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
					onClick={onDismiss}
				>
					Cancel
				</button>
				<button
					type="button"
					className="text-blue-700 bg-transparent hover:bg-gray-200 focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
					onClick={handleConfirm}
				>
					Confirm
				</button>
			</div>
		</Modal>
	);
};
