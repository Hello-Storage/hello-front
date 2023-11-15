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
import { Api } from "api";

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

// Updated interface for weekly user data
interface WeeklyUserData {
    week: string;
    total_users: number;
}

export default function UsersChart() {
    // Synthetic weekly user data
    const [weeklyUserData, setWeeklyUserData] = useState<WeeklyUserData[]>([
        { week: "2023-10-13", total_users: 20 },
    ]);


    const fetchData = async () => {
        Api.get("/statistics/users/weekly-stats")
            .then((res) => {
                const additionalData = {
                    week: "0",
                    total_users: 0,
                };
                console.log("users/weekly-stats: ", res.data);
                if (res.data) {
                    setWeeklyUserData([additionalData, ...res.data]);
                } else {
                    setWeeklyUserData([
                        {
                            "week": "2023-09-13",
                            "total_users": 87
                        },
                        {
                            "week": "2023-09-20",
                            "total_users": 674
                        },
                        {
                            "week": "2023-09-27",
                            "total_users": 1991
                        },
                        {
                            "week": "2023-10-04",
                            "total_users": 2550
                        },
                        {
                            "week": "2023-10-11",
                            "total_users": 3126
                        },
                        {
                            "week": "2023-10-18",
                            "total_users": 3308
                        },
                        {
                            "week": "2023-10-25",
                            "total_users": 3913
                        },
                        {
                            "week": "2023-11-01",
                            "total_users": 4598
                        },
                        {
                            "week": "2023-11-08",
                            "total_users": 5813
                        },
                        {
                            "week": "2023-11-15",
                            "total_users": 6937
                        }
                    ])
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                // Handle error appropriately
            });
    };

    useEffect(() => {
        fetchData();

        // 15 seconds update interval
        const intervalId = setInterval(fetchData, 1500);

        return () => clearInterval(intervalId);
    }, []);


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
                    text: "User Activity",
                },
                grid: {
                    display: false,
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return context.dataset.label + ": " + context.raw;
                    }
                },
            },
            legend: {
                display: false,
                position: "top" as const,
            },
        },
    };

    const labels = weeklyUserData.map((d) => d.week);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Total Users",
                fill: true,
                data: weeklyUserData.map((d) => d.total_users),
                addition: weeklyUserData,
                tension: 0.3,
                borderColor: "darkcyan",
                backgroundColor: "cyan",
            },
        ],
    };


    return (
        <div style={{
            height: "230px",
            width: "100%",
        }}>
            <Line options={options} data={chartData} />
        </div>
    );
}