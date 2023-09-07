import { useResizeDetector } from "react-resize-detector";
import { FaFingerprint, FaFolder } from "react-icons/fa";
import { HiAcademicCap, HiDatabase } from "react-icons/hi";
import { LuFileUp } from "react-icons/lu";
import { FiUserPlus } from "react-icons/fi";

export default function Statistics() {
  const { width, height, ref } = useResizeDetector();
  return (
    <div>
      <h1 className="text-xl font-medium">Hello Storage Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-3 gap-5">
        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <FaFingerprint className="mb-2" />
          <label className="block mb-2">Total CIDs</label>
          <label className="text-2xl font-semibold text-black block">
            10GB
          </label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <HiDatabase className="mb-2" />
          <label className="block mb-2">IPFS Storage</label>
          <label className="text-2xl font-semibold text-black block">134</label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <LuFileUp className="mb-2" />
          <label className="block mb-2">Files Uploaded</label>
          <label className="text-2xl font-semibold text-black block">132</label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <FiUserPlus className="mb-2" />
          <label className="block mb-2">Registered Users</label>
          <label className="text-2xl font-semibold text-black block">50</label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <HiAcademicCap className="mb-2" />
          <label className="block mb-2">Total Files Archived</label>
          <label className="text-2xl font-semibold text-black block">
            10GB
          </label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <HiAcademicCap className="mb-2" />
          <label className="block mb-2">Storage Archived</label>
          <label className="text-2xl font-semibold text-black block">134</label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <HiAcademicCap className="mb-2" />
          <label className="block mb-2">Storage Providers </label>
          <label className="text-2xl font-semibold text-black block">132</label>
        </div>

        <div className="border bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
          <HiAcademicCap className="mb-2" />
          <label className="block mb-2">Buckets</label>
          <label className="text-2xl font-semibold text-black block">50</label>
        </div>
      </div>
    </div>
  );
}
