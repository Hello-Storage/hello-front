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

import { HiMail } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { TbBrandTwitterFilled } from "react-icons/tb";
import { PiTiktokLogoFill } from "react-icons/pi";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { BsLinkedin } from "react-icons/bs";
import LogoHello from "@images/beta.png";

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

  const [loading, setLoading] = useState(true);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Byte";

    const k = 1024;
    const sizes = [
      "Bytes",
      "KiB",
      "MiB",
      "GiB",
      "TiB",
      "PiB",
      "EiB",
      "ZiB",
      "YiB",
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
  };

  useEffect(() => {
    document.title = "Hello Storage | Statistics";
    fetchData();

    // 15 seconds update interval
    const intervalId = setInterval(fetchData, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="text-black overflow-y-scroll"
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      <div className="flex items-center p-5 justify-between">
        <div className="flex flex-row items-center justify-center">
          <Link
            to="/space/login"
            className="text-xl font-semibold font-[Outfit]"
          >
            hello.app
          </Link>
          <img src={LogoHello} alt="beta" className="w-10 h-5" />
        </div>

        <Link
          to="/space/login"
          className="text-sm bg-blue-500 text-white py-1 px-3 rounded"
        >
          Go to Hello.app
        </Link>
      </div>
      <div className="text-black flex flex-col m-2 md:flex-row justify-center items-center">
        <h1 className="text-xl font-medium text-center">
          Hello Storage Overview
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 max-w-screen-xl xl:mx-auto mx-2">
      <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img src={UserPlus_m} />
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
          <img src={Server_m} />
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
        </div>

       
        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img src={FileUpload_m} />
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
          <img src={File_m} />
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
          <img src={Shield_m} />
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
          <img src={Hotspot_m} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mt-5 max-w-screen-xl  xl:mx-auto mx-2">
        <div className="border bg-blue-100 rounded-lg p-2.5 flex flex-col items-center justify-center">
          Storage Used
          <label className="text-1x8 font-semibold text-black block">
            {formatBytes(totalusedstorage)}
          </label>
          <FilesChart />
        </div>
        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          Total Users
          <label className="text-1x8 font-semibold text-black block">
            {totalusers}
          </label>
          {<UsersChart />}
        </div>
      </div>
      <footer className="text-sm text-black mt-5 p-0 md:p-2 mx-5">
        <div className="flex flex-col items-start">
          <div className="flex space-x-4 p-0 md:p-0">
            <a
              href="mailto:team@hello.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "16px" }}
            >
              <HiMail />
            </a>
            <a
              href="https://www.linkedin.com/company/hellostorage"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              <BsLinkedin />
            </a>
            <a
              href="https://github.com/hello-storage"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "15px" }}
            >
              <FaGithubSquare />
            </a>

            <a
              href="https://twitter.com/joinhelloapp"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "15px" }}
            >
              <TbBrandTwitterFilled />
            </a>
            <a
              href="https://www.instagram.com/joinhelloapp/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "16px" }}
            >
              <BiLogoInstagramAlt />
            </a>
            <a
              href="https://www.tiktok.com/@hello.app_"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "15px" }}
            >
              <PiTiktokLogoFill />
            </a>
          </div>
          <div className="mt-1 md:mt-1">© 2023 hello.app</div>
        </div>
      </footer>
    </div>
  );
}
