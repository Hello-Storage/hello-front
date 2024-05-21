import language from "languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";
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
import { SiIpfs } from "react-icons/si";
import { useAppDispatch, useAppSelector } from "state";
import { setTheme } from "state/user/actions";
import { Theme } from "state/user/reducer";
import { formatName } from "utils";
import { getTheme } from "utils/user";
import { useModal } from "components/Modal";
import { Support } from "./components/Support";
import { Link } from "react-router-dom";
import { useHelia } from "hooks/useHelia";
import { IpfsInfoModal } from "./components/IpfsInfoModal";

interface AppbarProps {
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Appbar: FunctionComponent<AppbarProps> = ({ onSearchChange }) => {
  const { lang } = useLanguage()
  const { name, walletAddress } = useAppSelector((state) => state.user);
  const { logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const [onPresent] = useModal(
    <Support />
  );


  const [oonPresentSupport] = useModal(
    <IpfsInfoModal />
  );

  const { error, starting } = useHelia()

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
      <div className={"flex flex-wrap flex-col items-start md:flex-row md:items-center md:gap-8"
        + (theme === Theme.DARK ? " dark-theme" : "")}>
        <form className="flex-1 min-w-min order-last w-full mt-4 md:mt-0 md:order-first">
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
              className={"block w-full min-w-[100px] py-2.5 pl-10 pr-4 text-sm rounded-2xl text-gray-900 border focus:border-gray-400 focus:outline-none "
                + (theme === Theme.DARK ? " dark-theme3" : " border-gray-200 bg-white")}
              placeholder={language[lang]["112"]}
              required
              onChange={onSearchChange}
            />
          </div>

        </form>

        <div className="flex flex-wrap items-center md:gap-4 w-full justify-between md:w-fit gap-1">
          <button
            onClick={onPresent}
            className={"flex flex-1 min-w-min  whitespace-nowrap items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
              (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
          >
            {/* Support */}
            {language[lang]["113"]}
          </button>

          <a href="https://linktr.ee/joinhelloapp" target="_blank">
            <button className={"flex flex-1 min-w-min  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm "
              + (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}>
              Linktree
            </button>
          </a>

        
          <div className="flex flex-1 min-w-min gap-2">
            <div className="flex flex-1 min-w-min relative" ref={ref}>
              <button
                className={"flex flex-1 min-w-min whitespace-nowrap items-center gap-1 py-2 md:px-4 px-2 rounded-lg"
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
                  className={"absolute mt-1 z-10 w-[200px] shadow divide-y border text-sm"
                    + (theme === Theme.DARK ? " dark-theme4" : " bg-white text-gray-700")}
                >
                  <ul>
                    <li>
                      <button
                        className={"px-4 py-2 cursor-pointer flex items-center w-full "
                          + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                        onClick={oonPresentSupport}
                      >
                        <SiIpfs className="inline-flex mr-3" />
                        {/* IPFS Status */}
                        {language[lang]["115"]} &nbsp;
                        <span className={"w-[15px] h-[15px] rounded-full inline-flex " + (error ? "bg-red-300" : (starting ? "bg-yellow-300" : "bg-green-300"))}
                          title={error ? "Error" : (starting ? "Starting" : "Online")}
                        ></span>
                      </button>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className={"block px-4 py-2 pointer-events-none text-gray-500 "
                          + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                      >
                        <HiOutlineUser className="inline-flex mr-3" />
                        {/* Profile */}
                        {language[lang]["116"]}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#" className={"block px-4 pointer-events-none py-2 text-gray-500 "
                          + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                      >
                        <HiOutlineChartSquareBar className="inline-flex mr-3" />
                        {/* Dashboard */}
                        {language[lang]["14"]}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/space/settings"
                        className={"block px-4 py-2"
                          + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                      >
                        <HiOutlineCalculator className="inline-flex mr-3" />
                        {/* Settings */}
                        {language[lang]["117"]}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/space/referrals"
                        className={"block px-4 py-2 "
                          + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                      >
                        <HiUsers className="inline-flex mr-3" />
                        {/* Referrals */}
                        {language[lang]["16"]}
                      </Link>
                    </li>
                  </ul>
                  <div>
                    <button
                      className={"block cursor-pointer px-4 py-3 w-full text-left "
                        + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                      onClick={logout}
                    >
                      <HiOutlineLogout className="inline-flex mr-3" />
                      {/* Sign out */}
                      {language[lang]["118"]}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className={"theme-switch p-2 border border-gray-200 rounded-xl hover:bg-gray-200" + (theme === Theme.DARK ? " dark-theme3" : "")}
              onClick={handleChangeTheme}
            >
              <label>
                <input type="checkbox" ref={themeCheckbox} />
                <span className="theme-slider"></span>
              </label>
            </button>
          </div>
        </div>
      </div>

      <hr className="my-4" />
    </>
  );
};

export default Appbar;
