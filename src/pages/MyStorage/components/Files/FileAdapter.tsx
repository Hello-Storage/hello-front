import { Api, File as FileType } from "api";
import { PublicIcon } from "components";
import dayjs from "dayjs";
import {
  HiDocumentDuplicate,
  HiDotsVertical,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineEye,
  HiOutlineTrash,
} from "react-icons/hi";
import { formatBytes, formatUID } from "utils";
import { getFileIcon, isViewable } from "./utils";
import { toast } from "react-toastify";
import { useDropdown, useFetchData } from "hooks";
import { useRef, useState } from "react";

interface FileAdapterProps {
  file: FileType;
}

// Function to handle file download

const handleDownload = (file: FileType) => {
  // Make a request to download the file with responseType 'blob'
  Api.get(`/file/download/${file.uid}`, { responseType: "blob" })
    .then((res) => {
      // Create a blob from the response data
      const blob = new Blob([res.data], { type: file.mime_type });

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
    .then((res) => {
      //Create a file object from the response data
      const downloadedFile = new File([res.data], file.name, {
        type: file.mime_type,
      });

      if (!downloadedFile) {
        console.error("Error downloading file:", file);
        return;
      }

      // Get blob from the file object
      const blob = new Blob([downloadedFile], { type: file.mime_type });

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
    })
    .catch((err) => {
      console.error("Error downloading file:", err);
    });
};

const FileAdapter: React.FC<FileAdapterProps> = ({ file }) => {
  const { fetchRootContent } = useFetchData();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  const handleDelete = (file: FileType) => {
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

  const onFileDoubleClick = (file: FileType) => {
    handleView(file);
  };
  return (
    <tr
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
        <div className="flex items-center gap-1">
          {formatUID(file.uid)}
          <HiDocumentDuplicate />
        </div>
      </td>
      <td className="p-1">{formatBytes(file.size)}</td>
      <td className="p-1">
        <div className="flex items-center">
          <PublicIcon /> Public
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
                className="absolute right-6 z-10 mt-2 bg-white shadow-lg text-left w-36 divide-y border"
              >
                <ul className="py-2">
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleDownload(file)}
                  >
                    <HiOutlineDownload className="inline-flex mr-3" />
                    Download
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    <HiOutlineShare className="inline-flex mr-3" />
                    Share
                  </a>
                  {isViewable(file.name) && (
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
                    onClick={() => handleDelete(file)}
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
};

export default FileAdapter;
