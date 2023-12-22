import { Api } from "api";
import { EncryptionStatus, Folder } from "api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth, useDropdown } from "hooks";
import JSZip from "jszip";
import { useRef, useState } from "react";
import { FaFolder } from "react-icons/fa";
import {
  HiDotsVertical,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineTrash,
} from "react-icons/hi";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import {
  decryptContent,
  decryptFileBuffer,
  decryptMetadata,
  hexToBuffer,
} from "utils/encryption/filesCipher";
import getPersonalSignature from "api/getPersonalSignature";
import { useAppDispatch, useAppSelector } from "state";
import getAccountType from "api/getAccountType";
import { logoutUser } from "state/user/actions";
import { truncate } from "utils/format";
import { removeFolder } from "state/mystorage/actions";

dayjs.extend(relativeTime);

import React from "react";
import { downloadFolderMultipart, folderDownload } from "utils/upload/foldersDownload";

interface FolderItemProps {
  folder: Folder;
  view: "list" | "grid";
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, view }) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { name } = useAppSelector((state) => state.user);
  const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);
  const { logout } = useAuth();
  const accountType = getAccountType();
  useDropdown(ref, open, setOpen);

  const onCopy = (event: React.MouseEvent) => {
    if (!event.ctrlKey) return;
    copy(`https://hello.app/space/folder/${folder.uid}`);
    toast.success("copied CID");
  };

  const handleDownload = async () => {
    const personalSignature = await getPersonalSignature(
      name,
      autoEncryptionEnabled,
      accountType,
      logout
    );
    if (!personalSignature) {
      toast.error("Failed ta get personal signature");
      return;
    }
    //downloadFolderMultipart(folder, dispatch, personalSignature);

    folderDownload(personalSignature, folder, dispatch).catch((err) => {
      console.error(err);
      toast.error("Error downloading folder");
    });


  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${folder.title} and all of its content?`
      )
    ) {
      // Make a request to delete the file
      Api.delete(`/folder/${folder.uid}`)
        .then(() => {
          // Show a success message
          toast.success("Folder deleted successfully!");
          // Fetch the root content again
          dispatch(removeFolder(folder.uid));
        })
        .catch((err) => {
          console.error("Error deleting folder:", err);
          // Show an error message
          toast.error("Error deleting folder!");
        });
    }
  };

  if (view === "list")
    return (
      <>
        <div className="bg-gray-50 hover:bg-gray-100 px-5 py-3 w-[220px] rounded-lg relative overflow-visible">
          <div className="flex flex-row items-center justify-between relative">
            <FaFolder
              className="inline-block align-middle mr-2"
              size={24}
              color="#272727"
            />
            <div className="flex flex-row justify-between items-center w-full relative">
              <label className="font-medium cursor-pointer text-gray-900 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
                {truncate(folder.title, 12)}
              </label>
              <button
                className="rounded-lg hover:bg-gray-100 p-1"
                onClick={() => setOpen(!open)}
              >
                <HiDotsVertical className="align-middle" />{" "}
                <div className="drop-down-menu" ref={ref}>
                  {open && (
                    <div
                      id="dropdown"
                      className="z-50 absolute origin-top-right right-0 mt-2 bg-white shadow text-left w-36 divide-y borde r"
                    >
                      <ul className="py-2">
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={handleDownload}
                        >
                          <HiOutlineDownload className="inline-flex mr-3" />
                          Download
                        </a>
                        {/*
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          <HiOutlineShare className="inline-flex mr-3" />
                          Share
                  </a>*/}
                      </ul>
                      <div className="py-2">
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={handleDelete}
                        >
                          <HiOutlineTrash className="inline-flex mr-3" />
                          Delete
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  else
    return (
      <div className="bg-gray-50 hover:bg-gray-100 px-5 py-3 w-[220px] rounded-lg relative">
        <div className="flex flex-row items-center justify-between">
          <FaFolder
            className="inline-block align-middle mr-2"
            size={24}
            color="#272727"
          />
          <div className="flex flex-row justify-between items-center w-full">
            <label className="font-medium cursor-pointer text-gray-900 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
              {truncate(folder.title, 12)}
            </label>
            <button
              className="rounded-lg hover:bg-gray-100 p-1"
              onClick={() => setOpen(!open)}
            >
              <HiDotsVertical className="align-middle" />{" "}
              <div className="relative" ref={ref}>
                {open && (
                  <div
                    id="dropdown"
                    className="absolute right-6 z-10 mt-2 bg-white shadow text-left w-36 divide-y border"
                  >
                    <ul className="py-2">
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleDownload}
                      >
                        <HiOutlineDownload className="inline-flex mr-3" />
                        Download
                      </a>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                        <HiOutlineShare className="inline-flex mr-3" />
                        Share
                      </a>
                    </ul>
                    <div className="py-2">
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleDelete}
                      >
                        <HiOutlineTrash className="inline-flex mr-3" />
                        Delete
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
};

export default FolderItem;
