
import { GrCircleInformation } from "react-icons/gr";
import { useEffect, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

import axios from "axios";

import ServerM from "assets/images/Outline/Server_m.png";
import FileUploadM from "assets/images/Outline/File-upload_m.png";
import UserPlusM from "assets/images/Outline/User-plus_m.png";
import FileM from "assets/images/Outline/File_m.png";
import ShieldM from "assets/images/Outline/Shield_m.png";
import HotspotM from "assets/images/Outline/Hotspot_m.png";
import PublicFolder from "assets/images/Outline/folder_m.png";
import Jpg from "assets/images/Outline/png_icon_m.png";
import Png from "assets/images/Outline/picture_m.png";
import Txt from "assets/images/Outline/document_m.png";
import Pdf from "assets/images/Outline/invoice_m.png";
import SharedFiles from "assets/images/Outline/shared-box_m.png";
import useTitle from "hooks/useTitle";
import { Link, useNavigate } from "react-router-dom";
/* import Chart from "./Components/Chart"; */

type IconWithTooltipProps = {
    IconComponent: any; // Esto es para componentes sin props
    tooltipText: string;
};

const IconWithTooltip = ({
    IconComponent,
    tooltipText,
}: IconWithTooltipProps) => {
    useTitle("hello.app | Stats");
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
};

const Statistics = () => {


    useTitle("hello.app | Stats");

    const [upfile, setupfile] = useState("");
    const [msize, setmsize] = useState(0);
    const [encryptedfiles, setencryptedfiles] = useState("");
    const [publicfiles, setpublicfiles] = useState("");
    const [totalusers, settotalusers] = useState("");
    const [publicfolders, setpublicfolders] = useState("");
    const [textfiles, settextfiles] = useState("");
    const [jpgfiles, setjpgfiles] = useState("");
    const [pngfiles, setpngfiles] = useState("");
    const [pdffiles, setpdffiles] = useState("");
    const [totalusedstorage, settotalusedstorage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const nearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
        setIsScrolledToBottom(nearBottom);
    };


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

        const apiUrl = "https://api-staging.joinhello.app/api/statistics";

        axios
            .get(apiUrl)
            .then((response) => {
                setupfile(response.data.UploadedFile);
                setmsize(response.data.CountMediumSizeFiles);
                settotalusers(response.data.TotalUsers);
                setencryptedfiles(response.data.EncryptedFiles);
                setpublicfiles(response.data.PublicFiles);
                settotalusedstorage(response.data.TotalUsedStorage);
                setpublicfolders(response.data.PublicFolders);
                setjpgfiles(response.data.CountJpgFiles);
                setpngfiles(response.data.CountPngFiles);
                setpdffiles(response.data.CountPdfFiles);

                settextfiles(response.data.CountTxtFiles);

                console.log(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("There was an error loading data", error);
                setLoading(false);
            });
    };


    useEffect(() => {
        fetchData();

        // 15 seconds update interval
        const intervalId = setInterval(fetchData, 15000);

        return () => clearInterval(intervalId);
    }, []);

    const navigate = useNavigate();


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
            <div className="text-black flex flex-col md:flex-row justify-center items-center">
                <h1 className="text-xl font-medium text-center mt-10 md:mr-4">
                    Hello Storage Overview
                </h1>
                <Link
                    to="/space/login"
                    className="text-sm bg-blue-500 text-white py-1 px-3 rounded mt-4 md:mt-10 md:absolute md:top-3 md:right-4"
                >
                    Go to Hello Staging
                </Link>
            </div>
            {loading && (
                <div className="text-black flex flex-col md:flex-row justify-center items-center">
                    <h1 className="text-xl font-medium text-center mt-10 md:mr-4">
                        Loading...
                    </h1>
                </div>
            )}
            <hr className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mx-auto max-w-screen-xl">
                <div className="border bg-blue-100 rounded-lg p-2.5 flex flex-col items-center justify-center">
                    <img alt="servericon" src={ServerM} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Total Used Storage</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total data size stored by all users"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {formatBytes(totalusedstorage)}
                    </label>
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="fileuploadicon" src={FileUploadM} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2 text-black">Files Uploaded</label>
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
                    <img alt="userplusicon" src={UserPlusM} className="mb-2" />
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
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="filem" src={FileM} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Average File Size</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="The average size of all the files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {formatBytes(msize)}
                    </label>
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="shield" src={ShieldM} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Encrypted Files </label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total client-side encrypted files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {encryptedfiles}
                    </label>
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="hotspot" src={HotspotM} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Public Files</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total amount of public files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {publicfiles}
                    </label>
                </div>
                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="folder" src={PublicFolder} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Public Folders</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total number of public folders"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {publicfolders}
                    </label>
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="shared" src={SharedFiles} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Shared Files</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total number of shared files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">-</label>
                </div>
                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="pdf" src={Pdf} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Public PDF's</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total number of public pdf's files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {pdffiles}
                    </label>
                </div>
                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="jpg" src={Jpg} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Public JPG's</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total number of public jpg's photos"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {jpgfiles}
                    </label>
                </div>
                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="png" src={Png} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Public PNG's</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total number of public png's photos"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {pngfiles}
                    </label>
                </div>

                <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    <img alt="txt" src={Txt} className="mb-2" />
                    <div className="flex items-center mb-2">
                        <label className="block mr-2">Public TXT's</label>
                        <IconWithTooltip
                            IconComponent={GrCircleInformation}
                            tooltipText="Total number of public txt's files"
                        />
                    </div>
                    <label className="text-1x8 font-semibold text-black block">
                        {textfiles}
                    </label>
                </div>
            </div>

            <div className="mt-2 mb-5 flex justify-center">
                <div style={{ width: "70%" }}> {/* <Chart /> */}</div>
            </div>
            <div className="mt-10 mb-10 flex justify-center">
                {" "}
                {/* Cambio aquí: de mb-5 a mb-10 */}
                <div className="max-w-4xl w-full px-4 md:px-0">
                    <h1 className="w-full text-2xl text-center mb-9">
                        Welcome to the Hello Decentralized Infrastructure statistics page!
                    </h1>
                    <div className="flex justify-center mt-">
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
        </div>
    );
};

export default Statistics;
