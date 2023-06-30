import { useEffect, useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import ConnectWalletButton from "./ConnectWalletButton";
import { FileDB } from "../types";
import { Counter } from "../features/counter/Counter";
import { useDispatch, useSelector } from "react-redux";
import {
	selectAddress,
	selectCustomToken,
	selectLoading,
	selectShowPasswordModal,
	setAddress,
	setLoading,
	setShowPasswordModal,
	setToastMessage,
	setCustomToken
} from "../features/counter/accountSlice";
import { AppDispatch } from "../app/store";
import { baseUrl } from "../constants";
import axios from "axios";
import Web3 from "web3";
import Toast from "./Toast";
import PasswordModal from "./PasswordModal";

export const Sidebar = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [truncatedAddress, setTruncatedAddress] = useState<string | null>(
		null
	);


	const [filesList, setFilesList] = useState<{ files: FileDB[] }>({
		files: [],
	});
	const [displayedFilesList, setDisplayedFilesList] = useState<{
		files: FileDB[];
	}>({ files: [] });

	//selectors
	const passwordModalShow = useSelector(selectShowPasswordModal);
	const loading = useSelector(selectLoading);
	const address = useSelector(selectAddress);
	const customToken = useSelector(selectCustomToken);

	const onPressConnect = async () => {
		dispatch(setShowPasswordModal(true));
		dispatch(setLoading(true));
	};

	const onPressLogout = () => {
		dispatch(setAddress(null));
		localStorage.removeItem("customToken");
		sessionStorage.removeItem("personalSignature");
		dispatch(setCustomToken(null));
		setFilesList({ files: [] });
		setDisplayedFilesList({ files: [] }); // set displayed files list as well
		//FIREBASE: signOut(auth);
	};


	const checkLoggedIn = async (customToken: string) => {
		await axios
			.get(`${baseUrl}/api/welcome`, {
				headers: {
					Authorization: `Bearer ${customToken}`,
				},
			})
			.then(async (response) => {
				//log the response
				console.log(response);
				dispatch(setToastMessage(response.data.msg))
				//set the address from window.ethereum

				if (window?.ethereum?.isMetaMask) {
					//Desktop browser
					const accounts = await window.ethereum.request({
						method: "eth_requestAccounts",
					});

					const account = Web3.utils.toChecksumAddress(accounts[0]);
					dispatch(setAddress(account));
				}
			})
			.catch((error) => {
				console.log(error);
				//logout
				setFilesList({ files: [] });
				setDisplayedFilesList({ files: [] }); // set displayed files list as well
				dispatch(setAddress(null));
				localStorage.removeItem("customToken");
				sessionStorage.removeItem("personalSignature");
				dispatch(setCustomToken(null));
			});
	};
	const sidebarStyles = {
		transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
		transition: "transform 0.3s ease-in-out",
		width: "280px",
		position: "fixed" as const,
		top: "0",
		left: "0",
	};

	useEffect(() => {
		console.log("Custom token = ", customToken);
		console.log("Address = ", address);
		if (!customToken) {
			return;
		}
		checkLoggedIn(customToken);
		//FIREBASE: signInWithCustomToken(auth, customToken);
	}, [address]);

	useEffect(() => {
		//truncate the address wallet string

		if (!address) {
			return;
		}
		const truncatedAddressTemp = `${address.substring(
			0,
			6
		)}...${address.substring(address.length - 4, address.length)}`;
		setTruncatedAddress(truncatedAddressTemp);
	}, [address]);

	return (
		<div style={{ position: "fixed", top: 0, left: 0, width: "100%" }}>
			<Toast
			/>

			<PasswordModal/>
			<header
				style={{ height: "80px" }}
				className="d-flex flex-nowrap align-items-center justify-content-between py-3 mb-4 border-bottom "
			>
				<div className="d-flex align-items-center">
					<button
						className={
							isSidebarOpen
								? "btn-primary m-2 btn start-0"
								: `m-2 btn btn-custom start-0`
						}
						style={{ zIndex: 101 }}
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					>
						<i className="fas fa-bars"></i>
					</button>
					<a className="navbar-brand" href="https://joinhello.app">
						<img
							width={30}
							className="mx-2"
							src="./assets/helloicon.png"
						/>
						<img width={100} src="./assets/hellologo.png" />{" "}
					</a>
				</div>

				<ul className="d-none d-md-flex nav mb-2 justify-content-center mb-md-0 ml-auto">
					<li>
						<a href="#" className="nav-link px-2 link-secondary">
							Home
						</a>
					</li>
					<li>
						<a href="#" className="nav-link px-2 link-dark">
							Dashboard
						</a>
					</li>
					<li>
						<a href="#" className="nav-link px-2 link-dark">
							Files
						</a>
					</li>
					<li>
						<a href="#" className="nav-link px-2 link-dark">
							Data
						</a>
					</li>
					<li>
						<a href="#" className="nav-link px-2 link-dark">
							Pricing
						</a>
					</li>
				</ul>

				<div className="pe-2 ml-auto text-end">
					<ConnectWalletButton
						onPressConnect={onPressConnect}
						onPressLogout={onPressLogout}
						loading={loading}
						address={address}
						customToken={customToken}
					/>
				</div>
			</header>
			{/*sidebar toggle button (fontawesome class)*/}

			{isSidebarOpen && (
				<div
					style={sidebarStyles}
					className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100"
				>
					<a
						href="/"
						className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
					>
						<svg className="bi me-2" width="40" height="32">
							<use x-link:href="#bootstrap"></use>
						</svg>
						<span className="fs-4">Settings</span>
					</a>
					<hr />
					<ul className="nav nav-pills flex-column mb-auto">
						<li className="nav-item">
							<a
								href="#"
								className="nav-link text-white"
								aria-current="page"
							>
								<svg className="bi" width="16" height="16">
									<use x-link:href="#home"></use>
								</svg>
								Home
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link text-white"
								aria-current="page"
							>
								<svg className="bi" width="16" height="16">
									<use x-link:href="#dashboard"></use>
								</svg>
								Dashboard
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link active"
								aria-current="page"
							>
								<svg className="bi" width="16" height="16">
									<use x-link:href="#files"></use>
								</svg>
								Files
							</a>
						</li>
						<li>
							<a href="#" className="nav-link text-white">
								<svg className="bi" width="16" height="16">
									<use x-link:href="#speedometer2"></use>
								</svg>
								Dashboard
							</a>
						</li>
						<li>
							<a href="#" className="nav-link text-white">
								<svg className="bi" width="16" height="16">
									<use x-link:href="#table"></use>
								</svg>
								Data
							</a>
						</li>
						<li>
							<li>
								<a href="#" className="nav-link text-white">
									<svg className="bi" width="16" height="16">
										<use x-link:href="#grid"></use>
									</svg>
									Account
								</a>
							</li>
							<a href="#" className="nav-link text-white">
								<svg className="bi" width="16" height="16">
									<use x-link:href="#grid"></use>
								</svg>
								Pricing
							</a>
						</li>
					</ul>
					<hr />
					<div className="dropdown">
						<a
							href="#"
							className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
							id="dropdownUser1"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							{address && (
								<Jazzicon
									diameter={32}
									seed={jsNumberForAddress(address)}
								/>
							)}
							<strong>{truncatedAddress}</strong>
						</a>
						<ul
							className="dropdown-menu dropdown-menu-dark text-small shadow"
							aria-labelledby="dropdownUser1"
						>
							<li>
								<a className="dropdown-item" href="#">
									New project...
								</a>
							</li>
							<li>
								<a className="dropdown-item" href="#">
									Settings
								</a>
							</li>
							<li>
								<a className="dropdown-item" href="#">
									Profile
								</a>
							</li>
							<li>
								<hr className="dropdown-divider" />
							</li>
							<li>
								<a className="dropdown-item" href="#">
									Sign out
								</a>
							</li>
						</ul>
					</div>
				</div>
			)}
			{/*<Counter />*/}
			<p>Address: {address ? address : "not connected"}</p>
		</div>
	);
};

export default Sidebar;
