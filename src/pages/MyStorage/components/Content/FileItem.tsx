import { Api } from "api";
import { EncryptionStatus, File as FileType } from "api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  HiDocumentDuplicate,
  HiDotsVertical,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineEye,
  HiOutlineTrash,
  HiDocumentText,
  HiOutlineLockOpen,
  HiLockClosed,
} from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";
import { getFileExtension, getFileIcon, viewableExtensions } from "./utils";
import { formatBytes, formatUID } from "utils";
import { toast } from "react-toastify";
import { useDropdown } from "hooks";
import { useRef, useState, Fragment } from "react";
import copy from "copy-to-clipboard";
import {
  blobToArrayBuffer,
  decryptFileBuffer,
} from "utils/encryption/filesCipher";
import React from "react";
import { useAppDispatch } from "state";
import {
  PreviewImage,
  setImageViewAction,
  setSelectedShareFile,
  setShowShareModal,
} from "state/mystorage/actions";
import { truncate } from "utils/format";
import { AxiosProgressEvent } from "axios";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { removeFileAction } from "state/mystorage/actions";

dayjs.extend(relativeTime);

interface FileItemProps {
  file: FileType;
  view: "list" | "grid";
}

const FileItem: React.FC<FileItemProps> = ({ file, view }) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const fileExtension = getFileExtension(file.name)?.toLowerCase() || "";
  useDropdown(ref, open, setOpen);

  const onCopy = (event: React.MouseEvent) => {
    if (event.shiftKey) return;
    copy(`https://hello.app/space/file/${file.uid}`);
    toast.success("copied CID");
  };

  const viewRef = useRef(false);

  const onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
    dispatch(
      setUploadStatusAction({
        info: `${viewRef.current ? "Loading" : "Downloading"} ` + file.name,
        uploading: true,
      })
    );

    dispatch(
      setUploadStatusAction({
        read: progressEvent.loaded,
        size: file.size,
      })
    );
  };

  // Function to handle file download
  const handleDownload = () => {
    viewRef.current = false;
    toast.info("Starting download for " + file.name + "...");
    // Make a request to download the file with responseType 'blob'
    Api.get(`/file/download/${file.uid}`, {
      responseType: "blob",
      onDownloadProgress: onDownloadProgress,
    })
      .then(async (res) => {
        dispatch(
          setUploadStatusAction({
            info: "Finished downloading data",
            uploading: false,
          })
        );
        // Create a blob from the response data
        let binaryData = res.data;
        if (file.encryption_status === EncryptionStatus.Encrypted) {
          const originalCid = file.cid_original_encrypted;
          binaryData = await blobToArrayBuffer(binaryData);
          binaryData = await decryptFileBuffer(
            binaryData,
            originalCid,
            (percentage) => {
              dispatch(
                setUploadStatusAction({
                  info: "Decrypting...",
                  read: percentage,
                  size: 100,
                  uploading: true,
                })
              );
            }
          ).catch((err) => {
            console.error("Error downloading file:", err);
          });

          dispatch(
            setUploadStatusAction({
              info: "Decryption done",
              uploading: false,
            })
          );
        }
        const blob = new Blob([binaryData], { type: file.mime_type });

        // Create a link element and set the blob as its href
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name; // Set the file name
        a.click(); // Trigger the download
        toast.success("Download complete!");

        // Clean up
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Error downloading file:", err);
      });
  };

  const handleView = () => {
    viewRef.current = true;

    Api.get(`/file/download/${file.uid}`, {
      responseType: "blob",
      onDownloadProgress: onDownloadProgress,
    })
      .then(async (res) => {
        dispatch(
          setUploadStatusAction({
            info: "Finished downloading data",
            uploading: false,
          })
        );
        let binaryData = res.data;
        if (file.encryption_status === EncryptionStatus.Encrypted) {
          const originalCid = file.cid_original_encrypted;
          console.log(originalCid);
          binaryData = await blobToArrayBuffer(binaryData);
          binaryData = await decryptFileBuffer(
            binaryData,
            originalCid,
            (percentage) => {
              dispatch(
                setUploadStatusAction({
                  info: "Decrypting...",
                  read: percentage,
                  size: 100,
                  uploading: true,
                })
              );
            }
          );

          dispatch(
            setUploadStatusAction({
              info: "Decryption done",
              uploading: false,
            })
          );
        }
        const blob = new Blob([binaryData], { type: file.mime_type });
        if (!blob) {
          console.error("Error downloading file:", file);
          return;
        }
        const url = window.URL.createObjectURL(blob);

        let mediaItem: PreviewImage;
        if (file.mime_type.startsWith("video/")) {
          mediaItem = {
            type: "htmlVideo",
            videoSrc: url,
            alt: file.name,
          };
        } else if (
          file.mime_type === "application/pdf" ||
          file.mime_type === "text/plain"
        ) {
          window.open(url, "_blank"); // PDF or TXT in a new tab
          return;
        } else {
          mediaItem = {
            src: url,
            alt: file.name,
          };
        }

        dispatch(setImageViewAction({ img: mediaItem, show: true }));
      })
      .catch((err) => {
        console.error("Error downloading file:", err);
      });
  };

  const handleDelete = () => {
    // Make a request to delete the file with response code 200
    Api.delete(`/file/delete/${file.uid}`)
      .then((res) => {
        toast.success("File deleted!");

        dispatch(removeFileAction(file.uid));
      })
      .catch((err) => {
        console.error("Error deleting file:", err);
      });
  };

  if (view === "list")
    return (
      <>
        <td
          onDoubleClick={handleView}
          scope="row"
          className="px-3 font-medium text-gray-900 whitespace-nowrap "
        >
          <div className="flex items-center gap-3 ">
            {getFileIcon(file.name)}
            <FaUserGroup style={{ color: "#FF6600" }} />
            <span className="hidden md:inline"> {truncate(file.name, 40)}</span>
            <span className="inline md:hidden"> {truncate(file.name, 24)}</span>
          </div>
        </td>
        <td className="py-1 pr-8">
          <div
            className="flex items-center gap-1 select-none hover:text-blue-500"
            onClick={onCopy}
          >
            {formatUID(file.cid)}
            <HiDocumentDuplicate />
          </div>
        </td>
        <td className="py-1 pr-8 whitespace-nowrap">
          {formatBytes(file.size)}
        </td>
        <td className="py-1 pr-8">
          <div className="flex items-center">
            {file.encryption_status === "public" ? (
              <Fragment>
                <HiOutlineLockOpen />
                Public
              </Fragment>
            ) : (
              <Fragment>
                <HiLockClosed />
                Encrypted
              </Fragment>
            )}
          </div>
        </td>
        <td className="py-1 pr-8 whitespace-nowrap">
          {file.is_in_pool && (
            <div className="relative flex items-center ml-2"></div>
          )}
        </td>

        <td className="py-1 pr-8 text-right">
          <button
            className="rounded-full hover:bg-gray-300 p-3"
            onClick={() => setOpen(!open)}
          >
            <HiDotsVertical />
            <div className="relative " ref={ref}>
              {open && (
                <div
                  id="dropdown"
                  className="absolute right-6 z-50 mt-2 shadow-lg text-left w-36 divide-y border top-0 "
                  style={{ bottom: "100%" }}
                >
                  <ul className="py-2 bg-white">
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={handleDownload}
                    >
                      <HiOutlineDownload className="inline-flex mr-3" />
                      Download
                    </a>
                    <a
                      href="#"
                      onClick={() => {
                        dispatch(setShowShareModal(true));
                        dispatch(setSelectedShareFile(file));
                      }}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      <HiOutlineShare className="inline-flex mr-3" />
                      Share
                    </a>
                    {viewableExtensions.has(fileExtension) && (
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleView()}
                      >
                        <HiOutlineEye className="inline-flex mr-3" />
                        View
                      </a>
                    )}
                  </ul>

                  <div className="py-2 bg-white">
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 "
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
      <div
        className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200 hover:cursor-pointer hover:bg-gray-100"
        onClick={handleView}
      >
        <div>
          <div className="flex flex-col items-center gap-3">
            <div className="font-medium text-gray-900 text-center overflow-hidden whitespace-nowrap w-full overflow-ellipsis flex items-center gap-2">
              <HiDocumentText className="w-4 h-4 flex-shrink-0" />
              <span className="hidden md:inline">
                {truncate(file.name, 40)}
              </span>
              <span className="inline md:hidden">
                {truncate(file.name, 24)}
              </span>
            </div>
          </div>
        </div>
        <div
          className="text-center text-xs flex items-center justify-left gap-1 select-none hover:text-blue-500 mt-4"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent's onClick
            onCopy(e);
          }}
        >
          <label>{formatUID(file.cid)}</label>
          <HiDocumentDuplicate className="inline-block" />
        </div>
      </div>
    );
};

export default FileItem;
