import { Api } from "api";
import { EncryptionStatus, File as FileType } from "api/types";
import dayjs from "dayjs";
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
import {
  getFileExtension,
  getFileIcon,
  viewableExtensions,
} from "./utils";
import { formatBytes, formatUID } from "utils";
import { toast } from "react-toastify";
import { useDropdown, useFetchData } from "hooks";
import { useRef, useState } from "react";
import copy from "copy-to-clipboard";
import { blobToArrayBuffer, decryptFileBuffer } from "utils/encryption/filesCipher";

interface FileItemProps {
  file: FileType;
  view: "list" | "grid";
}

const FileItem: React.FC<FileItemProps> = ({ file, view }) => {
  const { fetchRootContent } = useFetchData();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  const fileExtension = getFileExtension(file.name)?.toLowerCase() || "";

  const onCopy = () => {
    copy(`https://staging.joinhello.app/file/${file.uid}`);
    toast.success("copied CID");
  };

  // Function to handle file download
const handleDownload = () => {
  // Make a request to download the file with responseType 'blob'
  Api.get(`/file/download/${file.uid}`, { responseType: "blob" })
    .then(async (res) => {
      // Create a blob from the response data
      let binaryData = res.data;
      if (file.status === EncryptionStatus.Encrypted) {
        const originalCid = file.cid_original_encrypted;
        binaryData = await blobToArrayBuffer(binaryData);
        binaryData = await decryptFileBuffer(binaryData, originalCid)
      }
      const blob = new Blob([binaryData], { type: file.mime_type });

      // Create a link element and set the blob as its href
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name; // Set the file name
      a.click(); // Trigger the download

      // Clean up
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => {
      console.error("Error downloading file:", err);
    });
};

  const handleView = (file: FileType) => {
  // Make a request to download the file with responseType 'blob'
  Api.get(`/file/download/${file.uid}`, { responseType: "blob" })
    .then(async (res) => {
      console.log(res)
      // Get blob from the file object
      let binaryData = res.data;
      if (file.status === EncryptionStatus.Encrypted) {
        const originalCid = file.cid_original_encrypted;
        binaryData = await blobToArrayBuffer(binaryData);
        binaryData = await decryptFileBuffer(binaryData, originalCid)
      }
      const blob = new Blob([binaryData], { type: file.mime_type });

      if (!blob) {
        console.error("Error downloading file:", file);
        return;
      }

      // Create a blob URL from the blob
      const url = window.URL.createObjectURL(blob);

      // Open the URL in a new tab
      window.open(url, "_blank");

      // Create a link and programmatically 'click' it to trigger the browser to download the file
      const link = document.createElement("video");

      link.setAttribute("download", file.name);

      window.URL.revokeObjectURL(url);
    })
    .catch((err) => {
      console.error("Error downloading file:", err);
    });
};


  const handleDelete = () => {
    // Make a request to delete the file with response code 200
    Api.delete(`/file/delete/${file.uid}`)
      .then((res) => {
        console.log(res);
        toast.success("File deleted!");
        fetchRootContent();
      })
      .catch((err) => {
        console.error("Error deleting file:", err);
      });
  };

  const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>) => {
    const dragInfo = JSON.stringify({
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString(),
      type: "file",
    });
    console.log("Drag: " + dragInfo);
    event.dataTransfer.setData("text/plain", dragInfo);
  };

  const onFileDoubleClick = (file: FileType) =>  {
    handleView(file);
  }

  if (view === "list")
    return (
      <tr
        id={file.id.toString()}
        aria-label={file.uid}
        draggable
        onDragStart={handleDragStart}
        className="bg-white cursor-pointer border-b hover:bg-gray-100"
        onDoubleClick={() => onFileDoubleClick(file)}
      >
        <th
          scope="row"
          className="px-3 py-1 font-medium text-gray-900 whitespace-nowrap"
        >
          <div className="flex items-center gap-3">
            {getFileIcon(file.name)}
            {file.name}
          </div>
        </th>
        <td className="p-1">
          <div
            className="flex items-center gap-1 select-none hover:text-blue-500"
            onClick={onCopy}
          >
            {formatUID(file.cid)}
            <HiDocumentDuplicate />
          </div>
        </td>
        <td className="p-1">{formatBytes(file.size)}</td>
        <td className="p-1">
          <div className="flex items-center">
            {file.status === "public" ? <><HiOutlineLockOpen /><>Public</></> : <HiLockClosed />} {file.status === "encrypted" && <>Encrypted</>}
          </div>
        </td>
        <td className="p-1">{dayjs(file.updated_at).fromNow()}</td>
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
                  className="absolute right-6 z-50 mt-2 bg-white shadow-lg text-left w-36 divide-y border"
                  style={{ bottom: "100%" }}
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
                    {viewableExtensions.has(fileExtension) && (
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleView(file)}
                      >
                        <HiOutlineEye className="inline-flex mr-3" />
                        View
                      </a>
                    )}
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
      </tr>
    );
  else
    return (
      <div className="bg-white p-4 rounded-md mb-3 border border-gray-200 shadow-md">
        <div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-1 bg-gray-100 rounded-md">
              <HiDocumentText className="w-7 h-7" />
            </div>
            <div className="font-medium text-gray-900 text-center overflow-hidden whitespace-nowrap overflow-ellipsis">
              {file.name}
            </div>
          </div>
        </div>
        <div className="text-center text-xs">
          <label>{formatUID(file.uid)}</label>
          <HiDocumentDuplicate className="inline-block" />
        </div>
      </div>
    );
};

export default FileItem;
