import { useRef } from "react";

interface UploadShareModalProps {
	isOpen: boolean;
	setIsopen: React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadShareModal: React.FC<UploadShareModalProps> = ({
	isOpen,
	setIsopen,
}) => {
	const closeShareModal = () => {
		setIsopen(false);
	};

	const modalRef = useRef<HTMLDivElement>(null);

	const handleClickOutside = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		if (
			modalRef.current &&
			!modalRef.current.contains(event.target as Node)
		) {
			closeShareModal();
		}
	};

	if (!isOpen) {
		return <></>;
	} else {
		return (
			<>
				<div
					className="fixed z-10 inset-0 overflow-y-auto"
					aria-labelledby="modal-title"
					role="dialog"
					aria-modal="true"
				>
					<div className="items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center flex sm:p-0">
						<div
							onClick={handleClickOutside}
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							aria-hidden="true"
						></div>

						<span
							className="hidden sm:inline-block sm:align-middle sm:h-screen"
							aria-hidden="true"
						>
							&#8203;
						</span>

						<div
							ref={modalRef}
							className="ml-[10%] flex flex-col justify-center align-center align-bottom top-5 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg "
						>
                            coming soon
                        </div>
					</div>
				</div>
			</>
		);
	}
};

export default UploadShareModal;
