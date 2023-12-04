import { ChangeEventHandler, useEffect, useRef, useState } from "react";
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
import { AccountType, Api } from "api";
import { useFetchData, useDropdown, useAuth } from "hooks";
import {
  toggleEncryption,
  toggleAutoEncryption,
} from "state/userdetail/actions";

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
import { fileUpload } from "utils/upload/filesUpload";
import { toast } from "react-toastify";
import { blobToArrayBuffer, decryptContentUtil, decryptFileBuffer, getAesKey, getCid, getCipherBytes, getResultBytes } from "utils/encryption/filesCipher";
import { logoutUser } from "state/user/actions";
import { Uint } from "web3";



const links1 = [
  {
    to: "/space/dashboard",
    icon: <img src={Layout} alt="custom icon" className="w-6 h-6" />,
    content: "Dashboard",
    available: true,
  },
  {
    to: "/space/my-storage",
    icon: <img src={FolderLock} alt="custom icon" className="w-6 h-6" />,
    content: "My storage",
    available: true,
  },
  {
    to: "/space/referrals",
    icon: <GoPeople className="w-6 h-5" />,
    content: "Referrals",
    available: true,
    img: <img src={HotReferral} alt="beta" className="w-12 h-5" />,
  },
];

const links2 = [
  {
    to: "/space/shared",
    icon: <img src={Send} alt="custom icon" className="w-6 h-6" />,
    content: "Shared",
    available: true,
  },
  {
    to: "/api",
    outRef: false,
    icon: <img src={Key} alt="custom icon" className="w-6 h-6" />,
    content: "Api key",
    available: false,
  },
  {
    to: "/migration",
    outRef: false,
    icon: <img src={Cloud} alt="custom icon" className="w-6 h-6" />,
    content: "Migration",
    available: false,
  },
  {
    to: "https://hello-decentralized.gitbook.io/hello-documentation/",
    outRef: true,
    icon: <img src={Book} alt="custom icon" className="w-6 h-6" />,
    content: "Documentation",
    available: true,
  },
];

type SidebarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const {
    storageUsed,
    storageAvailable,
    encryptionEnabled,
    autoEncryptionEnabled,
  } = useAppSelector((state) => state.userdetail);
  const dispatch = useAppDispatch();
  const { fetchUserDetail } = useFetchData();
  const { name } = useAppSelector((state) => state.user);
  const accountType = getAccountType();
  const navigate = useNavigate();

  const { logout } = useAuth();

  const dropRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(dropRef, open, setOpen);

  const fileInput = useRef<HTMLInputElement>(null);
  const chunkInput = useRef<HTMLInputElement>(null);
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

  const handleChunkUpload = () => {
    chunkInput.current?.click();
  };

  const handleFolderUpload = () => {
    folderInput.current?.click();
  };


  useEffect(() => {
    fetchUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRoot = () =>
    location.pathname.includes("/space/folder")
      ? location.pathname.split("/")[3]
      : "/";


  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSidebarOpen(false);
    const files = event.target.files;
    const root = getRoot();
    fileUpload(files, false, root, encryptionEnabled, name, logout, dispatch, onUploadProgress, fetchUserDetail);
  };

  const handleChunkInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSidebarOpen(false);
    const files = event.target.files;
    const root = getRoot();
    if (!files) return;
    uploadFileMultipart(files[0]).then(() => {
      fetchUserDetail();
      toast.success('File chunks uploaded successfully')
    }).catch((error) => {
      toast.error('Error uploading file chunks: ' + error)
    });



  };
  const AES_GCM_TAG_LENGTH = 16;

  const uploadFileMultipart = async (file: File) => {
    const cid = await getCid(file, dispatch)
    const { aesKey, salt, iv } = await getAesKey(cid, ['encrypt']);
    alert("multipart cid: " + cid)

    const chunkSize = 5 * 1024 * 1024; // 5MB
    let offset = 0;

    while (offset < file.size) {
      const end = Math.min(file.size, offset + chunkSize - AES_GCM_TAG_LENGTH);
      let chunk = file.slice(offset, end);
      const isLastChunk = end >= file.size;

      const chunkArrayBuffer = await chunk.arrayBuffer();
      if (encryptionEnabled) {
        let encryptedChunk = await getCipherBytes(chunkArrayBuffer, aesKey, iv);
        if (offset === 0) {
          //get result bytes
          encryptedChunk = getResultBytes(encryptedChunk, salt, iv);
        }
        chunk = new Blob([encryptedChunk]);
      }

      console.log("starting uploading chunk")
      await uploadChunk(chunk, offset, cid, isLastChunk);
      console.log("uploaded chunk")
      offset = isLastChunk ? file.size : end;
      console.log("upload offset: " + offset)
    }

  }


  const uploadChunk = async (chunk: Blob, offset: number, cid: string, isLastChunk: boolean) => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('cid', cid);
    formData.append('offset', offset.toString());
    formData.append('isLastChunk', isLastChunk.toString());

    try {
      const response = await Api.post('/file/upload/multipart', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log(response.data)
    } catch (error) {
      toast.error('Error uploading chunk: ' + error)
    }
  }

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  const downloadMultipart = async () => {
    const cid = "baejbeifnki6ktu7xsnwik4eotkdgryirtfk3oxx266rqiioll4unncwc6y";
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT + `/file/download/multipart/${cid}`;
    if (!localStorage.getItem("access_token")) {
      logoutUser();
    }


    const response = await fetch(apiEndpoint, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Authorization": "Bearer " + localStorage.getItem("access_token"),
      }
    });

    const stream = new ReadableStream({
      async pull(controller) {
        if (!response.ok || !response.body) {
          logoutUser();
          const message = `An error has occured: ${response.status}`;
          throw new Error(message);
        }
        const reader = response.body.getReader();
        let isFirstChunk = true;
        let aesKey: CryptoKey | undefined;
        let iv, accumulated = new Uint8Array();

        const shouldContinue = true;
        while (shouldContinue) {
          const { done, value } = await reader.read();
          if (done) break;

          // Append new data to the accumulated buffer
          const tempBuffer = new Uint8Array(accumulated.length + value.length);
          tempBuffer.set(accumulated);
          tempBuffer.set(value, accumulated.length);
          accumulated = tempBuffer;


          // Process first chunk separately
          if (isFirstChunk) {
            if (accumulated.length >= 28) {
              const salt = accumulated.slice(0, 16);
              iv = accumulated.slice(16, 28);
              const keyInfo = await getAesKey(cid, ['decrypt'], salt, iv);
              aesKey = keyInfo.aesKey;
              isFirstChunk = false;
              accumulated = accumulated.slice(28);
            }
          }

          // Decrypt when we have enough data or it's the last chunk
          while (aesKey && iv && accumulated.length >= CHUNK_SIZE) {
            const chunk = accumulated.slice(0, CHUNK_SIZE);
            accumulated = accumulated.slice(CHUNK_SIZE);

            // Decrypt the chunk
            const decryptedChunk = await decryptContentUtil(chunk, aesKey, iv);
            controller.enqueue(new Uint8Array(decryptedChunk));
          }
        }

        // Enqueue any remaining data
        if (aesKey && iv && accumulated.length > 0) {
          const decryptedChunk = await decryptContentUtil(accumulated, aesKey, iv);
          controller.enqueue(new Uint8Array(decryptedChunk));
        }

        controller.close();
      }
    });

    // Create blob for download
    const responseBlob = new Response(stream);
    const blob = await responseBlob.blob();
    triggerDownload(blob, "decrypted_file.png");
  };




  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    toast.success("Download complete!");
    window.URL.revokeObjectURL(url);
  };









  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSidebarOpen(false);
    const files = event.target.files;
    const root = getRoot();
    fileUpload(files, true, root, encryptionEnabled, name, logout, dispatch, onUploadProgress, fetchUserDetail);
  };

  return (
    <div className="flex flex-col py-6 h-full bg-[#F3F4F6] px-8 md:px-6 w-full">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Link to="/space/my-storage" className="text-2xl font-semibold font-[Outfit]">
            hello.app
          </Link>
          <img src={LogoHello} alt="beta" className="w-12 h-6" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="text-sm">
            Encryption {encryptionEnabled ? "ON" : "OFF"}
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
            Automatic
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              id="auto-signature"
              checked={
                autoEncryptionEnabled || !(accountType === AccountType.Provider)
              }
              onChange={() =>
                accountType === AccountType.Provider &&
                dispatch(toggleAutoEncryption(!autoEncryptionEnabled))
              }
              disabled={
                !(accountType === AccountType.Provider) || !encryptionEnabled
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
            className="flex items-center gap-2 justify-center text-white w-full p-3 rounded-xl text-sm bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 mt-3"
            onClick={handleChunkUpload}
          >
            <HiPlus /> Upload file by chunks
          </button>
          <button
            className="flex items-center gap-2 justify-center text-white w-full p-3 rounded-xl text-sm bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 mt-3"
            onClick={downloadMultipart}
          >
            <HiPlus /> Download multipart
          </button>
          <button
            className="flex items-center gap-2 justify-center text-white w-full p-3 rounded-xl text-sm bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 mt-3"
            onClick={handleFileUpload}
          >
            <HiPlus /> Upload files
          </button>
          <div className="flex gap-4 items-center mt-4">
            <Tippy content="Create Folder">
              <button
                className="flex items-center justify-center p-2 w-full rounded-xl text-xs bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={onPresent}
              >
                <div title="Upload folder">
                  <RiFolderAddLine className="h-6 w-6" />
                </div>
              </button>
            </Tippy>
            <Tippy content="Upload Folder">
              <button
                className="flex items-center justify-center txt-gray-800 p-2 w-full rounded-xl text-xs bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={handleFolderUpload}
              >
                <RiFolderUploadLine className="h-6 w-6" />
              </button>
            </Tippy>
          </div>
        </div>

        <hr className="my-3" />

        <div className="flex flex-col gap-0.5">
          {links1.map((v, i) => (
            <NavLink
              to={v.to}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-200" : ""} hover:bg-gray-200 rounded-xl`
              }
              key={i}
            >
              <div
                className={`flex items-center px-2 py-1.5 justify-between ${v.available ? "" : "text-gray-500"
                  }`}
              >
                <div className={`flex items-center gap-3`}>
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${v.available ? "" : "text-gray-500"
                      }`}
                  >
                    {v.content}
                  </label>
                </div>
                {!v.available && !v.img ? (
                  <label className="text-sm bg-gray-200 px-2 rounded-full">
                    soon
                  </label>
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
              to={v.to}
              target={v.outRef ? "_blank" : ""}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-200" : ""} hover:bg-gray-200 rounded-xl
                ${v.available ? "" : "pointer-events-none"}`
              }
              key={i}
            >
              <div
                className={`flex items-center px-2 py-1.5 justify-between ${v.available ? "" : "text-gray-500"
                  }`}
              >
                <div className={`flex items-center gap-3`}>
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${v.available ? "" : "text-gray-500"
                      }`}
                  >
                    {v.content}
                  </label>
                </div>
                {!v.available && (
                  <label className="text-sm bg-gray-200 px-2 rounded-full">
                    soon
                  </label>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <label>{formatBytes(storageUsed)} </label>

        <ProgressBar
          percent={(storageUsed * 100) / storageAvailable}
          className="bg-gray-200 h-2.5"
          color="bg-gray-400"
        />

        <label className="text-xs text-neutral-800">
          {formatPercent(storageUsed, storageAvailable)} /{" "}
          {formatBytes(storageAvailable)}  -&nbsp;
          <a
            href="/space/referrals"
            onClick={(e) => {
              e.preventDefault();
              navigate("/space/referrals");
            }}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            {formatBytes(storageAvailable, 2, false)} / 100 GiB
          </a>
        </label>
        <div className="mt-4 pb-1">
          <button
            className="text-white w-full p-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800"
            onClick={() => navigate("/space/referrals")}
            disabled={storageAvailable >= Math.pow(1024, 3) * 100}
          >
            Get {formatBytes(100 * Math.pow(1024, 3) - storageAvailable)} Free
            ✨
          </button>
        </div>
      </div>
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
          ref={chunkInput}
          type="file"
          id="file"
          onChange={handleChunkInputChange}
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
      <div className="mt-4 md:hidden absolute top-2 right-24">
        <button
          className="p-1 border rounded-xl bg-white"
          onClick={() => setSidebarOpen(false)}
        >
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
}
