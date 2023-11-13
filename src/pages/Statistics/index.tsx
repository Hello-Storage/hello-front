import { useResizeDetector } from "react-resize-detector";
import { GrCircleInformation } from "react-icons/gr";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "config";

import Server_m from "assets/images/Outline/Server_m.png";
import FileUpload_m from "assets/images/Outline/File-upload_m.png";
import UserPlus_m from "assets/images/Outline/User-plus_m.png";
import File_m from "assets/images/Outline/File_m.png";
import Shield_m from "assets/images/Outline/Shield_m.png";
import Hotspot_m from "assets/images/Outline/Hotspot_m.png";
/*import Chart from "./Components/Chart";*/
import axios from "axios";
import FilesChart from "./Components/FilesChart";
import UsersChart from "./Components/UsersChart";
import { Link } from "react-router-dom";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import useTitle from "hooks/useTitle";

type IconWithTooltipProps = {
    IconComponent: React.ComponentType; // Esto es para componentes sin props
    tooltipText: string;
};

function IconWithTooltip({ IconComponent, tooltipText }: IconWithTooltipProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{ position: "relative" }}
        >
            <IconComponent />
            {showTooltip && (
                <div
                    style={{
                        position: "absolute",
                        top: "-90px", // Hace que el tooltip aparezca 30px más arriba respecto al icono
                        right: "5px",
                        padding: "15px",
                        minWidth: "250px", // Establece un ancho mínimo para el tooltip
                        backgroundColor: "white",
                        color: "dimgrey",
                        borderRadius: "7px",
                        zIndex: 100,
                    }}
                >
                    {tooltipText}
                </div>
            )}
        </div>
    );
}

export default function Statistics() {
    const { width, height, ref } = useResizeDetector();
    const [upfile, setupfile] = useState("");
    const [msize, setmsize] = useState<number>(0);
    const [encryptedfiles, setencryptedfiles] = useState("");
    const [publicfiles, setpublicfiles] = useState("");
    const [totalusers, settotalusers] = useState("");
    const [totalusedstorage, settotalusedstorage] = useState<number>(0);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

    useTitle("hello.app | Stats")

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const nearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
        setIsScrolledToBottom(nearBottom);
    };


    const [loading, setLoading] = useState(true);

    function formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Byte';

        const k = 1024;
        const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const fetchData = () => {
        // Esta URL debe ser la ruta de tu backend
        const apiUrl = API_ENDPOINT;

        axios
            .get(apiUrl + "/statistics")
            .then((response) => {
                setupfile(response.data.UploadedFile);
                setmsize(response.data.CountMediumSizeFiles);
                settotalusers(response.data.TotalUsers);
                setencryptedfiles(response.data.EncryptedFiles);
                setpublicfiles(response.data.PublicFiles);
                settotalusedstorage(response.data.TotalUsedStorage);
                console.log(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("There was an error loading data", error);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchData();

        // 15 seconds update interval
        const intervalId = setInterval(fetchData, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div
            className="text-black relative h-full overflow-y-auto"
            onScroll={handleScroll}
            style={{
                backgroundColor: "white",
                maxHeight: "100vh",
                paddingBottom: "45px",
            }}
        >
            <div className="text-black flex flex-col m-2 md:flex-row justify-center items-center">
                <h1 className="text-xl font-medium text-center mt-10 md:mr-4">
                    Hello Storage Overview
                </h1>
                <Link
                    to="/space/login"
                    className="text-sm bg-blue-500 text-white py-1 px-3 rounded mt-4 md:mt-10 md:absolute md:top-3 md:right-4"
                >
                    Go to Hello Staging
                </Link>
                <div className="md:hidden mt-2 lg:hidden flex justify-center mt-">
                    <button
                        type="button"
                        className="bg-blue-300 p-2 rounded-full"
                        onClick={() => {
                            const container = document.querySelector(
                                ".text-black.relative.h-full.overflow-y-auto"
                            );
                            if (isScrolledToBottom) {
                                container?.scrollTo(0, 0);
                            } else {
                                container?.scrollTo(0, container?.scrollHeight);
                            }
                        }}
                    >
                        {isScrolledToBottom ? <FaArrowUp /> : <FaArrowDown />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mx-auto max-w-screen-xl">

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img
                        src={FileUpload_m}
                        className="mb-2"
                    />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Files Uploaded</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="The total amount of files uploaded"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {upfile}
                    </label>
                </div>


                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img src={File_m} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Average File Size</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="The total media of the files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {formatBytes(msize)}
                    </label>
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img src={Shield_m} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Encrypted Files </label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total secure encrypted files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {encryptedfiles}
                    </label>
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img src={Hotspot_m} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Public Files</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="The total amount of public files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {publicfiles}
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mt-8 mx-auto max-w-screen-xl">
                <div className="border bg-blue-100 rounded-lg p-2.5 flex flex-col items-center justify-center">
                    <img src={Server_m} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Total Used Storage</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total data stored by all users"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {formatBytes(totalusedstorage)}
                    </label>
                    {"Storage Used"}
                    <FilesChart />
                </div>
                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img
                        src={UserPlus_m}
                        className="mb-2"
                    />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Total Users</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="The number of wallet addresses registered"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {totalusers}
                    </label>
                    {<UsersChart />}
                </div>

            </div>
            <div className="mt-10 mb-10 flex justify-center">
                {" "}
                {/* Cambio aquí: de mb-5 a mb-10 */}
                <div className="max-w-4xl w-full px-4 md:px-0">
                    <h1 className="w-full text-2xl text-center mb-9">
                        Welcome to the Hello Decentralized Infrastructure statistics page!
                    </h1>

                    <p className="text-xl text-justify">
                        Here you can find all the important information about our
                        infrastructure. As you can see from the columns above, we have a
                        total of {formatBytes(totalusedstorage)} of files stored on our
                        network. Out of these, {encryptedfiles} files are encrypted and{" "}
                        {publicfiles} files are public. We take pride in our secure and
                        decentralized infrastructure, and we're constantly working to
                        improve it. Thank you for choosing Hello Decentralized
                        Infrastructure!
                    </p>
                </div>
            </div>
            <div className="mt-10 mb-5 flex justify-center">
                <div style={{ width: "70%" }}>
                </div>
            </div>
        </div>
    );
}