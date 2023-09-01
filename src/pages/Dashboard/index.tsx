import World from "./components/World";

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
      <h3 className="text-xl font-medium">Storage distribution</h3>
      <World />
    </div>
  );
}
