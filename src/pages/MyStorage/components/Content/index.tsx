import React, { Fragment } from "react";
import { Folder, File } from "api";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";
import "./spinner.css"

interface ContentProps {
  loading: boolean;
  folders: Folder[];
  files: File[];
  view: "list" | "grid";
}

const Content: React.FC<ContentProps> = ({ loading, view, folders, files }) => {
  type itemInfo = {
    type: string;
    id: string;
    uid: string;
  };
  // Create a useState hook to store array of selected items
  const [selectedItems, setSelectedItems] = React.useState<itemInfo[]>([]);
  const handleChildButtonClick = (data: string) => {
    const selInfo = JSON.parse(data);
    // console.log(selInfo);
    // Check if the item is already selected
    if (selectedItems.some((item) => item.id === selInfo.id)) {
      // Remove the item from the array
      console.log("Removing item");
      setSelectedItems(selectedItems.filter((item) => item.id !== selInfo.id));
    } else {
      // Add the item to the array
      console.log("Adding item");
      setSelectedItems([...selectedItems, selInfo]);
    }
  };
  if (view === "list")
    return (
      <div className="flex flex-col flex-1 max-h-screen">
        <div className="overflow-auto md:overflow-visible max-h-[calc(100vh-6rem)] custom-scrollbar">
          <table className="w-full text-sm text-left text-gray-500 table-with-lines">
            <thead className="text-xs text-gray-700 bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="p-3 rounded-tl-lg rounded-bl-lg"
                  onClick={() => console.log(selectedItems)}
                >
                  Name
                </th>
                <th scope="col" className="p-1">
                  CID
                </th>
                <th scope="col" className="p-1">
                  Size
                </th>
                <th scope="col" className="py-1 px-3">
                  Type
                </th>
                <th scope="col" className="p-1 whitespace-nowrap">
                  Last Modified
                </th>
                <th scope="col" className="rounded-tr-lg rounded-br-lg"></th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr className="w-full h-64">
                  <td colSpan={6}>
                    <div className="flex flex-col w-full h-full items-center justify-center text-center">

                      <div className="text-xl font-semibold mb-4">Decrypting</div>
                      {/* SVG Spinner */}
                      <svg className="animate-spin h-12 w-12 text-violet-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>

                  </td>
                </tr>
              ) :
                <>
                  {
                    folders.map((v, i) => (
                      <FolderItem
                        folder={v}
                        key={i}
                        view="list"
                        onButtonClick={handleChildButtonClick}
                      />
                    ))
                  }
                  {
                    files.map((v, i) => (
                      <FileItem
                        file={v}
                        key={i}
                        view="list"
                        onButtonClick={handleChildButtonClick}
                      />
                    ))
                  }
                </>
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  else
    return (
      <Fragment>
        <h3 className="mb-3">Folders</h3>
        <div className="grid grid-200 gap-3">
          {folders.map((v, i) => (
            <FolderItem
              folder={v}
              key={i}
              view="grid"
              onButtonClick={handleChildButtonClick}
            />
          ))}
        </div>

        <h3 className="my-3">Files</h3>
        <div className="grid grid-200 gap-3">
          {files.map((v, i) => (
            <FileItem
              file={v}
              key={i}
              view="grid"
              onButtonClick={handleChildButtonClick}
            />
          ))}
        </div>
      </Fragment>
    );
};

export default Content;
