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
  if (view === "list")
    return (
      <div className="flex flex-col flex-1 max-h-screen">
        <div className="overflow-auto md:overflow-visible max-h-[calc(100vh-6rem)] custom-scrollbar">
          <table className="w-full text-sm text-left text-gray-500 table-with-lines">
            <thead className="text-xs text-gray-700 bg-gray-100">
              <tr>
                <th scope="col" className="p-3 rounded-tl-lg rounded-bl-lg">
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
                <FolderItem folder={v} key={i} view="list" />
              ))}
              {files.map((v, i) => (
                <FileItem
                  file={v}
                  index={i}
                  files={files}
                  key={i}
                  view="list"
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
            <FolderItem folder={v} key={i} view="grid" />
          ))}
        </div>

        <h3 className="my-3">Files</h3>
        <div className="grid grid-200 gap-3">
          {files.map((v, i) => (
            <FileItem file={v} index={i} files={files} key={i} view="grid" />
          ))}
        </div>
      </Fragment>
    );
};

export default Content;
