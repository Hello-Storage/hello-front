import { Dialog } from "@headlessui/react";
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
import {
  fileIcons,
  getFileExtension,
  getFileIcon,
  viewableExtensions,
} from "./utils";
import { toast } from "react-toastify";
import { useDropdown, useFetchData } from "hooks";
import { useRef, useState } from "react";

interface FileAdapterProps {
  file: FileType;
}

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

const FileAdapter: React.FC<FileAdapterProps> = ({ file }) => {
  const { fetchRootContent } = useFetchData();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  useDropdown(ref, open, setOpen);

  const handleView = (file: FileType) => {
    // Make a request to download the file with responseType 'blob'
    Api.get(`/file/download/${file.uid}`, { responseType: "blob" })
      .then((res) => {
        // Create a blob from the response data
        const blob = new Blob([res.data], { type: file.mime_type });

        // Create a link element and set the blob as its href
        const url = window.URL.createObjectURL(blob);

        // Instead of opening the URL in a new tab, set the URL state and open the modal
        setUrl(url);
        setIsModalOpen(true);
      })
      .catch((err) => {
        console.error("Error downloading file:", err);
      });
  };

  const fileExtension = getFileExtension(file.name)?.toLowerCase() || "";
  const fileIcon =
    (fileIcons as unknown as { [key: string]: string })[fileExtension] ||
    "fa-file"; // default to 'fa-file' if the extension is not found in the map

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
    <>
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
                  className="absolute right-6 z-50 mt-2 bg-white shadow-lg text-left w-36 divide-y border"
                  style={{ bottom: "100%" }}
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
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <Dialog.Title className="text-lg leading-6 font-medium text-gray-900 p-6">
              File Viewer
            </Dialog.Title>
            <div className="p-6">
              <iframe src={url} width="100%" height="500px"></iframe>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default FileAdapter;
