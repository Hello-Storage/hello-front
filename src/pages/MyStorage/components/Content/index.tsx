import React, { Fragment } from "react";
import { Folder, File } from "api";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";

interface ContentProps {
  folders: Folder[];
  files: File[];
  view: "list" | "grid";
}

const Content: React.FC<ContentProps> = ({ view, folders, files }) => {
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
              {folders.map((v, i) => (
                <FolderItem
                  folder={v}
                  key={i}
                  view="list"
                  onButtonClick={handleChildButtonClick}
                />
              ))}
              {files.map((v, i) => (
                <FileItem
                  file={v}
                  key={i}
                  view="list"
                  onButtonClick={handleChildButtonClick}
                />
              ))}
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
