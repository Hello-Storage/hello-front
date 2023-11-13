import React, { useEffect, useState } from "react";
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
import { Line } from "react-chartjs-2";
import { Api } from "api/api";

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



interface WeeklyData {
    week: string;
    usedStorage: number;
    total: number;
    public: number;
    encrypted: number;
}



// Utility function to format bytes into the largest unit
const formatChartBytes = (bytes: number, decimals = 2, largestUnit: string | null) => {
    if (bytes === 0) return { value: 0, unit: 'Bytes' };

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    let i;
    if (!largestUnit || !sizes.includes(largestUnit)) {
        i = Math.floor(Math.log(bytes) / Math.log(k));

    } else {
        i = sizes.indexOf(largestUnit);
    }
    return {
        value: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)),
        unit: sizes[i]
    };
};

// Determine the largest unit required by any storage value
const determineLargestUnit = (data: WeeklyData[]) => {
    let maxBytes = 0;
    data.forEach(d => { if (d.usedStorage > maxBytes) maxBytes = d.usedStorage; });
    return formatChartBytes(maxBytes, 2, null).unit;
};

export default function FilesChart() {
    const [weeklyData, setWeeklyData] = useState<[WeeklyData]>([{ week: "", usedStorage: 0, total: 0, public: 0, encrypted: 0 }]);
    const [largestUnit, setLargestUnit] = useState<string>('Bytes');


    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                    text: "Storage Usage (" + largestUnit + ")",
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
                            "Used Storage: " + item[0].dataset.data[item[0].dataIndex] + " " + largestUnit,
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


    const labels = weeklyData.map((d) => d.week);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Used Storage",
                fill: true,
                data: weeklyData.map((d) => d.usedStorage),
                addition: weeklyData,
                tension: 0.3,
                borderColor: "darkcyan",
                backgroundColor: "cyan",
            },
        ],
    };



    useEffect(() => {
        Api.get("/statistics/files/weekly-stats")
            .then((res) => {
                const largestUnit = determineLargestUnit(res.data);
                setLargestUnit(largestUnit);

                const formattedData = res.data.map((item: WeeklyData) => ({
                    ...item,
                    usedStorage: formatChartBytes(item.usedStorage, 2, largestUnit).value
                }));
                console.log("forrmatted sdatra:")
                console.log(formattedData);
                setWeeklyData(formattedData);

            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                // Handle error appropriately
            });
    }, []); // Empty dependency array ensures this runs once on mount



    return (
      <div style={{
        height: "230px",
        width: "100%",
      }}>
        <Line options={options} data={chartData} />
      </div>
    );
}