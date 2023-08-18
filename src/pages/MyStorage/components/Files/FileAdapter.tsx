
import { Api, File as FileType } from "api";
import { PublicIcon } from "components";
import dayjs from "dayjs";
import { HiDocumentDuplicate, HiDotsVertical } from "react-icons/hi";
import { formatBytes, formatUID } from "utils";
import { fileIcons, getFileExtension, viewableExtensions } from "./utils";
import { toast } from "react-toastify";
import { useRoot } from "hooks";

interface FileAdapterProps {
    file: FileType;
    index: number;
    openDropdownIndex: string | null;
    handleDropdownClick: (type: string, index: number, event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Function to handle file download

const handleDownload = (file: FileType) => {
    // Make a request to download the file with responseType 'blob'
    Api.get(`/download/${file.uid}`, { responseType: 'blob' })
        .then((res) => {
            // Create a blob from the response data
            const blob = new Blob([res.data], { type: file.mimeType });

            // Create a link element and set the blob as its href
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name; // Set the file name
            a.click(); // Trigger the download

            // Clean up
            window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
            console.error('Error downloading file:', err);
        });
};

const handleView = (file: FileType) => {
    // Make a request to download the file with responseType 'blob'
    Api.get(`/download/${file.uid}`, { responseType: 'blob' })
        .then((res) => {
            //Create a file object from the response data
            const downloadedFile = new File([res.data], file.name, { type: file.mimeType });

            if (!downloadedFile) {
                console.error('Error downloading file:', file);
                return;
            }

            // Get blob from the file object
            const blob = new Blob([downloadedFile], { type: file.mimeType });

            if (!blob) {
                console.error('Error downloading file:', file);
                return;
            }

            // Create a blob URL from the blob
            const url = window.URL.createObjectURL(blob);

            // Open the URL in a new tab
            window.open(url, '_blank');

            // Create a link and programmatically 'click' it to trigger the browser to download the file
            const link = document.createElement('video');

            link.setAttribute('download', file.name);
        }).catch((err) => {
            console.error('Error downloading file:', err);
        });
}


const FileAdapter: React.FC<FileAdapterProps> = ({ file, index, openDropdownIndex, handleDropdownClick }) => {


    const { fetchRootContent } = useRoot();

    const fileExtension = getFileExtension(file.name)?.toLowerCase() || '';
    const fileIcon = (fileIcons as { [key: string]: string })[fileExtension] || 'fa-file';  // default to 'fa-file' if the extension is not found in the map

    const handleDelete = (file: FileType) => {
        // Make a request to delete the file with response code 200
        Api.delete(`/delete/${file.uid}`)
            .then((res) => {
                console.log(res);
                toast.success("File deleted!");
                fetchRootContent();
            }).catch((err) => {
                console.error('Error deleting file:', err);
            });
    }

    return (
        <tr
            className="bg-white cursor-pointer border-b hover:bg-gray-100"
        >
            <th
                scope="row"
                className="px-3 py-1 font-medium text-gray-900 whitespace-nowrap"
            >
                <div className="flex items-center gap-3">
                    <i style={{ color: "#3b82f6" }} className={`fas fa-regular ${fileIcon} fa-2x me-2`}></i>
                    {file.name}
                </div>
            </th>
            <td className="p-1">
                <div className="flex items-center gap-1">
                    {formatUID(file.uid)}
                    <HiDocumentDuplicate />
                </div>
            </td>
            <td className="p-1">
                {formatBytes(file.size)}
            </td>
            <td className="p-1">
                <div className="flex items-center">
                    <PublicIcon /> Public
                </div>
            </td>
            <td className="p-1">
                {dayjs(file.UpdatedAt).fromNow()}
            </td>
            <td className="py-1 px-3 text-right">
                <button className="rounded-full hover:bg-gray-300 p-3" onClick={(e) => handleDropdownClick('file', index, e)}>
                    <HiDotsVertical />
                    {openDropdownIndex === `file-${index}` && (
                        <div id="dropdown" className="absolute right-0 z-10 mt-2 bg-white shadow-lg text-left">
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleDownload(file)}>Download</a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100">Share</a>
                            {
                                viewableExtensions.has(fileExtension) && (
                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleView(file)}>View</a>
                                )
                            }
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleDelete(file)}>Delete</a>
                        </div>
                    )}
                </button>
            </td>
        </tr>
    )
};


export default FileAdapter;

