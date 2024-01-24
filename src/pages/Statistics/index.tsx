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
import axios from "axios";
import UsersChart from "./Components/UsersChart";
import { Link } from "react-router-dom";
import useTitle from "hooks/useTitle";

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
  const [upfile, setupfile] = useState("");
  const [msize, setmsize] = useState<number>(0);
  const [encryptedfiles, setencryptedfiles] = useState("");
  const [publicfiles, setpublicfiles] = useState("");
  const [totalusers, settotalusers] = useState("");
  const [totalusedstorage, settotalusedstorage] = useState<number>(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  useTitle("hello.app | Stats");

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

    return parseFloat((bytes / Math.pow(k, i)).toFixed(3)) + " " + sizes[i];
  }

  const fetchData = () => {
    // Esta URL debe ser la ruta de tu backend
    const apiUrl = API_ENDPOINT;

    axios
      .get(apiUrl + "/statistics")
      .then((response) => {
        if (response.data) {
          setupfile(response.data.UploadedFile);
          setmsize(response.data.CountMediumSizeFiles);
          settotalusers(response.data.TotalUsers);
          setencryptedfiles(response.data.EncryptedFiles);
          setpublicfiles(response.data.PublicFiles);
          settotalusedstorage(response.data.TotalUsedStorage);
        } else {
          const response = {
            data: {
              TotalUsedStorage: 408710962915,
              UploadedFile: "21163",
              TotalUsers: "7213",
              CountMediumSizeFiles: 19312524,
              EncryptedFiles: "17999",
              PublicFiles: "3164",
            }
          }
          setupfile(response.data.UploadedFile);
          setmsize(response.data.CountMediumSizeFiles);
          settotalusers(response.data.TotalUsers);
          setencryptedfiles(response.data.EncryptedFiles);
          setpublicfiles(response.data.PublicFiles);
          settotalusedstorage(response.data.TotalUsedStorage);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error loading data", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = "hello.app | Stats";
    fetchData();

    // 15 seconds update interval
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="text-black overflow-auto flex bg-white h-screen flex-col justify-between p-[32px]"
    >
      <nav>
        <div className="flex items-center justify-between">
          <div className="flex flex-row items-center justify-center ">
            <Link
              to="/space/login"
              className="text-2xl mr-3 font-semibold font-[Outfit]"
            >
              hello.app
            </Link>
            <img src={LogoHello} alt="beta" className="w-12 h-6" />
          </div>

          <Link
            to="/space/login"
            className="px-3 py-1 text-sm text-white bg-blue-500 rounded"
          >
            Go to hello.app
          </Link>
        </div>
      </nav>
      <section>
        <div className="flex flex-col items-center justify-center m-2 text-black md:flex-row">
        </div>
        <div className="grid max-w-screen-xl grid-cols-1 gap-3 mx-2 mt-3 md:grid-cols-2 lg:grid-cols-3 xl:mx-auto">
          <div className="flex flex-col items-center justify-center p-3 bg-blue-100 border rounded-lg">
            <img src={UserPlus_m} />
            <div className="flex items-center">
              <label className="block mr-2">Total Users</label>
              <IconWithTooltip
                IconComponent={GrCircleInformation}
                tooltipText="Total number of users registered"
              />
            </div>
            <label className="block font-semibold text-black text-1x8">
              {totalusers}
            </label>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-blue-100 border rounded-lg">
            <img src={Server_m} />
            <div className="flex items-center">
              <label className="block mr-2">Total Used Storage</label>
              <IconWithTooltip
                IconComponent={GrCircleInformation}
                tooltipText="Total data stored by all users"
              />
            </div>
            <label className="block font-semibold text-black text-1x8">
              {formatBytes(totalusedstorage)}
            </label>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-blue-100 border rounded-lg">
            <img src={FileUpload_m} />
            <div className="flex items-center">
              <label className="block mr-2">Files Uploaded</label>
              <IconWithTooltip
                IconComponent={GrCircleInformation}
                tooltipText="The total amount of files uploaded"
              />
            </div>
            <label className="block font-semibold text-black text-1x8">
              {upfile}
            </label>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-blue-100 border rounded-lg">
            <img src={File_m} />
            <div className="flex items-center">
              <label className="block mr-2">Average File Size</label>
              <IconWithTooltip
                IconComponent={GrCircleInformation}
                tooltipText="Average file size"
              />
            </div>
            <label className="block font-semibold text-black text-1x8">
              {formatBytes(msize)}
            </label>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-blue-100 border rounded-lg">
            <img src={Shield_m} />
            <div className="flex items-center">
              <label className="block mr-2">Encrypted Files </label>
              <IconWithTooltip
                IconComponent={GrCircleInformation}
                tooltipText="Total amount of encrypted files "
              />
            </div>
            <label className="block font-semibold text-black text-1x8">
              {encryptedfiles}
            </label>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-blue-100 border rounded-lg">
            <img src={Hotspot_m} />
            <div className="flex items-center">
              <label className="block mr-2">Public Files</label>
              <IconWithTooltip
                IconComponent={GrCircleInformation}
                tooltipText="Total amount of public files"
              />
            </div>
            <label className="block font-semibold text-black text-1x8">
              {publicfiles}
            </label>
          </div>
        </div>
        <div className="grid items-center justify-center max-w-screen-xl grid-cols-1 mx-2 xl:mx-auto">
          <div className="flex flex-col items-center justify-center gap-3 p-3 mt-3 bg-blue-100 border rounded-lg">
            Total Users
            <label className="block font-semibold text-black text-1x8">
              {totalusers}
            </label>
            {<UsersChart />}
          </div>
        </div>
      </section>

      <footer className="p-0 mb-[50px] text-sm text-black md:mx-12 md:p-2 md:mb-0 mt-8">
        <div className="flex flex-col items-start">
          <div className="flex p-0 space-x-4 md:p-0">
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
          <div className="mt-1 md:mt-1">© 2024 hello.app</div>
        </div>
      </footer>
    </div>
  );
}


