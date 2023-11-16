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
                console.log(res.data)
                setWeeklyUserData(res.data);

            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                // Handle error appropriately
            });
    }

    useEffect(() => {
        fetchData();

        // 15 seconds update interval
        const intervalId = setInterval(fetchData, 1000);

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