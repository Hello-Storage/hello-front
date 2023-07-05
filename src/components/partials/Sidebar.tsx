import { useCallback, useEffect, useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import ConnectWalletButton from "../ConnectWalletButton";
import { useDispatch, useSelector } from "react-redux";
import {
	selectAddress,
	selectCustomToken,
	selectLoading,
	selectSelectedPage,
	selectRedirectTo,
	setAddress,
	setLoading,
	setShowPasswordModal,
	setToastMessage,
	setCustomToken,
	setSelectedPage,
	setDestiny,
	setRedirectTo,

} from "../../features/counter/accountSlice";

import {
	setFilesList,
} from "../../features/files/dataSlice";

import { AppDispatch } from "../../app/store";
import { baseUrl } from "../../constants";
import axios from "axios";
import Web3 from "web3";
import Toast from "../modals/Toast";
import PasswordModal from "../modals/PasswordModal";
import { Link, useNavigate } from "react-router-dom";

export const Sidebar = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [truncatedAddress, setTruncatedAddress] = useState<string | null>(
		null
	);

	const navigate = useNavigate();
	


	//selectors
	const loading = useSelector(selectLoading);
	const address = useSelector(selectAddress);
	const customToken = useSelector(selectCustomToken);
	const selectedPage = useSelector(selectSelectedPage);
	const redirectTo = useSelector(selectRedirectTo);

	useEffect(() => {
		if (redirectTo) {
			navigate(redirectTo);
			dispatch(setSelectedPage("home"))
			dispatch(setRedirectTo(null));
			dispatch(setDestiny(null));
		}
	}, [dispatch, navigate, redirectTo])

	const onPressConnect = async () => {
		dispatch(setShowPasswordModal(true));
		dispatch(setLoading(true));
	};

	const onPressLogout = () => {
		dispatch(setAddress(null));
		localStorage.removeItem("customToken");
		sessionStorage.removeItem("personalSignature");
		dispatch(setCustomToken(null));
		dispatch(setSelectedPage("home"));
		dispatch(setFilesList({ files: [] }));
		//FIREBASE: signOut(auth);
	};


	const checkLoggedIn = useCallback(async (customToken: string) => {
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
				dispatch(setAddress(null));
				localStorage.removeItem("customToken");
				sessionStorage.removeItem("personalSignature");
				dispatch(setCustomToken(null));
				dispatch(setSelectedPage("home"));
			});
	}, [dispatch]);


	const sidebarStyles = {
		transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
		transition: "transform 0.3s ease-in-out",
		width: "280px",
		position: "fixed" as const,
		top: "0",
		left: "0",
	};

	useEffect(() => {
		if (!customToken) {
			return;
		}
		checkLoggedIn(customToken);
		//FIREBASE: signInWithCustomToken(auth, customToken);
	}, [address, checkLoggedIn, customToken]);

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

	useEffect(() => {
		console.log("Selected page is: " + selectedPage);
	}, [selectedPage])

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
						<Link to={"/"} className={`nav-link px-2 ${selectedPage === "home" ? "link-dark" : "link-secondary"}`}
						onClick={() => {
							dispatch(setSelectedPage("home"));
						}}>
							Home
						</Link>
					</li>
					<li>
						<Link to="/dashboard" className={`nav-link px-2 ${selectedPage === "dashboard" ? "link-dark" : "link-secondary"}`}
						onClick={() => {
							dispatch(setSelectedPage("dashboard"));
						}}>
							Dashboard
						</Link>
					</li>
					<li>
						<Link to="/files" className={`nav-link px-2 ${selectedPage === "files" ? "link-dark" : "link-secondary"}`}
						onClick={() => {
							dispatch(setSelectedPage("files"));
						}}>
							Files
						</Link>
					</li>
					<li>
						<Link to={"data"} className={`nav-link px-2 ${selectedPage === "data" ? "link-dark" : "link-secondary"}`}
						onClick={() => {
							dispatch(setSelectedPage("data"));
						}}>
							Data
						</Link>
					</li>
					<li>
						<Link to={"pricing"} className={`nav-link px-2 ${selectedPage === "pricing" ? "link-dark" : "link-secondary"}`}
						onClick={() => {
							dispatch(setSelectedPage("pricing"));
						}}>
							Pricing
						</Link>
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
					<Link
						to="/"
						className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
					>
						<svg className="bi me-2" width="40" height="32">
							<use x-link:to="#bootstrap"></use>
						</svg>
						<span className="fs-4">Settings</span>
					</Link>
					<hr />
					<ul className="nav nav-pills flex-column mb-auto">
						<li className="nav-item">
							<Link
								to="/"
								className={`nav-link text-white ${selectedPage == "home" && "active"}`}
								aria-current="page"
								onClick={() => {
									dispatch(setSelectedPage("home"));
								}}
							>
								<svg className="bi" width="16" height="16">
									<use x-link:to="#home"></use>
								</svg>
								Home
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/dashboard"
								className={`nav-link text-white ${selectedPage == "dashboard" && "active"}`}
								aria-current="page"
								onClick={() => {
									dispatch(setSelectedPage("dashboard"));
								}}
							>
								<svg className="bi" width="16" height="16">
									<use x-link:to="#dashboard"></use>
								</svg>
								Dashboard
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/files"
								className={`nav-link text-white ${selectedPage == "files" && "active"}`}
								aria-current="page"
								onClick={() => {
									dispatch(setSelectedPage("files"));
								}}
							>
								<svg className="bi" width="16" height="16">
									<use x-link:to="#files"></use>
								</svg>
								Files
							</Link>
						</li>
						<li>
							<Link to="data" className={`nav-link text-white ${selectedPage == "data" && "active"}`}
							onClick={() => {
								dispatch(setSelectedPage("data"));
							}}>
								<svg className="bi" width="16" height="16">
									<use x-link:href="#table"></use>
								</svg>
								Data
							</Link>
						</li>
						<li>
							<Link to="/pricing" className={`nav-link text-white ${selectedPage == "pricing" && "active"}`}
							onClick={() => {
								dispatch(setSelectedPage("pricing"));
							}}>
								<svg className="bi" width="16" height="16">
									<use x-link:href="#grid"></use>
								</svg>
								Pricing
							</Link>
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
								<Link className="dropdown-item" to="/profile"
								onClick={() => {
									dispatch(setSelectedPage("profile"));
								}}>
									Profile
								</Link>
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
		</div>
	);
};

export default Sidebar;
