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
import { Line, Bar } from "react-chartjs-2";

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

export const options = {
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
                text: "Storage Usage (GB)",
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
                        "Used Storage: " + item[0].dataset.data[item[0].dataIndex],
                        "Total Files: " + item[0].dataset.addition[item[0].dataIndex].total,
                        "Public Files: " +
                        item[0].dataset.addition[item[0].dataIndex].public,
                        "Encrypted Files: " +
                        item[0].dataset.addition[item[0].dataIndex].encrypted,
                    ];
                },
            },
        },
        legend: {
            display: false,
            position: "top" as const,
        },
    },
};

const labels = ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"];

export const data = {
    labels,
    datasets: [
        {
            label: "Used Storage",
            fill: true,
            data: [1, 5, 20, 4, 6, 2, 75],
            addition: [
                { total: 3, public: 1, encrypted: 2 },
                { total: 10, public: 6, encrypted: 4 },
                { total: 50, public: 45, encrypted: 5 },
                { total: 9, public: 8, encrypted: 1 },
                { total: 5, public: 1, encrypted: 4 },
                { total: 1, public: 1, encrypted: 0 },
                { total: 90, public: 1, encrypted: 89 },
            ],
            tension: 0.3,
            borderColor: "darkcyan", //03BC47
            backgroundColor: "cyan", //03BC4740
        },
    ],
};

export default function Chart() {
    return <Line options={options} data={data} />;
}