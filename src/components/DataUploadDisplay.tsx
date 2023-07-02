import { useEffect, useState } from "react";
import "../styles/DataUploadDisplay.module.css";
const DataUploadDisplay = () => {
	const [uploadData, setUploadData] = useState(0);

	useEffect(() => {
		//https://messari.io/report/state-of-filecoin-q1-2023
		const petabytePerDay = 1; //1 petabyte is uploaded to Filecoin according statistics
		const gigabytesPerDay = petabytePerDay * Math.pow(1024, 2);
		const secondsPerDay = 24 * 60 * 60;

		const gigabytesPerSecond = gigabytesPerDay / secondsPerDay;

		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0); //set to the start of the day
		const now = new Date();

		const secondsSinceStartOfDay =
			(now.getTime() - startOfDay.getTime()) / 1000; // calculate how many seconds have passed since the start of the day

		const initialUploadData = secondsSinceStartOfDay * gigabytesPerSecond; // calculate how many gigabytes have been uploaded since the start of the day
		setUploadData(initialUploadData);

		const interval = setInterval(() => {
			setUploadData((uploadData) => uploadData + gigabytesPerSecond); // add gigabytesPerSecond to the uploadData every second
		}, 1000);

		return () => clearInterval(interval); // cleanup function to clear the interval when the component unmounts
	}, []);

	return (
		<div
	style={{
		background: "linear-gradient(270deg, #12238c, #ff7eb3)",
		backgroundSize: "100% 100%",
		animation: "Gradient 2s ease infinite",
		width: "100%",
	}}
	className="d-flex rounded justify-content-around text-center text-nowrap mt-5 flex-column flex-md-row p-4"
>
	<div
		style={{
			background: "linear-gradient(270deg, #282042, #30344d)",
		}}
		className="m-4 p-4 rounded shadow text-white"
	>
		<h1>{`${uploadData.toFixed(0)} GB`}</h1>
		<h3>
			<b>UPLOADED TODAY</b>
		</h3>
	</div>
	<div className="m-4 p-4 bg-white rounded shadow">
		<h1>20 EiB</h1>
		<h3>
			<b>CAPACITY</b>
		</h3>
	</div>
	<div
		style={{
			background: "linear-gradient(270deg, #282042, #30344d)",
		}}
		className="m-4 p-4 rounded shadow text-white"
	>
		<h1>$0.008 / GB</h1>
		<h3>
			<b>PRICE / GB / 30 DAYS</b>
		</h3>
	</div>
</div>
	);
};

export default DataUploadDisplay;
