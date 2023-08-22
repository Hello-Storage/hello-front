import React from "react";
import { Folder, File as FileType } from "api";
import FileAdapter from "./FileAdapter";
import FolderAdapter from "./FolderAdapter";

interface FilesProps {
  files: FileType[];
  folders: Folder[];
}

const Files: React.FC<FilesProps> = ({ folders, files }) => {
  return (
    <tbody>
      {/* folders */}
      {folders.map((v, i) => (
        <FolderAdapter folder={v} key={i} />
      ))}
      {/* files */}
      {files.map((v, i) => (
        <FileAdapter file={v} key={i} />
      ))}
    </tbody>
  );
};

export default Files;
