import { useResizeDetector } from "react-resize-detector";
import { GrCircleInformation } from "react-icons/gr";
import { useState } from "react";
import Chart from "./Components/Chart";

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
  return (
    <div>
      <h1 className="text-xl font-medium">Hello Storage Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-3 gap-5">
        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <img src="src\assets\images\Outline\Server_m.png" className="mb-2" />
          <div className="flex items-center mb-2">
            <label className="block mr-2">Used Storage</label>
            <IconWithTooltip
              IconComponent={GrCircleInformation}
              tooltipText="Total data pinned on IPFS"
            />
          </div>
          <label className="text-1x8 font-semibold text-black block">
            4391.31GB
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
          <label className="text-1x8 font-semibold text-black block">443</label>
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
          <label className="text-1x8 font-semibold text-black block">440</label>
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
          <label className="text-1x8 font-semibold text-black block">
            320.234
          </label>
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
            5.4 GB
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
          <label className="text-1x8 font-semibold text-black block">
            3125
          </label>
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
            600GB
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
            10GB
          </label>
        </div>
      </div>
      <div className="mt-5">
        <Chart />
      </div>
    </div>
  );
}
