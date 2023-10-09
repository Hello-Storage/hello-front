import { FaCircle } from "react-icons/fa";
import { useResizeDetector } from "react-resize-detector";
import World from "./components/World";
import { StackedBar } from "components";
import Chart from "./components/Chart";
import { Api } from "api";
import { useAppSelector } from "state";
import axios from "axios";
import { useEffect, useState } from "react";

const data = [
  {
    color: "#BEBFF5",
    percent: 40,
  },
  {
    color: "#FCB3FC",
    percent: 40,
  },
  {
    color: "#BFEED0",
    percent: 10,
  },
  {
    color: "#B5CFFD",
    percent: 10,
  },
];
export default function Dashboard() {
  const { width, height, ref } = useResizeDetector();
  const { uid } = useAppSelector((state) => state.user);
  const [counttotalusedstorageuser, setcounttotalusedstorageuser] =
    useState("");
  const [counttotalencryptedfilesuser, setcounttotalencryptedfilesuser] =
    useState("");
  const [counttotalpublicfilesuser, setcounttotalpublicfilesuser] =
    useState("");
  const [counttotalfilesuser, setcounttotalfilesuser] = useState("");
  const [counttotalpublicfoldersuser, setcounttotalpublicfoldersuser] =
    useState("");
  const [loading, setLoading] = useState(true);

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

    Api.get("statistics/" + uid)
      .then((response) => {
        const data = response.data;
        setcounttotalusedstorageuser(data.CountTotalUsedStorageUser);
        setcounttotalencryptedfilesuser(data.CountTotalEncryptedFilesUser);
        setcounttotalpublicfilesuser(data.CountTotalPublicFilesUser);
        setcounttotalfilesuser(data.CountTotalFilesUser);
        setcounttotalpublicfoldersuser(data.CountTotalPublicFoldersUser);

        console.log(data);
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

  return (
    <div>
      <h1 className="text-xl font-medium">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mt-4 md:gap-10 gap-5">
        <div className="border rounded-md p-3">
          <label>Used Storage</label>
          <div className="">
            <label className="text-sm text-gray-500">
              <b className="text-2xl font-semibold text-black">
                {formatBytes(parseInt(counttotalusedstorageuser))}
              </b>{" "}
            </label>
          </div>
        </div>

        <div className="border rounded-md p-3">
          <label>Total files</label>
          <div className="">
            <label className="text-2xl font-semibold text-black">
              {counttotalfilesuser}
            </label>
          </div>
        </div>

        <div className="border rounded-md p-3">
          <label>Public files</label>
          <div className="">
            <label className="text-sm text-gray-500">
              <b className="text-2xl font-semibold text-black">
                {counttotalpublicfilesuser}
              </b>{" "}
              / files
            </label>
          </div>
        </div>

        <div className="border rounded-md p-3">
          <label>Encrypted files</label>
          <div className="">
            <label className="text-sm text-gray-500">
              <b className="text-2xl font-semibold text-black">
                {counttotalencryptedfilesuser}
              </b>{" "}
              / files
            </label>
          </div>
        </div>

        <div className="border rounded-md p-3 b-classname">
          <label>Folders</label>
          <div className="">
            <label className="text-sm text-gray-500">
              <b className="text-2xl font-semibold text-black">
                {counttotalpublicfoldersuser}
              </b>{" "}
              / folders
            </label>
          </div>
        </div>
      </div>

      <hr className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          className="flex flex-col items-start overflow-hidden h-96 md:h-[656px]"
          ref={ref}
        >
          <h3 className="text-xl font-medium">Storage distribution</h3>
          <World size={width} />
        </div>

        <div className="flex-1">
          <h5 className="text-xl font-semibold">Statistics Storage</h5>

          <ul className="list-none mt-3">
            <li className="inline mr-3">
              <FaCircle
                color="#BEBFF5"
                size={10}
                className="inline-block mr-2"
              />
              <span>Documents</span>
            </li>

            <li className="inline mr-3">
              <FaCircle
                color="#FCB3FC"
                size={10}
                className="inline-block mr-2"
              />
              <span>Archives</span>
            </li>

            <li className="inline mr-3">
              <FaCircle
                color="#BFEED0"
                size={10}
                className="inline-block mr-2"
              />
              <span>Images</span>
            </li>

            <li className="inline mr-3">
              <FaCircle
                color="#B5CFFD"
                size={10}
                className="inline-block mr-2"
              />
              <span>Images</span>
            </li>
          </ul>

          <StackedBar data={data} />

          <div className="md:mt-12 mt-6">
            <Chart />
          </div>
        </div>
      </div>
    </div>
  );
}
