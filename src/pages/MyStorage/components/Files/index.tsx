import React, { useRef, useState } from "react";
import { Folder, File as FileType } from "api";
import { useAppDispatch } from "state";
import useDropdown from "hooks/useDropdown";
import { closeDropdown, openDropdown } from "state/mystorage/actions";
import FileAdapter from "./FileAdapter";
import FolderAdapter from "./FolderAdapter";

interface FilesProps {
  files: FileType[];
  folders: Folder[];
}

const Files: React.FC<FilesProps> = ({ folders, files }) => {
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<string | null>(
    null
  );

  useDropdown(dropdownRef, openDropdownIndex !== null, () => {
    dispatch(closeDropdown());
    setOpenDropdownIndex(null);
  });

  const handleDropdownClick = (
    type: string,
    index: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    //event.stopPropagation(); //stop event bubbling
    dropdownRef.current = event.currentTarget as unknown as HTMLDivElement;
    const uniqueIndex = `${type}-${index}`;
    if (openDropdownIndex === uniqueIndex) {
      setOpenDropdownIndex(null);
      dispatch(closeDropdown());
    } else {
      setOpenDropdownIndex(uniqueIndex);
      dispatch(openDropdown(uniqueIndex));
    }
  };

  return (
    <tbody>
      {/* folders */}
      {folders.map((v, i) => (
        <FolderAdapter
          folder={v}
          index={i}
          key={i}
          openDropdownIndex={openDropdownIndex}
          handleDropdownClick={handleDropdownClick}
        />
      ))}
      {/* files */}
      {files.map((v, i) => (
        <FileAdapter
          file={v}
          index={i}
          key={i}
          openDropdownIndex={openDropdownIndex}
          handleDropdownClick={handleDropdownClick}
        />
      ))}
    </tbody>
  );
};

export default Files;
