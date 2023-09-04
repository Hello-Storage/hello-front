import World from "./components/World";
import { FaCircle } from "react-icons/fa";
import { StackedBar } from "components";
import Chart from "./components/Chart";

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
  return (
    <div>
      <h1 className="text-xl font-medium">Dashboard</h1>
      <div className="grid grid-cols-4 mt-3 gap-5">
        <div className="border rounded-md p-3">
          <label>Used Storage</label>
          <div className="">
            <label className="text-sm text-gray-300">
              <b className="text-2xl font-semibold text-black">10GB</b> / 40GB
            </label>
          </div>
        </div>

        <div className="border rounded-md p-3">
          <label>Total files</label>
          <div className="">
            <label className="text-2xl font-semibold text-black">134</label>
          </div>
        </div>

        <div className="border rounded-md p-3">
          <label>Public files</label>
          <div className="">
            <label className="text-sm text-gray-300">
              <b className="text-2xl font-semibold text-black">132</b> / files
            </label>
          </div>
        </div>

        <div className="border rounded-md p-3">
          <label>Encrypted files</label>
          <div className="">
            <label className="text-sm text-gray-300">
              <b className="text-2xl font-semibold text-black">50</b> / files
            </label>
          </div>
        </div>
      </div>

      <hr className="my-3" />
      <div className="flex gap-3">
        <div className="flex-1">
          <h3 className="text-xl font-medium">Storage distribution</h3>
          <World />
        </div>

        <div className="flex-1">
          <h5 className="text-xl font-semibold">Folders storage</h5>

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

          <div className="mt-5">
            <Chart />
          </div>
        </div>
      </div>
    </div>
  );
}
