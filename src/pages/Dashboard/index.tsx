/** @format */

import { useResizeDetector } from "react-resize-detector";
import World from "./components/World";
import Chart from "./components/Chart";
import { Api } from "api";
import { useAppSelector } from "state";
import { useEffect, useState } from "react";
import useFetchData from "hooks/useFetchData";
import { Theme } from "state/user/reducer";

export default function Dashboard() {
	const { fetchUserDetail } = useFetchData();
	const [selectedRange, setselectedRange] = useState("Day")

	const { width, height, ref } = useResizeDetector();
	const { uid } = useAppSelector((state) => state.user);
	const [counttotalusedstorageuser, setcounttotalusedstorageuser] =
		useState(0);
	const [counttotalencryptedfilesuser, setcounttotalencryptedfilesuser] =
		useState("");
	const [counttotalpublicfilesuser, setcounttotalpublicfilesuser] =
		useState("");
	const [counttotalfilesuser, setcounttotalfilesuser] = useState("");
	const [counttotalpublicfoldersuser, setcounttotalpublicfoldersuser] =
		useState("");
	const [loading, setLoading] = useState(true);

	function formatBytes(bytes: number): string {
		if (bytes === 0) return "0 Byte";

		const k = 1024;

		const sizes = [
			" Bytes",
			" KiB",
			" MiB",
			" GiB",
			" TiB",
			" PiB",
			" EiB",
			" ZiB",
			" YiB",
		];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / k ** i).toFixed(2)) + sizes[i];
	}

	const fetchData = () => {
		// Esta URL debe ser la ruta de tu backend

		Api.get("statistics/" + uid)
			.then((response) => {
				const data = response.data;
				setcounttotalusedstorageuser(data.CountTotalUsedStorageUser);
				setcounttotalencryptedfilesuser(
					data.CountTotalEncryptedFilesUser
				);
				setcounttotalpublicfilesuser(data.CountTotalPublicFilesUser);
				setcounttotalfilesuser(data.CountTotalFilesUser);
				setcounttotalpublicfoldersuser(
					data.CountTotalPublicFoldersUser
				);
				setLoading(false);
			})
			.catch((error) => {
				console.error("There was an error loading data", error);
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchData();
		fetchUserDetail();

		// 15 seconds update interval
		const intervalId = setInterval(fetchData, 15000);

		return () => clearInterval(intervalId);
	}, []);
	
	const {theme} = useAppSelector((state) => state.user);

	return (
		<div className={"dashboard-container"+ (theme===Theme.DARK? " dark-theme" : "")}>
			<h1 className="text-xl font-medium">Dashboard</h1>
			<div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2 lg:grid-cols-5 md:gap-10">
				<div className="p-3 border rounded-md">
					<label>Used Storage</label>
					<div className="">
						<label className="text-sm text-gray-500">
							<label className={"text-2xl font-semibold "+ (theme===Theme.DARK? " text-white" : "text-black")}>
								{formatBytes(counttotalusedstorageuser)}
							</label>
						</label>
					</div>
				</div>

				<div className="p-3 border rounded-md">
					<label>Total files</label>
					<div className="">
						<label className={"text-2xl font-semibold "+ (theme===Theme.DARK? " text-white" : "text-black")}>
							{counttotalfilesuser}
						</label>
					</div>
				</div>

				<div className="p-3 border rounded-md">
					<label>Public files</label>
					<div className="">
						<label className="text-sm text-gray-500">
							<label className={"text-2xl font-semibold "+ (theme===Theme.DARK? " text-white" : "text-black")}>
								{counttotalpublicfilesuser}
							</label>{" "}
							/ files
						</label>
					</div>
				</div>

				<div className="p-3 border rounded-md">
					<label>Encrypted files</label>
					<div className="">
						<label className="text-sm text-gray-500">
							<label className={"text-2xl font-semibold "+ (theme===Theme.DARK? " text-white" : "text-black")}>
								{counttotalencryptedfilesuser}
							</label>{" "}
							/ files
						</label>
					</div>
				</div>

				<div className="p-3 border rounded-md b-classname">
					<label>Folders</label>
					<div className="">
						<label className="text-sm text-gray-500">
							<label className={"text-2xl font-semibold "+ (theme===Theme.DARK? " text-white" : "text-black")}>
								{counttotalpublicfoldersuser}
							</label>{" "}
							/ folders
						</label>
					</div>
				</div>
			</div>
			<hr className="my-6" />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div
					className="flex flex-col items-start h-full overflow-hidden"
					ref={ref}>
					<h3 className="text-xl font-medium">
						Storage distribution
					</h3>
					<World
						size={
							width
								? width < 700
									? width * 0.7
									: width * 0.6
								: 0
						}
					/>

					<h5 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-center lg:mt-[-25px] md::mt-[-10px] z-50 w-full ">
						Hello Network data nodes across the globe
					</h5>
				</div>

				<div className="flex-1 mb-[90px] ">
					<div className="flex flex-row items-center justify-center">
						<h5 className="mr-2 text-xl font-medium">
							Storage used by{" "+selectedRange}
						</h5>
					</div>

					<div className="w-full h-[90%] flex flex-col justify-center items-center">
						<Chart period={selectedRange.toLowerCase()}/>
					</div>
					<div className="flex items-center justify-center w-full mt-4 ">
						<p className="mr-2">
						Select Time Period
						</p>
						<select
							id="timePeriod"
							name="timePeriod"
							className={"block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"+ (theme===Theme.DARK? " dark-theme3" : "")}
							defaultValue="day"
							onChange={(e)=>{
								const selected=e.target.querySelector('option:checked')?.textContent
								setselectedRange(selected+"");
							}}
							>
							<option value="day">Day</option>
							<option value="week">Week</option>
							<option value="month">Month</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	);
}
