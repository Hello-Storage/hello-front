import { useResizeDetector } from "react-resize-detector";
import { GrCircleInformation } from "react-icons/gr";
import { useEffect, useState } from "react";
/*import Chart from "./Components/Chart";*/
import axios from "axios";

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esta URL debe ser la ruta de tu backend
    const apiUrl = "http://172.28.250.215:8080/api/";

    axios
      .get(apiUrl + "statistics")
      .then((response) => {
        setupfile(response.data.UploadedFile);
        setmsize(response.data.CountMediumSizeFiles / 10 ** 6);
        settotalusers(response.data.TotalUsers);
        setencryptedfiles(response.data.EncryptedFiles);
        setpublicfiles(response.data.PublicFiles);
        settotalusedstorage(response.data.TotalUsedStorage / 2 ** 30);
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error loading data", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-center items-center">
        <h1 className="text-xl font-medium text-center mt-10 md:mr-4">
          Hello Storage Overview
        </h1>
        <a
          href="https://staging.joinhello.app/login"
          className="text-sm bg-blue-500 text-white py-1 px-3 rounded mt-4 md:mt-10 md:absolute md:top-3 md:right-4"
        >
          Go to Hello Staging
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mx-auto max-w-screen-xl">
        <div className="border bg-blue-100 rounded-lg p-2.5 flex flex-col items-center justify-center">
          <img src="src\assets\images\Outline\Server_m.png" className="mb-2" />
          <div className="flex items-center mb-2">
            <label className="block mr-2">Total Used Storage</label>
            <IconWithTooltip
              IconComponent={GrCircleInformation}
              tooltipText="Total data pinned on IPFS"
            />
          </div>
          <label className="text-1x8 font-semibold text-black block">
            {totalusedstorage.toFixed(2)} GiB
          </label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img
            src="src\assets\images\Outline\File-upload_m.png"
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
          <img
            src="src\assets\images\Outline\User-plus_m.png"
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
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img
            src="src\assets\images\Outline\Processor_m.png"
            className="mb-2"
          />
          <div className="flex items-center mb-2">
            <label className="block mr-2">Total CIDS</label>
            <IconWithTooltip
              IconComponent={GrCircleInformation}
              tooltipText="The total amount of pinned IPFS CIDs"
            />
          </div>
          <label className="text-1x8 font-semibold text-black block">-</label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img src="src\assets\images\Outline\File_m.png" className="mb-2" />
          <div className="flex items-center mb-2">
            <label className="block mr-2">Medium File Size</label>
            <IconWithTooltip
              IconComponent={GrCircleInformation}
              tooltipText="The total media of the files"
            />
          </div>
          <label className="text-1x8 font-semibold text-black block">
            {msize.toFixed(2)} MiB
          </label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img
            src="src\assets\images\Outline\Share-box_m.png"
            className="mb-2"
          />
          <div className="flex items-center mb-2">
            <label className="block mr-2">Files shared</label>
            <IconWithTooltip
              IconComponent={GrCircleInformation}
              tooltipText="The total number of times the files have been shared"
            />
          </div>
          <label className="text-1x8 font-semibold text-black block">-</label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img src="src\assets\images\Outline\Shield_m.png" className="mb-2" />
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
          <img src="src\assets\images\Outline\Hotspot_m.png" className="mb-2" />
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
      <div className="mt-10 mb-5 flex justify-center">
        <div style={{ width: "70%" }}>
          {" "}
          {/*{/*<Chart />*/}
        </div>
      </div>
    </div>
  );
}