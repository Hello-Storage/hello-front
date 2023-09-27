import { Api } from "api";
import { EncryptionStatus, Folder } from "api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth, useDropdown, useFetchData } from "hooks";
import JSZip from "jszip";
import { useRef, useState } from "react";
import { FaFolder } from "react-icons/fa";
import {
  HiDocumentDuplicate,
  HiDotsVertical,
  HiLockClosed,
  HiOutlineDownload,
  HiOutlineLockOpen,
  HiOutlineShare,
  HiOutlineTrash,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import { formatUID } from "utils";
import {
  decryptContent,
  decryptFileBuffer,
  decryptMetadata,
  hexToBuffer,
} from "utils/encryption/filesCipher";
import getPersonalSignature from "api/getPersonalSignature";
import { useAppSelector } from "state";
import getAccountType from "api/getAccountType";
import { logoutUser } from "state/user/actions";
import { truncate } from "utils/format";

dayjs.extend(relativeTime);

import React from "react";

interface FolderItemProps {
  folder: Folder;
  view: "list" | "grid";
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, view }) => {
  const { fetchRootContent } = useFetchData();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { name } = useAppSelector((state) => state.user);
  const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);
  const { logout } = useAuth();
  const accountType = getAccountType();
  useDropdown(ref, open, setOpen);

  const onCopy = (event: React.MouseEvent) => {
    if (!event.ctrlKey) return;
    copy(`https://staging.joinhello.app/folder/${folder.uid}`);
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
    // Make a request to download the file with responseType 'blob'
    Api.get(`/folder/download/${folder.uid}`)
      .then(async (res) => {
        const zip = new JSZip();

        // Iterate through the files and add them to the ZIP
        for (const file of res.data.files) {
          const fileData = atob(file.data);
          if (file.encryption_status === EncryptionStatus.Encrypted) {
            const decryptionResult = await decryptMetadata(
              file.name,
              file.mime_type,
              file.cid_original_encrypted,
              personalSignature
            );
            if (!decryptionResult) {
              logoutUser();
              return;
            }
            const {
              decryptedFilename,
              decryptedFiletype,
              decryptedCidOriginal,
            } = decryptionResult;
            const stringToArrayBuffer = (str: string): ArrayBuffer => {
              const buf = new ArrayBuffer(str.length);
              const bufView = new Uint8Array(buf);
              for (let i = 0; i < str.length; i++) {
                bufView[i] = str.charCodeAt(i);
              }
              return buf;
            };

            //transform fileData string to Array Buffer
            const fileDataBufferEncrypted = stringToArrayBuffer(fileData);
            const fileDataBuffer = await decryptFileBuffer(
              fileDataBufferEncrypted,
              decryptedCidOriginal,
              () => void 0,
            );
            if (!fileDataBuffer) {
              toast.error("Failed to decrypt file");
              return;
            }
            //transform buffer to Blob
            const fileDataBlob = new Blob([fileDataBuffer], {
              type: decryptedFiletype,
            });

            const decryptedPathComponents = [];
            const pathComponents = file.path.split("/");
            // Decrypt the path components
            for (let i = 0; i < pathComponents.length - 1; i++) {
              const component = pathComponents[i];
              const encryptedComponentUint8Array = hexToBuffer(component);

              const decryptedComponentBuffer = await decryptContent(
                encryptedComponentUint8Array,
                personalSignature
              );
              const decryptedComponentStr = new TextDecoder().decode(
                decryptedComponentBuffer
              );
              decryptedPathComponents.push(decryptedComponentStr);
            }
            decryptedPathComponents.push(decryptedFilename);

            const decryptedFilePath = decryptedPathComponents.join("/");
            zip.file(decryptedFilePath, fileDataBlob, { binary: true });
          } else {
            zip.file(file.path, fileData, { binary: true });
          }
        }

        //Generate the ZIP file and trigger the download
        zip.generateAsync({ type: "blob" }).then((content) => {
          const url = window.URL.createObjectURL(content);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${folder.title}.zip`; // Set the file name
          a.click(); // Trigger the download
          // Clean up
          window.URL.revokeObjectURL(url);
        });
      })
      .catch((err) => {
        console.error("Error downloading folder:", err);
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
          fetchRootContent();
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
        <th
          scope="row"
          className="px-3 py-1 font-medium text-gray-900 whitespace-nowrap"
          // onDragEnter={() => setIsDraggingOver(true)}
        >
          <div className="flex items-center gap-3 select-none">
            <FaFolder size={32} color="#737373" />
            {truncate(folder.title, 24)}
          </div>
        </th>
        <td className="p-1">
          <div
            className="flex items-center gap-1 select-none hover:text-blue-500"
            onClick={onCopy}
          >
            {formatUID(folder.uid)}
            <HiDocumentDuplicate />
          </div>
        </td>
        <td className="p-1">-</td>
        <td className="p-1">
          <div className="flex items-center select-none">
            {folder.encryption_status === "public" ? (
              <>
                <HiOutlineLockOpen />
                <>Public</>
              </>
            ) : (
              <HiLockClosed />
            )}{" "}
            {folder.encryption_status === "encrypted" && <>Encrypted</>}
          </div>
        </td>
        <td className="p-1 select-none">
          {dayjs(folder.updated_at).fromNow()}
        </td>
        <td className="py-1 px-3 text-right">
          <button
            className="rounded-full hover:bg-gray-300 p-3"
            onClick={() => setOpen(!open)}
          >
            <HiDotsVertical />
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
        </td>
      </>
    );
  else
    return (
      <div className="bg-white p-3 rounded-md mb-3 border border-gray-200 shadow-md relative">
        <div className="flex justify-between items-center">
          <div className="">
            <FaFolder
              className="inline-block mr-3 align-middle"
              size={32}
              color="#737373"
            />

            <label className="font-medium text-gray-900 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
              {truncate(folder.title, 24)}
            </label>
          </div>
          <button
            className="rounded-full hover:bg-gray-300 p-3"
            onClick={() => setOpen(!open)}
          >
            <HiDotsVertical />
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

        {/* <div className="flex items-center mt-auto text-xs gap-2">
          {formatUID(folder.uid)} <HiDocumentDuplicate />
        </div> */}
      </div>
    );
};

export default FolderItem;
