import { Api } from "api";
import { Folder } from "api/types";
import { PublicIcon } from "components";
import dayjs from "dayjs";
import { useDropdown, useFetchData } from "hooks";
import JSZip from "jszip";
import { useRef, useState } from "react";
import { FaFolder } from "react-icons/fa";
import {
  HiDocumentDuplicate,
  HiDotsVertical,
  HiFolder,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineTrash,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatUID } from "utils";

interface FolderAdapterProps {
  folder: Folder;
}

const handleDownload = (folder: Folder) => {
  // Make a request to download the file with responseType 'blob'
  Api.get(`/folder/download/${folder.uid}`)
    .then((res) => {
      const zip = new JSZip();

      console.log(res);
      // Iterate through the files and add them to the ZIP
      res.data.files.forEach((file: any) => {
        // TO-DO: Decrypt in case encrypted
        const fileData = atob(file.data); // Decode the base64 string
        zip.file(file.path, fileData, { binary: true });
      });

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

const FolderAdapter: React.FC<FolderAdapterProps> = ({ folder }) => {
  const { fetchRootContent } = useFetchData();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  const onFolderDoubleClick = (folderUID: string) => {
    navigate(`/folder/${folderUID}`);
  };

  const handleDelete = (folder: Folder) => {
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

  return (
    <tr
      className={`bg-white cursor-pointer border-b hover:bg-gray-100`}
      onDoubleClick={() => onFolderDoubleClick(folder.uid)}
    >
      <th
        scope="row"
        className="px-3 py-1 font-medium text-gray-900 whitespace-nowrap"
      >
        <div className="flex items-center gap-3 select-none">
          <FaFolder size={32} color="#737373" />
          {folder.title}
        </div>
      </th>
      <td className="p-1">
        <div className="flex items-center gap-1 select-none">
          {formatUID(folder.uid)}
          <HiDocumentDuplicate />
        </div>
      </td>
      <td className="p-1">-</td>
      <td className="p-1">
        <div className="flex items-center select-none">
          <PublicIcon /> Public
        </div>
      </td>
      <td className="p-1 select-none">{dayjs(folder.updated_at).fromNow()}</td>
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
                    onClick={() => handleDownload(folder)}
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
                    onClick={() => handleDelete(folder)}
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

export default FolderAdapter;
