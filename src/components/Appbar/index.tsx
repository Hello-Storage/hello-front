import { EthIcon } from "components";
import { useAuth } from "hooks";
import useDropdown from "hooks/useDropdown";
import { useRef, useState, ChangeEvent, FunctionComponent, useEffect } from "react";
import {
  HiChevronDown,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineChartSquareBar,
  HiOutlineCalculator,
  HiUsers,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "state";
import { setTheme } from "state/user/actions";
import { Theme } from "state/user/reducer";
import { formatName } from "utils";
import { getTheme } from "utils/user";
import { Modal, useModal } from "components/Modal";
import { Support } from "./components/Support";

interface AppbarProps {
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Appbar: FunctionComponent<AppbarProps> = ({ onSearchChange }) => {
  const { name, walletAddress } = useAppSelector((state) => state.user);
  const { logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const [onPresent] = useModal(
		<Support />
	);

  useDropdown(ref, open, setOpen);

  const { theme } = useAppSelector((state) => state.user);

  const themesaved = getTheme()
  useEffect(() => {
    dispatch(setTheme(themesaved === Theme.LIGHT ? Theme.LIGHT : Theme.DARK))
  }, [themesaved])

  const themeCheckbox = useRef<HTMLInputElement>(null);
  function handleChangeTheme() {
    if (themeCheckbox.current) {
      if (themeCheckbox.current.checked) {
        dispatch(setTheme(Theme.DARK))
      } else {
        dispatch(setTheme(Theme.LIGHT))
      }
    }
  }

  useEffect(() => {
    if (themeCheckbox.current && theme === Theme.DARK) {
      themeCheckbox.current.checked = true
    }
  }, [theme])

  return (
    <>
      <div className={"flex flex-col items-start md:flex-row md:items-center md:gap-8"
        + (theme === Theme.DARK ? " dark-theme" : "")}>
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
              className={"block w-full py-2.5 pl-10 pr-4 text-sm rounded-2xl text-gray-900 border focus:border-gray-400 focus:outline-none xl:w-4/5"
                + (theme === Theme.DARK ? " dark-theme3" : " border-gray-200 bg-white")}
              placeholder="Search your space"
              required
              onChange={onSearchChange}
            />
          </div>
          
        </form>

        <div className="flex items-center md:gap-4 w-full justify-between md:w-fit gap-1">
    <button
        onClick={onPresent}
        className={"flex items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
        (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
    >
      Support 
    </button>

          <a href="https://linktr.ee/joinhelloapp" target="_blank">
            <button className={"flex items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm "
              + (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}>
              Linktree
            </button>
          </a>

          <div className="relative" ref={ref}>
            <button
              className={"flex items-center gap-1 py-2 md:px-4 px-2 rounded-lg"
                + (theme === Theme.DARK ? " dark-theme3" : " bg-gray-100 hover:bg-gray-200")}
              type="button"
              onClick={() => setOpen(!open)}
            >
              <EthIcon />
              <span className="md:hidden txt-sm">
                |{" "}
                {name !== "" ? formatName(name, 6) : formatName(walletAddress)}
              </span>
              <span className="hidden md:inline txt-sm">
                |{" "}
                {name !== "" ? formatName(name, 12) : formatName(walletAddress)}
              </span>
              <HiChevronDown />
            </button>
            {open && (
              <div
                id="dropdown"
                aria-label="dropdown-list"
                className={"absolute mt-1 z-10 w-[150px] shadow divide-y border text-sm"
                  + (theme === Theme.DARK ? " dark-theme4" : " bg-white text-gray-700")}
              >
                <ul>
                  <li>
                    <a
                      href="#"
                      className={"block px-4 py-2 pointer-events-none text-gray-500 "
                        + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                    >
                      <HiOutlineUser className="inline-flex mr-3" />
                      Profile
                    </a>
                  </li>
                  <li>
                    <a href="#" className={"block px-4 py-2 "
                      + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                    >
                      <HiOutlineChartSquareBar className="inline-flex mr-3" />
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={"block px-4 py-2 pointer-events-none text-gray-500 "
                        + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                    >
                      <HiOutlineCalculator className="inline-flex mr-3" />
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      href="/space/referrals"
                      className={"block px-4 py-2 "
                        + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                    >
                      <HiUsers className="inline-flex mr-3" />
                      Referrals
                    </a>
                  </li>
                </ul>
                <div>
                  <span
                    className={"block cursor-pointer px-4 py-3 "
                      + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-100")}
                    onClick={logout}
                  >
                    <HiOutlineLogout className="inline-flex mr-3" />
                    Sign out
                  </span>
                </div>
              </div>
            )}
          </div>

          <label className={"theme-switch p-2 border border-gray-200 rounded-xl hover:bg-gray-200" + (theme === Theme.DARK ? " dark-theme3" : "")}
            onClick={handleChangeTheme}
          >
            <input type="checkbox" ref={themeCheckbox} />
            <span className="theme-slider"></span>
          </label>
        </div>
      </div>

      <hr className="my-4" />
    </>
  );
};

export default Appbar;
