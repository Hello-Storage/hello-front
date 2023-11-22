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
import { GoAlertFill } from "react-icons/go";
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
  setFileViewAction, setImageViewAction, setSelectedShareFile,
  setShowShareModal
} from "state/mystorage/actions";
import { truncate, formatDate } from "utils/format";
import { AxiosProgressEvent } from "axios";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { removeFileAction } from "state/mystorage/actions";
import { logoutUser } from "state/user/actions";

dayjs.extend(relativeTime);

interface FileItemProps {
  file: FileType;
  view: "list" | "grid";
  setloaded: React.Dispatch<React.SetStateAction<boolean>>
}

const FileItem: React.FC<FileItemProps> = ({ file, view, setloaded }) => {
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
            const error = err.response?.data.error;

            if (
              !localStorage.getItem("access_token") &&
              err.response?.status === 401 &&
              error &&
              [
                "authorization header is not provided",
                "token has expired",
              ].includes(error)
            ) {
              dispatch(logoutUser());
            }
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
        const error = err.response?.data.error;

        if (
          !localStorage.getItem("access_token") &&
          err.response?.status === 401 &&
          error &&
          [
            "authorization header is not provided",
            "token has expired",
          ].includes(error)
        ) {
          dispatch(logoutUser());
        }
        console.error("Error downloading file:", err);
      });
  };

  const handleView = () => {
    viewRef.current = true;

    dispatch(setFileViewAction({ file: undefined }));
    dispatch(setImageViewAction({ show: false }));
    setloaded(false)

    dispatch(setFileViewAction({
      file: file
    }))
    dispatch(setImageViewAction({
      show: true
    }))
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
        const error = err.response?.data.error;
        if (
          !localStorage.getItem("access_token") &&
          err.response?.status === 401 &&
          error &&
          [
            "authorization header is not provided",
            "token has expired",
          ].includes(error)
        ) {
          dispatch(logoutUser());
        }
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
            {file.is_in_pool && (
              <GoAlertFill style={{ color: "#FF6600" }}
                title="File is in Hello Pool" />
            )}
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
          {dayjs(formatDate(file.updated_at)).fromNow()}
        </td>
        <td className="py-1 pr-8 text-right">
          <button
            className="p-3 rounded-full hover:bg-gray-300"
            onClick={() => setOpen(!open)}
          >
            <HiDotsVertical />
            <div className="relative " ref={ref}>
              {open && (
                <div
                  id="dropdown"
                  className="absolute top-0 z-50 mt-2 text-left border divide-y shadow-lg right-6 w-36 "
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
        className="p-4 mb-3 border border-gray-200 rounded-lg bg-gray-50 hover:cursor-pointer hover:bg-gray-100"
        onClick={handleView}
      >
        <div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center w-full gap-2 overflow-hidden font-medium text-center text-gray-900 whitespace-nowrap overflow-ellipsis">
              <HiDocumentText className="flex-shrink-0 w-4 h-4" />
              {file.is_in_pool && (
                <GoAlertFill style={{ color: "#FF6600" }} />
              )}
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
          className="flex items-center gap-1 mt-4 text-xs text-center select-none justify-left hover:text-blue-500"
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
