import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Toggle from "react-toggle";
import { HiPlus } from "react-icons/hi";
import { RiFolderUploadLine, RiFolderAddLine } from "react-icons/ri";
import { GoPeople } from "react-icons/go";
import FolderLock from "assets/images/Outline/Folder-lock.png";
import Layout from "assets/images/Outline/Layout.png";
import Send from "assets/images/Outline/Send.png";
import Book from "assets/images/Outline/Book.png";
import Key from "assets/images/Outline/Key.png";
import Cloud from "assets/images/Outline/Cloud-upload.png";
import { FiX } from "react-icons/fi";
import { CreateFolderModal, ProgressBar } from "components";
import { useModal } from "components/Modal";
import { AccountType } from "api";
import { useFetchData, useDropdown, useAuth } from "hooks";
import {
  toggleEncryption,
  toggleAutoEncryption,
} from "state/userdetail/actions";

import language from "languages/es.json"
import { useLanguage } from "languages/LanguageProvider";

import LogoHello from "@images/beta.png";
import HotReferral from "@images/hotreferral.png";
import "react-toggle/style.css";
import { useAppDispatch, useAppSelector } from "state";
import { formatBytes, formatPercent } from "utils";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { AxiosProgressEvent } from "axios";
import getAccountType from "api/getAccountType";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { refreshAction } from "state/mystorage/actions";
import { Theme } from "state/user/reducer";
import { FilesUpload } from "api/types/upload";
import { filesUpload } from "utils/upload/filesUpload";



type SidebarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ setSidebarOpen }: Readonly<SidebarProps>) {
  
  const {lang} = useLanguage()

  const links1 = [
    {
      to: "/space/dashboard",
      icon: <img src={Layout} alt="custom icon" className="w-6 h-6" />,
      content: language[lang]["14"],
      available: true,
    },
    {
      to: "/space/my-storage",
      icon: <img src={FolderLock} alt="custom icon" className="w-6 h-6" />,
      content: language[lang]["15"],
      available: true,
    },
    {
      to: "/space/referrals",
      icon: <GoPeople className="w-6 h-5" />,
      content: language[lang]["16"],
      available: true,
      img: <img src={HotReferral} alt="beta" className="w-12 h-5" />,
    },
  ];
  
  const links2 = [
    {
      to: "/space/shared",
      icon: <img src={Send} alt="custom icon" className="w-6 h-6" />,
      content: language[lang]["17"],
      available: true,
    },
    {
      to: "/space/api",
      outRef: false,
      icon: <img src={Key} alt="custom icon" className="w-6 h-6" />,
      content: "Api key",
      available: true,
    },
    {
      to: "/migration",
      outRef: false,
      icon: <img src={Cloud} alt="custom icon" className="w-6 h-6" />,
      content: language[lang]["19"],
      available: false,
    },
    {
      to: "https://hello-decentralized.gitbook.io/hello-documentation/",
      outRef: true,
      icon: <img src={Book} alt="custom icon" className="w-6 h-6" />,
      content: language[lang]["110"],
      available: true,
    },
  ];

  const {
    storageUsed,
    storageAvailable,
    encryptionEnabled,
    autoEncryptionEnabled,
  } = useAppSelector((state) => state.userdetail);
  const dispatch = useAppDispatch();
  const { fetchUserDetail, fetchRootContent, fetchSharedContent } = useFetchData();
  const { name } = useAppSelector((state) => state.user);
  const accountType = getAccountType();
  const navigate = useNavigate();

  const { logout } = useAuth();

  const dropRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(dropRef, open, setOpen);

  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const [onPresent] = useModal(<CreateFolderModal />);

  useEffect(() => {
    if (folderInput.current !== null) {
      folderInput.current.setAttribute("directory", "");
      folderInput.current.setAttribute("webkitdirectory", "");
    }
  }, [folderInput]);

  const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    dispatch(
      setUploadStatusAction({
        read: progressEvent.loaded,
        size: progressEvent.total,
      })
    );
  };

  const handleFileUpload = () => {
    fileInput.current?.click();
  };

  const handleFolderUpload = () => {
    folderInput.current?.click();
  };


  useEffect(() => {
    fetchUserDetail();
  }, []);

  const getRoot = () =>
    location.pathname.includes("/space/folder")
      ? location.pathname.split("/")[3]
      : "/";


  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isFolder: boolean
  ) => {
    const root = getRoot();
    const files = event.target.files;
    if (!files) return;


    const encapsulatedFile: FilesUpload = {
      files,
      isFolder,
      root,
      encryptionEnabled: encryptionEnabled,
      name,
      logout,
      dispatch,
      onUploadProgress,
      fetchUserDetail,
    };


    filesUpload(encapsulatedFile).then(() => {
      setSidebarOpen(false);
      fetchUserDetail();
    });


  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    handleInputChange(event, false);
  };

  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    handleInputChange(event, true);
  };

  const [isLinkDisabled, setLinkDisabled] = useState(false);

  const handleLinkClick = (v: any) => {

    setLinkDisabled(true);
    switch (v.content) {
      case "My storage":
        if (isLinkDisabled) {
          return;
        }
        if (!window.location.href.endsWith("/space/my-storage")) {
          return
        }
        dispatch(refreshAction(true));
        fetchRootContent();
        break;
      case "Shared":

        if (isLinkDisabled) {
          return;
        }
        dispatch(refreshAction(true));
        fetchSharedContent();
        break;
      case "Api key":
        if (isLinkDisabled) {
          return;
        }
        dispatch(refreshAction(true));
        break;
    }

    setTimeout(() => {
      setLinkDisabled(false);
    }, 1500);
  };

  const { theme } = useAppSelector((state) => state.user);

  return (
    <div className={"flex flex-col py-6 h-full bg-[#F3F4F6] px-8 md:px-6 w-full" + (theme === Theme.DARK ? " dark-theme4" : "")}>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Link to="/space/my-storage" className="text-2xl font-semibold font-[Outfit]"
          >
            hello.app
          </Link>
          <img src={LogoHello} alt="beta" className="w-12 h-6" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="text-sm">
            {/* Encryption */}
          {language[lang]["11"]} {encryptionEnabled ? "ON" : "OFF"}
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              checked={encryptionEnabled}
              onChange={() => dispatch(toggleEncryption(!encryptionEnabled))}
              className={encryptionEnabled ? "encryption-on" : "encryption-off"}
              icons={false}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <label
            htmlFor="auto-signature"
            className={`text-sm ${encryptionEnabled && accountType === AccountType.Provider
              ? ""
              : "text-gray-400"
              }`}
          >
            {/* Automatic */}
            {language[lang]["12"]}
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              id="auto-signature"
              checked={
                autoEncryptionEnabled || accountType !== AccountType.Provider
              }
              onChange={() =>
                accountType === AccountType.Provider &&
                dispatch(toggleAutoEncryption(!autoEncryptionEnabled))
              }
              disabled={
                accountType !== AccountType.Provider || !encryptionEnabled
              }
              className={
                autoEncryptionEnabled ? "automatic-on" : "automatic-off"
              }
              icons={false}
            />
          </div>
        </div>

        <hr className="my-3" />

        <div className="relative" ref={dropRef}>
          <button
            className="flex items-center justify-center w-full gap-2 p-3 mt-3 text-sm text-white rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
            onClick={handleFileUpload}
          >
            {/* Upload Files */}
            <HiPlus /> {language[lang]["13"]}
          </button>
          <div className="flex items-center gap-4 mt-4">
            <Tippy content="Create Folder">
              <button
                className={"flex border border-gray-200 items-center justify-center w-full p-2 text-xs rounded-xl " + (theme === Theme.DARK ? " bg-[#4b4d70] text-white hover:bg-[#40425f]" : "bg-gray-200 text-gray-800 hover:bg-gray-300")}
                onClick={onPresent}
              >
                <div title="Upload folder">
                  <RiFolderAddLine className="w-6 h-6" />
                </div>
              </button>
            </Tippy>
            <Tippy content="Upload Folder">
              <button
                className={"flex border border-gray-200 items-center justify-center w-full p-2 text-xs rounded-xl " + (theme === Theme.DARK ? " bg-[#4b4d70] text-white hover:bg-[#40425f]" : "bg-gray-200 text-gray-800 hover:bg-gray-300")}
                onClick={handleFolderUpload}
              >
                <RiFolderUploadLine className="w-6 h-6" />
              </button>
            </Tippy>
          </div>
        </div>

        <hr className="my-3" />

        <div className="flex flex-col gap-0.5">
          {links1.map((v, i) => (
            <NavLink
              to={v.to}
              onClick={() => handleLinkClick(v)}
              className={({ isActive }) =>
                `${isActive ? (theme === Theme.DARK ? " bg-[#4b4d70]" : "bg-gray-200") : ""} ${(theme === Theme.DARK ? " hover:bg-[#4b4d70]" : "hover:bg-gray-200")} rounded-xl`
              }
              key={i}
            >
              <div
                className={`flex items-center px-2 py-1.5 justify-between ${v.available ? "" : "text-gray-500"
                  }`}
              >
                <div className={`links flex items-center gap-3`}>
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${v.available ? "" : "text-gray-500"
                      }`}
                  >
                    {v.content}
                  </label>
                </div>
                {!v.available && !v.img ? (
                  <div className="px-2 text-sm bg-gray-200 rounded-full">
                    soon
                  </div>
                ) : (
                  <span>{v.img}</span>
                )}
              </div>
            </NavLink>
          ))}
        </div>

        <hr className="my-3" />

        <div className="flex flex-col gap-0.5">
          {links2.map((v, i) => (
            <NavLink
              onClick={() => handleLinkClick(v)}
              to={v.to}
              target={v.outRef ? "_blank" : ""}
              className={({ isActive }) =>
                `${isActive ? (theme === Theme.DARK ? " bg-[#4b4d70]" : "bg-gray-200") : ""} ${(theme === Theme.DARK ? " hover:bg-[#4b4d70]" : "hover:bg-gray-200")} rounded-xl
                ${v.available ? "" : "pointer-events-none"}`
              }
              key={i}
            >
              <div
                className={`flex items-center px-2 py-1.5 justify-between ${v.available ? "" : "text-gray-500"
                  }`}
              >
                <div className="links flex items-center gap-3">
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${v.available ? "" : "text-gray-500"
                      }`}
                  >
                    {v.content}
                  </label>
                </div>
                {!v.available && (
                  <div className="px-2 text-sm bg-gray-200 rounded-full">
                    soon
                  </div>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <section className="pt-4 mb-[50px] md:mb-2 ">
        <label>{formatBytes(storageUsed)} </label>

        <ProgressBar
          percent={(storageUsed * 100) / storageAvailable}
          className="bg-gray-200 h-2.5"
          color="bg-gray-400"
        />

        <label className={"text-xs text-neutral-800" + (theme === Theme.DARK ? " dark-theme4" : "")}>
          {formatPercent(storageUsed, storageAvailable)} /{" "}
          {formatBytes(storageAvailable)}  -&nbsp;
          <Link
            to="/space/referrals"
            onClick={(e) => {
              e.preventDefault();
              navigate("/space/referrals");
            }}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            {formatBytes(storageAvailable, 2, false)} / 100 GiB
          </Link>
        </label>
        <div className="pb-1 mt-4">
          <button
            className="w-full p-3 text-white rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800"
            onClick={() => navigate("/space/referrals")}
            disabled={storageAvailable >= Math.pow(1024, 3) * 100}
          >
            {/* Get /// Free */}
            {language[lang]["111"]} {formatBytes(100 * Math.pow(1024, 3) - storageAvailable)} {language[lang]["1111"]}
            ✨
          </button>
        </div>
      </section>
      <div>
        <input
          ref={fileInput}
          type="file"
          id="file"
          onChange={handleFileInputChange}
          multiple={true}
          accept="*/*"
          hidden
        />
        <input
          ref={folderInput}
          type="file"
          id="folder"
          onChange={handleFolderInputChange}
          hidden
        />
      </div>
      <div className="absolute mt-4 md:hidden top-2 right-24">
        <button
          className="p-1 bg-white border rounded-xl"
          onClick={() => setSidebarOpen(false)}
        >
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
}
