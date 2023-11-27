import { useDispatch } from "react-redux";
//import { selectShowShareModal, setShowShareModal } from "../../features/storage/filesSlice";
import { useEffect, useRef, useState } from "react";
//import { setLoading, setShowToast, setToastMessage } from "../../features/account/accountSlice";
//import { OverlayTrigger, Tooltip } from "react-bootstrap";
//import { FileDB, FileMetadata } from "../../types";
//import { getFileSharedState, shareFile, unshareFile } from "../../requests/shareRequests";
import { AxiosError, AxiosResponse } from "axios";
//import { baseName } from "../../constants";
//import { logOut } from "../../requests/clientRequests";
import { Api } from "api";
import {
	setSelectedShareFile,
	setShowShareModal,
} from "state/mystorage/actions";
import { useAppSelector } from "state";
import { toast } from "react-toastify";
import { shareFile, unshareFile } from "../Utils/shareUtils";
import { useNavigate } from "react-router-dom";
// type IconWithTooltipProps = {
// 	IconComponent: any; // Esto es para componentes sin props
// 	tooltipText: string;
// };

//can be public, one time, address restricted, password restricted, temporary link or subscription

//share type interface:

//const ShareModal = (props: { selectedFile: File | null, navigate: NavigateFunction, currentPage: string }) => {
const ShareModal = () => {
	//const navigate = props.navigate;
	//const currentPage = props.currentPage;
	//const selectedFile: File | null = props.selectedFile;
	const [fileSharedState, setFileSharedState] = useState<ShareState>();

	// const [showDescriptionIndex, setShowDescriptionIndex] = useState<
	// 	number | null
	// >(null);
	const [pinnedDescriptionIndex, setPinnedDescriptionIndex] = useState<
		number | null
	>(null);

	const modalRef = useRef<HTMLDivElement>(null);

	const dispatch = useDispatch();

	const { showShareModal, selectedShareFile } = useAppSelector(
		(state) => state.mystorage
	);

	const hasRun = useRef(false);

	useEffect(() => {
		if (!hasRun.current && selectedShareFile) {
			hasRun.current = true;
			//fetch file shared state
			Api.get<ShareState>("/file/share/state", {
				params: {
					file_uid: selectedShareFile.uid,
				},
			})
				.then((res) => {
					//if res is AxiosResponse:
					if ((res as AxiosResponse).status === 200) {
						res = res as AxiosResponse;
						const shareState = res?.data as ShareState;
						setFileSharedState(shareState);
						if (shareState.public_file.id !== 0) {
							setSelectedShareTypes((prevTypes) => [
								...prevTypes,
								"public",
							]);
						}
						//dispatch(setLoading(false));
						//dispatch(setToastMessage("File shared successfully"));
						//dispatch(setShowToast(true));
					} else {
						//dispatch(setLoading(false));
						toast.error(JSON.stringify(res));
						//dispatch(setShowToast(true));
					}
				})
				.catch((err) => {
					toast.error(err.message);
					//setShareError(err.message);
				});
		}
	}, [selectedShareFile]);

	const shareDetails: ShareDetails[] = [
		{
			type: "public",
			title: "Public",
			description:
				"Generate a public URL that anyone you share it to can access. This URL will be valid until you disable it. Deletion of the file from the entire Internet is not granted.",
			state: "enabled",
		},
		// {
		//     type: "one-time",
		//     title: "One-time only",
		//     description: "Generate an obfuscated URL that can be accessed only once. Once visited, the URL will self-destroy.",
		//     state: "disabled"
		// },
		// {
		//     type: "address-restricted",
		//     title: "Address restricted",
		//     description: "Generate a URL that can be accessed only from a specific wallet address that has to be verified with a provider's signature.",
		//     state: "disabled"
		// },
		// {
		//     type: "password-protected",
		//     title: "Password protected",
		//     description: "Generate a URL that can be accessed only by providing a password. The password' hash will be stored in the blockchain and will be required to access the file.",
		//     state: "disabled"
		// },
		// {
		//     type: "temporary-link",
		//     title: "Temporary link",
		//     description: "Generate a URL that can be accessed only for a limited time. The URL will self-destroy after the time expires.",
		//     state: "disabled"
		// },
		// {
		//     type: "subscription",
		//     title: "Subscription based",
		//     description: "Not implememnted yet. This feature will allow you to generate a URL for the content that can be accessed only by paying a subscription.",
		//     state: "disabled"
		// }
	];

	const [shareError, setShareError] = useState("");
	const [selectedShareTypes, setSelectedShareTypes] = useState<string[]>([]);

	const closeShareModal = () => {
		dispatch(setSelectedShareFile(undefined));
		dispatch(setShowShareModal(!showShareModal));
	};

	const handleShareChange =
		(type: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
			const shareTypeObject = shareDetails.find((st) => st.type === type);
			if (!shareTypeObject || !selectedShareFile) {
				setShareError("Invalid share type");
			} else if (selectedShareFile.decrypted === false) {
				setShareError("File is not decrypted yet");
			} else if (shareTypeObject.state === "disabled") {
				setShareError("This share type is not available yet");
			} else {
				setShareError("");
				if (e.target.checked) {
					//handle sharing from shareRequests.ts

					shareFile(selectedShareFile, type)
						.then((res) => {
							//if res is AxiosResponse:
							if ((res as AxiosResponse).status === 200) {
								res = res as AxiosResponse;
								const shareState = res?.data as ShareState;
								setFileSharedState(shareState);
								if (shareState.public_file.id !== 0) {
									setSelectedShareTypes((prevTypes) => [
										...prevTypes,
										"public",
									]);
								}
								toast.success("File shared successfully");
							}
							if ((res as AxiosError).isAxiosError) {
								toast.error("Error sharing file");
							}
						})
						.catch((err) => {
							setShareError(err.message);
						});
				} else {
					unshareFile(selectedShareFile, type)
						.then((res) => {
							//if res is AxiosResponse:
							if ((res as AxiosResponse).status === 200) {
								res = res as AxiosResponse;
								const shareState = res?.data as ShareState;
								setFileSharedState(shareState);
								//if public_file.id is 0, remove public from selectedShareTypes
								if (shareState.public_file.id === 0) {
									setSelectedShareTypes((prevTypes) =>
										prevTypes.filter((st) => st !== "public")
									);
								}
							}
							if ((res as AxiosError).isAxiosError) {
								toast.error("Error unsharing file");
							}
						})
						.catch((err) => {
							setShareError(err.message);
						});

					setSelectedShareTypes((prevTypes) => [...prevTypes, type]);
				}
			}
		};

	const handleClickOutside = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			closeShareModal();
		}
	};

	const navigate = useNavigate();
	/*
		  //shareType useEffect listener
		  useEffect(() => {
			  if (selectedShareTypes.length > 0) {
				  setShareError("");
			  }
		  }, [selectedShareTypes])
	  */
	return (
		<>
			{showShareModal && selectedShareFile && (
				<div
					className="fixed inset-0 z-10 overflow-y-auto"
					aria-labelledby="modal-title"
					role="dialog"
					aria-modal="true"
				>
					<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
						<div
							onClick={handleClickOutside}
							className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
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
							<div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-left sm:mt-0 sm:text-left">
										<h3
											className="text-lg font-medium leading-6 text-gray-900"
											id="modal-title"
										>
											Share content
										</h3>
										<div className="mt-2">
											<p className="mb-4">
												File name: {selectedShareFile.name}
											</p>
											{shareDetails.map((sd, index) => {
												return (
													<div
														className="col-12 form-check form-switch"
														key={index}
													>
														<label
															className="form-check-label"
															htmlFor={`flexSwitch${sd.type}`}
														>
															<div className="flex flex-col">
																<div className="flex flex-row items-center">
																	<input
																		type="checkbox"
																		className="w-5 h-5 text-blue-600 form-checkbox"
																		checked={selectedShareTypes.includes(
																			sd.type
																		)}
																		onChange={handleShareChange(sd.type)}
																		disabled={sd.state === "disabled"}
																	/>
																	<span className="ml-2 text-gray-700">
																		{sd.title}
																	</span>
																	<span
																		className="ml-2 text-gray-500 cursor-pointer"
																		onClick={() =>
																			pinnedDescriptionIndex === index
																				? setPinnedDescriptionIndex(null)
																				: setPinnedDescriptionIndex(index)
																		}
																	>
																		<i className="p-2 fas fa-thin fa-question-circle me-2"></i>
																	</span>
																</div>

																{pinnedDescriptionIndex === index && (
																	<span
																		id="description"
																		className="flex p-2 ml-2 text-sm bg-gray-200 rounded"
																	>
																		{sd.description}
																	</span>
																)}
															</div>
														</label>
														{sd.type === "public" &&
															fileSharedState?.public_file.id !== 0 && (
																<div className="flex flex-col">
																	<label
																		htmlFor="shareLink"
																		className="form-label"
																	>
																		Share link
																	</label>
																	<div className="">
																		<input
																			type="email"
																			className="mb-2 underline form-control text-cyan-600 text-ellipsis"
																			id="shareLink"
																			aria-describedby="shareLink"
																			value={`${window.location.origin}/space/shared/public/${fileSharedState?.public_file.share_hash}`}
																			onClick={() => {
																				//copy to clipboard
																				navigator.clipboard.writeText(
																					`${window.location.origin}/space/shared/public/${fileSharedState?.public_file.share_hash}`
																				);
																				toast.success(
																					"Link copied to clipboard"
																				);
																			}}
																			readOnly
																		/>
																		<button
																			className="ml-2 btn btn-primary"
																			onClick={() =>
																				navigate(
																					`/space/shared/public/${fileSharedState?.public_file.share_hash}`
																				)
																			}
																		>
																			<i className="fas fa-external-link-alt"></i>{" "}
																			Go
																		</button>
																	</div>
																</div>
															)}
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</div>

							{shareError && (
								<div className="alert alert-danger" role="alert">
									{shareError}
								</div>
							)}
							<div className="px-4 py-3 bg-gray-50 sm:px-6">
								<button
									type="button"
									className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-500 border border-transparent rounded-md shadow-sm sm:w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:text-sm"
									onClick={closeShareModal}
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);

};

export default ShareModal;
