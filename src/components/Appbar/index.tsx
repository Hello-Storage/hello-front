import { EthIcon } from "components";
import {
  HiChevronDown,
  HiCubeTransparent,
  HiOutlineMoon,
} from "react-icons/hi";

export default function Appbar() {
  return (
    <div>
      <div className="flex gap-8">
        <form className="flex-1">
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full py-3 pl-10 pr-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus-visible:outline-none"
              placeholder="Search inside Hello storage"
              required
            />
          </div>
        </form>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1">
            <EthIcon />
            <label className="text-sm">Ethereum</label>
            <HiChevronDown />
          </div>

          <div className="flex items-center gap-1">
            <HiCubeTransparent />
            <label className="text-sm">| 0xC4....8aMe</label>
            <HiChevronDown />
          </div>

          <div>
            <button className="p-2 border border-gray-200 rounded-xl">
              <HiOutlineMoon />
            </button>
          </div>
        </div>
      </div>

      <hr className="my-4" />
    </div>
  );
}
