/** @format */

import { Api } from "api";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";
import { array } from "prop-types";

import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { useAppSelector } from "state";
import { convertListToUnit } from "utils";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

interface DailyStats {
	CountDailyStorageUser: number[];
	CountDailyFilesUser: number[];
	CountDailyPublicFilesUser: number[];
	CountDailyEncryptedFilesUser: number[];
}

function formatBytes(bytes: number): { size: number; unit: string } {
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
	let i = 0;

	while (bytes >= k && i < sizes.length - 1) {
		bytes /= k;
		i++;
	}

	const size = parseFloat(bytes.toFixed(2));
	const unit = sizes[i];

	return { size, unit };
}

interface ChartProps {
	totalUsedStorage: string;
}

const Chart: React.FC<ChartProps> = ({ totalUsedStorage }) => {
	const { uid } = useAppSelector((state) => state.user);
	const [dailyStasts, setDailyStats] = useState<DailyStats>();
	const ylim = formatBytes(parseInt(totalUsedStorage));
	console.log(dailyStasts);

	const fetchData = () => {
		Api.get("statistics/" + uid + "/day")
			.then((response) => {
				setDailyStats(response.data);
			})
			.catch((error) => {
				console.error("There was an error loading data", error);
			});
	};

	useEffect(() => {
		fetchData();
		const intervalId = setInterval(fetchData, 15000);

		return () => clearInterval(intervalId);
	}, []);

	//Get last 7 days wit day and month (text and abrebiated) reverse order
	const labels = [...Array(7).keys()]
		.map((i) => {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const month = date.toLocaleString("default", { month: "short" });
			const dayNumber = date.getDate();
			return `${dayNumber} ${month}`;
		})
		.reverse();
	const data = {
		labels,
		datasets: [
			{
				label: "Used Storage",
				fill: true,
				// get data from dailyStats.
				data: dailyStasts
					? convertListToUnit(
							dailyStasts
								? dailyStasts.CountDailyStorageUser
								: [],
							ylim.unit
					).reverse()
					: [0, 0, 0, 0, 0, 0, 0],

				addition: [...Array(7)].map((_, i) => ({
					total: dailyStasts?.CountDailyFilesUser.reverse()[
						i
					],
					public: dailyStasts?.CountDailyPublicFilesUser.reverse()[
						i
					],
					encrypted:
						dailyStasts?.CountDailyEncryptedFilesUser.reverse()[
							i
						],
				})),
				tension: 0.3,
				borderColor: "#03BC47",
				backgroundColor: "#03BC4740",
			},
		],
	};

	const options = {
		responsive: true,
		scales: {
			x: {
				border: {
					display: true,
				},
				grid: {
					display: false,
				},
			},
			y: {
				border: {
					display: true,
				},
				title: {
					display: true,
					text: "Storage Usage " + ylim.unit,
				},
				grid: {
					display: false,
				},
			},
		},

		plugins: {
			tooltip: {
				callbacks: {
					label: () => "",
					footer: (item: any) => {
						return [
							"Used Storage: " +
								item[0].dataset.data[item[0].dataIndex],
							"Total Files: " +
								item[0].dataset.addition[item[0].dataIndex]
									.total,
							"Public Files: " +
								item[0].dataset.addition[item[0].dataIndex]
									.public,
							"Encrypted Files: " +
								item[0].dataset.addition[item[0].dataIndex]
									.encrypted,
						];
					},
				},
			},
			legend: {
				display: false,
			},
		},
	};
	return <Line options={options} data={data} />;
};

export default Chart;
