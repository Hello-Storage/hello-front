//https://joinhello-wfv1ie6wi-hello-storage.vercel.app/space/my-storage
import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Toggle from "react-toggle";
import { toast } from "react-toastify";
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
import { AccountType, Api, EncryptionStatus, File as FileType } from "api";
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
import getPersonalSignature from "api/getPersonalSignature";
import {
  bufferToBase64Url,
  bufferToHex,
  encryptBuffer,
  encryptFileBuffer,
  encryptMetadata,
  getCid,
} from "utils/encryption/filesCipher";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { AxiosProgressEvent } from "axios";
import getAccountType from "api/getAccountType";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { createFileAction, createFolderAction } from "state/mystorage/actions";

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

  const handleEncryption = async (
    file: File,
    personalSignature: string | undefined,
    isFolder: boolean,
    encryptedPathsMapping: { [path: string]: string }
  ): Promise<{
    encryptedFile: File;
    cidOfEncryptedBufferStr: string;
    cidOriginalStr?: string;
    cidOriginalEncryptedBase64Url: string;
    encryptedWebkitRelativePath: string;
    encryptionTime: number;
  } | null> => {
    const fileArrayBuffer = await file.arrayBuffer();

    const encryptedMetadataResult = await encryptMetadata(
      file,
      personalSignature
    );
    if (!encryptedMetadataResult) {
      toast.error("Failed to encrypt metadata");
      return null;
    }
    const { encryptedFilename, encryptedFiletype, fileSize, fileLastModified } =
      encryptedMetadataResult;
    const {
      cidOriginalStr,
      cidOfEncryptedBufferStr,
      encryptedFileBuffer,
      encryptionTime,
    } = await encryptFileBuffer(fileArrayBuffer, dispatch);

    const encryptedFilenameBase64Url = bufferToBase64Url(encryptedFilename);
    const encryptedFiletypeHex = bufferToHex(encryptedFiletype);
    const cidOriginalBuffer = new TextEncoder().encode(cidOriginalStr);
    const cidOriginalEncryptedBuffer = await encryptBuffer(
      cidOriginalBuffer,
      personalSignature
    );

    if (!cidOriginalEncryptedBuffer) {
      toast.error("Failed to encrypt buffer");
      return null;
    }
    const cidOriginalEncryptedBase64Url = bufferToBase64Url(
      cidOriginalEncryptedBuffer
    );
    const encryptedFileBlob = new Blob([encryptedFileBuffer]);
    const encryptedFile = new File(
      [encryptedFileBlob],
      encryptedFilenameBase64Url,
      { type: encryptedFiletypeHex, lastModified: fileLastModified }
    );

    let encryptedWebkitRelativePath = "";
    if (isFolder) {
      const pathComponents = file.webkitRelativePath.split("/");
      const encryptedPathComponents = [];
      for (const component of pathComponents) {
        // If this component has been encrypted before, use the cached value
        if (encryptedPathsMapping[component]) {
          encryptedPathComponents.push(encryptedPathsMapping[component]);
        } else {
          const encryptedComponentBuffer = await encryptBuffer(
            new TextEncoder().encode(component),
            personalSignature
          );
          if (!encryptedComponentBuffer) {
            toast.error("Failed to encrypt buffer");
            return null;
          }
          const encryptedComponentHex = bufferToHex(encryptedComponentBuffer);
          encryptedPathsMapping[component] = encryptedComponentHex;
          encryptedPathComponents.push(encryptedComponentHex);
        }
      }

      // Reconstruct the encrypted webkitRelativePath
      encryptedWebkitRelativePath = encryptedPathComponents.join("/");
    }

    return {
      encryptedFile,
      cidOfEncryptedBufferStr,
      cidOriginalStr,
      cidOriginalEncryptedBase64Url,
      encryptedWebkitRelativePath,
      encryptionTime,
    };
  };


  const uploadFile = async (
  ) => {

    for (let i = 0; i < 500; i++) {
      const isFolder = false;
      const root = getRoot();
      //const files = event.target.files;

      let files;
      for (let i = 0; i < 2; i++) {
        //between 1KB and 1000MB
        const minSize = 1 * 1024; //1KB
        const maxSize = 1 * 1024 * 1024 * 10; //1000MB
        const randomSize = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);

        // fill with random data
        const buffer = new Uint8Array(randomSize);

        const chunkSize = 65536;

        for (let j = 0; j < buffer.length; j += chunkSize) {
          const tempBuffer = new Uint8Array(Math.min(chunkSize, randomSize - j))
          window.crypto.getRandomValues(tempBuffer);
          buffer.set(tempBuffer, j);
        }


        const blob = new Blob([buffer], { type: "text/plain" });
        //generate a random string between 4 and 10 characters
        const randomString = Math.random().toString(36).substring(2, 15 + Math.floor(Math.random() * 6));
        const file = new File([blob], `${randomString} file-${i}.txt`, {
          type: "text/plain",
        });

        if (!files) files = [];
        files.push(file);
      }

      if (!files) return;

      let outermostFolderTitle = "";

      if (isFolder && files.length > 0 && files[0].webkitRelativePath) {
        outermostFolderTitle = files[0].webkitRelativePath.split("/")[0];
      }

      const formData = new FormData();
      formData.append("root", root);

      let personalSignature;
      if (encryptionEnabled) {
        personalSignature = await getPersonalSignature(
          name,
          autoEncryptionEnabled,
          accountType,
          logout
        );
        if (!personalSignature) {
          toast.error("Failed to get personal signature");
          logout();
          return;
        }
      }

      const encryptedPathsMapping: { [path: string]: string } = {};

      let encryptionTimeTotal = 0;

      const filesMap: { customFile: FileType; file: File }[] = [];

      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (encryptionEnabled) {
          const originalFile = file;
          const infoText = `Encrypting ${i + 1} of ${files.length}`;
          dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
          const encryptedResult = await handleEncryption(
            file,
            personalSignature,
            isFolder,
            encryptedPathsMapping
          );
          if (!encryptedResult) {
            toast.error("Failed to encrypt file");
            return;
          }
          const {
            encryptedFile,
            cidOfEncryptedBufferStr,
            cidOriginalStr,
            cidOriginalEncryptedBase64Url,
            encryptedWebkitRelativePath,
            encryptionTime,
          } = encryptedResult;

          file = encryptedFile;



          encryptionTimeTotal += encryptionTime;

          const customFile: FileType = {
            name: encryptedFile.name,
            name_unencrypted: originalFile.name,
            cid: cidOfEncryptedBufferStr || '',
            id: 0,
            uid: "",
            cid_original_encrypted: cidOriginalEncryptedBase64Url || '',
            cid_original_unencrypted: cidOriginalStr || '',
            cid_original_encrypted_base64_url: cidOriginalEncryptedBase64Url,
            size: encryptedFile.size,
            root: root,
            mime_type: encryptedFile.type,
            mime_type_unencrypted: originalFile.type,
            media_type: encryptedFile.type.split("/")[0],
            path: encryptedWebkitRelativePath,
            encryption_status: EncryptionStatus.Encrypted,
            created_at: "",
            updated_at: "",
            deleted_at: "",
          }

          filesMap.push({ customFile, file });

        } else {
          const uint8ArrayBuffer = new Uint8Array(await file.arrayBuffer());
          const cidStr = await getCid(uint8ArrayBuffer, dispatch);

          const customFile: FileType = {
            name: file.name,
            cid: cidStr,
            id: 0,
            uid: "",
            cid_original_encrypted: "",
            size: file.size,
            root: root,
            mime_type: file.type,
            media_type: file.type.split("/")[0],
            path: file.webkitRelativePath,
            encryption_status: EncryptionStatus.Public,
            created_at: "",
            updated_at: "",
            deleted_at: "",
          }

          filesMap.push({ customFile, file });


        }
      }

      //parse encryption total of all files with encrypted option
      if (encryptionTimeTotal > 0) {
        let encryptionSuffix = "milliseconds";
        if (encryptionTimeTotal >= 1000 && encryptionTimeTotal < 60000) {
          encryptionTimeTotal /= 1000;
          encryptionSuffix = "seconds";
        } else if (encryptionTimeTotal >= 60000) {
          encryptionTimeTotal /= 60000;
          encryptionSuffix = "minutes";
        }
        const encryptionTimeParsed =
          "Encrypting the data took " +
          encryptionTimeTotal.toFixed(2).toString() +
          " " +
          encryptionSuffix;
        toast.success(`${encryptionTimeParsed}`);
      }

      const infoText = isFolder
        ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
        : files.length === 1
          ? files[0].name
          : `uploading ${files.length} files`;

      dispatch(setUploadStatusAction({ info: infoText, uploading: true }));

      await postData(formData, filesMap, outermostFolderTitle, isFolder);

    }
  };

  const postData = async (formData: FormData, filesMap: { customFile: FileType, file: File }[], outermostFolderTitle: string, isFolder: boolean) => {

    //iterate over each file and make a get request to check if cid exists in Api
    //post file metadata to api

    //get customFiles from filesMap
    const customFiles = filesMap.map(fileMap => fileMap.customFile);
    let filesToUpload: { customFile: FileType, file: File }[] = [];

    let folderRootUID = "";
    await Api.post(`/file/pool/check`, customFiles)

      .then((res) => {
        // CIDs of files that were FOUND in S3 and need to be dispatched.
        const filesFound: FileType[] = res.data.filesFound;
        folderRootUID = res.data.firstRootUID;



        // Dispatch actions for files that were found in S3.
        filesToUpload = filesMap.filter((fileMap) => {
          const fileInFilesFound = (filesFound || []).some(fileFound => fileFound.cid === fileMap.customFile.cid);
          return !fileInFilesFound;

        }
        )



        filesToUpload.forEach((fileMap, index) => {
          // Append the files that need to be uploaded to formData.
          if (fileMap.customFile.encryption_status === EncryptionStatus.Encrypted) {
            formData.append("encryptedFiles", fileMap.file)
            formData.append(`cid[${index}]`, fileMap.customFile.cid)
            if (fileMap.customFile.cid_original_encrypted_base64_url)
              formData.append(`cidOriginalEncrypted[${index}]`, fileMap.customFile.cid_original_encrypted_base64_url)
            formData.append(`webkitRelativePath[${index}]`, fileMap.customFile.path)
          } else {
            formData.append(`cid[${index}]`, fileMap.customFile.cid)
            formData.append("files", fileMap.file)
          }
        })


        const filesFoundInS3 = filesMap.filter((fileMap) =>
          (filesFound || []).some(fileFound => fileFound.cid === fileMap.customFile.cid)
        )

        filesFoundInS3.forEach((fileMap) => {
          if (filesFound) {
            const fileFound = filesFound.find(f => f.cid === fileMap.customFile.cid);

            //replace for customFile in fileMap values:
            //- put name_unencrypted to name
            //- put cid_original_unencrypted to cid_original_encrypted
            //- put mime_type_unencrypted to mime_type

            fileMap.customFile.id = fileFound?.id || 0;
            fileMap.customFile.uid = fileFound?.uid || '';
            fileMap.customFile.created_at = fileFound ? fileFound.created_at.toString() : "";
            fileMap.customFile.updated_at = fileFound ? fileFound.updated_at.toString() : "";
            fileMap.customFile.is_in_pool = fileFound?.is_in_pool || false;

            fileMap.customFile.name = fileMap.customFile.name_unencrypted || '';
            fileMap.customFile.cid_original_encrypted = fileMap.customFile.cid_original_unencrypted || '';
            fileMap.customFile.mime_type = fileMap.customFile.mime_type_unencrypted || '';


            if (!isFolder) dispatch(createFileAction(fileMap.customFile))
          }

        })
      })
      .catch((err) => {
        console.log(err);
      });

    if (filesToUpload.length !== 0) {
      await Api.post("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      })
        .then((res) => {
          toast.success("upload Succeed!");
          setSidebarOpen(false);
          dispatch(
            setUploadStatusAction({
              info: "Finished uploading data",
              uploading: false,
            })
          );

          //getAll files and encryptedFils into a single files variable from formData
          const filesRes = res.data.files;



          for (let i = 0; i < filesRes.length; i++) {
            //get file at index from formdata
            const fileRes = filesRes[i];
            const file = customFiles[i];

            const fileObject: FileType = {
              name: file.name_unencrypted || file.name,
              cid: fileRes.cid,
              id: fileRes.id,
              uid: fileRes.uid,
              cid_original_encrypted: file.cid_original_unencrypted || file.cid_original_encrypted,
              size: file.size,
              root: fileRes.root,
              mime_type: file.mime_type_unencrypted || file.mime_type,
              media_type: file.media_type,
              path: file.path,
              encryption_status: fileRes.encryption_status,
              created_at: fileRes.created_at,
              updated_at: fileRes.updated_at,
              deleted_at: fileRes.deleted_at,
            }
            if (!isFolder) dispatch(createFileAction(
              fileObject
            ))

          }

        })
        .catch((err) => {
          console.log(err);
          toast.error("upload failed!");
        })
        .finally(() => dispatch(setUploadStatusAction({ uploading: false })));
    } else {
      toast.success("upload Succeed!");
      setSidebarOpen(false);
      dispatch(
        setUploadStatusAction({
          info: "Finished uploading data",
          uploading: false,
        })
      );

    }
    if (isFolder && folderRootUID !== "" && outermostFolderTitle !== "") {
      dispatch(createFolderAction({
        title: outermostFolderTitle,
        uid: folderRootUID,
        root: getRoot(),
        created_at: "",
        updated_at: "",
        deleted_at: "",
        id: 0,
        path: "/",
        encryption_status: encryptionEnabled ? EncryptionStatus.Encrypted : EncryptionStatus.Public,
      }))
    }
    fetchUserDetail();
    dispatch(setUploadStatusAction({ uploading: false }))
  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    //handleInputChange(event, false);
    setSidebarOpen(false);
  };

  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    //handleInputChange(event, true);
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
        <button onClick={() => uploadFile()}>Upload dummy</button>

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
