import { EthIcon } from "components";
import { useAuth } from "hooks";
import useDropdown from "hooks/useDropdown";
import { useRef, useState } from "react";
import {
  HiChevronDown,
  HiCubeTransparent,
  HiOutlineMoon,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineChartSquareBar,
  HiOutlineCalculator,
} from "react-icons/hi";
import { useAppSelector } from "state";
import { formatUid } from "utils";

export default function Appbar() {
  const { name, walletAddress } = useAppSelector((state) => state.user);
  const { logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:gap-8 items-center">
        <form className="flex-1 order-last w-full mt-4 md:mt-0 md:order-first">
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
              className="block w-full py-3 pl-10 pr-4 text-sm text-gray-900 border border-gray-200 rounded-2xl bg-white focus:border-gray-400 focus:outline-none md:w-3/4"
              placeholder="Search inside Hello storage"
              required
            />
          </div>
        </form>
        <div className="flex items-center md:gap-8 justify-between w-full md:w-fit">
          <button className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-200 ">
            <EthIcon />
            <span className="text-sm">Ethereum</span>
            <HiChevronDown />
          </button>

          <div className="relative" ref={ref}>
            <button
              className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-200 "
              type="button"
              onClick={() => setOpen(!open)}
            >
              <HiCubeTransparent />
              <span className="text-sm">
                | {name ?? formatUid(walletAddress)}
              </span>
              <HiChevronDown />
            </button>
            {open && (
              <div
                id="dropdown"
                aria-label="dropdown-list"
                className="absolute mt-1 z-10 w-[150px] bg-white shadow divide-y border text-sm text-gray-700"
              >
                <ul className="py-2" aria-labelledby="dropdownDefaultButton">
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                      <HiOutlineUser className="inline-flex mr-3" />
                      Profile
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                      <HiOutlineChartSquareBar className="inline-flex mr-3" />
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                      <HiOutlineCalculator className="inline-flex mr-3" />
                      Settings
                    </a>
                  </li>
                </ul>
                <div className="py-2">
                  <a
                    className="block cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={logout}
                  >
                    <HiOutlineLogout className="inline-flex mr-3" />
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>

          <div>
            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-200">
              <HiOutlineMoon />
            </button>
          </div>
        </div>
      </div>

      <hr className="my-4" />
    </div>
  );
}
