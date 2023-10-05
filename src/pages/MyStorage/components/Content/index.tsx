import React, { Fragment, useRef, useState } from "react";
import { Folder, File, Api } from "api";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";
import "./spinner.css";
import { useNavigate } from "react-router-dom";
import { useFetchData } from "hooks";
import { string } from "prop-types";

interface ContentProps {
  loading: boolean;
  folders: Folder[];
  files?: File[];
  view: "list" | "grid";
}

const Content: React.FC<ContentProps> = ({ loading, view, folders, files }) => {
  type itemInfo = {
    type: string;
    id: string;
    uid: string;
  };
  const navigate = useNavigate();
  const { fetchRootContent } = useFetchData();
  const cloneRef = useRef<HTMLDivElement | null>(null);
  const initialCoords = useRef({ x: 0, y: 0 });

  const [selectedItems, setSelectedItems] = React.useState<itemInfo[]>([]);
  const [draggingOverFolderId, setDraggingOverFolderId] = useState<
    string | null
  >(null);

  const onFolderDoubleClick = (folderUID: string) => {
    navigate(`/space/folder/${folderUID}`);
  };

  // Event for select item
  const handleOnClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!event.ctrlKey) {
      return;
    }
    const selInfo = {
      type: event.currentTarget.ariaValueText?.toString() || "",
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString() || "",
    };
    let isAlreadySelected = selectedItems.some(
      (item) => item.id === selInfo.id
    );
    if (isAlreadySelected) {
      event.currentTarget.classList.remove("selected");
    } else {
      event.currentTarget.classList.add("selected");
    }
    if (isAlreadySelected) {
      // Remove the item from the array
      setSelectedItems(selectedItems.filter((item) => item.id !== selInfo.id));
    } else {
      // Add the item to the array
      setSelectedItems([...selectedItems, selInfo]);
    }
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
  const isItemSelected = (id: string): boolean => {
    return selectedItems.some((item) => item.id === id);
  };

  /* Drag and Drop */
  // on the Draggable Element
  const handleDrag = (event: React.DragEvent<HTMLTableRowElement>) => {
    if (cloneRef.current) {
      const dx = event.clientX - initialCoords.current.x;
      const dy = event.clientY - initialCoords.current.y;

      cloneRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>) => {
    const dragInfo = JSON.stringify({
      type: event.currentTarget.ariaValueText?.toString(),
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString(),
    });
    // Añadir condicion que detecte si esta arrastrando un elemento que no esta seleccionado
    if (selectedItems.length === 0) {
      event.dataTransfer.setData("text/plain", dragInfo);
    } else {
      event.dataTransfer.setData("text/plain", JSON.stringify(selectedItems));
    }
    event.dataTransfer.setDragImage(new Image(), 0, 0);

    const thElement = event.currentTarget.getElementsByTagName("th")[0];
    const clone = thElement.cloneNode(true) as HTMLDivElement;
    const rect = thElement.getBoundingClientRect();

    clone.style.position = "fixed";
    clone.style.top = rect.top + "px";
    clone.style.left = rect.left + "px";
    clone.style.width = "auto";
    clone.style.padding = "5px 10px";
    clone.style.padding = "5px 15px 5px 10px";
    clone.style.height = rect.height + "px";
    clone.style.zIndex = "100";
    clone.style.pointerEvents = "none";
    clone.style.opacity = "1.0";
    clone.style.backgroundColor = "AliceBlue";
    clone.style.borderRadius = "10px";
    clone.style.border = "2px solid LightSkyBlue";
    clone.style.boxSizing = "border-box";

    if (selectedItems.length > 1) {
      const counter = document.createElement("span");
      counter.innerText = `${selectedItems.length}`;
      counter.style.position = "absolute";
      counter.style.top = "0";
      counter.style.right = "0";
      counter.style.background = "LightSkyBlue";
      counter.style.color = "white";
      counter.style.borderRadius = "50%";
      counter.style.padding = "4px 8px";
      counter.style.fontSize = "14px";
      counter.style.lineHeight = "1";
      counter.style.transform = "translate(50%, -50%)";
      clone.appendChild(counter);
    }

    document.body.appendChild(clone);

    cloneRef.current = clone;
    initialCoords.current = { x: event.clientX, y: event.clientY };
  };

  const handleDragEnd = (event: React.DragEvent<HTMLTableRowElement>) => {
    if (cloneRef.current) {
      document.body.removeChild(cloneRef.current);
      cloneRef.current = null;
    }
    setSelectedItems([]);
    setDraggingOverFolderId(null); // <-- Añade esta línea
  };

  // On the Drop Target
  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
    const folderId = event.currentTarget.id.toString();

    if (selectedItems.some((item) => item.id === folderId)) {
      // console.log("Drop target is one of the selected items");
      return;
    }

    if (
      event.currentTarget === event.target ||
      event.currentTarget.contains(event.target as Node)
    ) {
      setDraggingOverFolderId(folderId);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDraggingOverFolderId(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
    // setDragEnterCount((prev) => prev - 1);

    const dragInfoReceived = JSON.parse(
      event.dataTransfer.getData("text/plain")
    );
    const dropInfo = {
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString(),
      type: "folder",
    };

    // Check if selectedItems is empty
    if (selectedItems.length === 0) {
      if (dropInfo.id == dragInfoReceived.id) {
        // Comprobar tambien en selectedItems
        // console.log("Same folder");
        return;
      }
      // If empty, handle drop as normal
      const payload = {
        Id: dragInfoReceived.id,
        Uid: dragInfoReceived.uid,
        Root: dropInfo.uid,
      };
      handleDropSingle(event, payload, dragInfoReceived.type);
    } else {
      // If not empty, handle drop as batch

      // Check if the drop target is one of the selected items
      if (selectedItems.some((item) => item.id === dropInfo.id)) {
        // console.log("Drop target is one of the selected items");
        return;
      }

      selectedItems.forEach((item) => {
        const payload = {
          Id: item.id,
          Uid: item.uid,
          Root: dropInfo.uid,
        };
        handleDropSingle(event, payload, item.type);
      });
    }
  };

  const handleDropSingle = (
    event: React.DragEvent<HTMLTableRowElement>,
    payload: any,
    itemType: string
  ) => {
    // console.log("DragReceived: " + JSON.stringify(dragInfoReceived));
    // console.log("Drop: " + JSON.stringify(dropInfo));

    console.log("Sending payload:", payload);
    Api.put(`/${itemType}/update/root`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("Folder root updated:", res.data);
        fetchRootContent();
      })
      .catch((err) => {
        console.log("Error updating folder root:", err);
      });
  };

  if (view === "list")
    return (
      <div className="flex flex-col flex-1 overflow-visible">
        <div className="w-full custom-scrollbar">
          <div className="flex overflow-x-auto whitespace-nowrap mb-6 mt-3">
            {folders.map((v, i) => (
              <div
                key={i}
                id={v.id.toString()}
                aria-label={v.uid}
                aria-valuetext="folder"
                draggable
                className={`cursor-pointer min-w-[220px] z-50 ${
                  draggingOverFolderId === v.id.toString()
                    ? "bg-blue-200 border border-blue-500"
                    : isItemSelected(v.id.toString())
                    ? "bg-sky-100"
                    : ""
                } ${i < folders.length - 1 ? "mr-5" : ""}`}
                onDrag={handleDrag}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDoubleClick={() => onFolderDoubleClick(v.uid)}
                onClick={handleOnClick}
              >
                <FolderItem folder={v} key={i} view="list" />
              </div>
            ))}
          </div>
          <table className="w-full text-sm text-left text-gray-500 table-with-lines">
            <thead className="text-xs text-gray-700 bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="p-2.5 rounded-tl-lg rounded-bl-lg"
                  onClick={(event: React.MouseEvent<HTMLTableCellElement>) => {
                    if (event.ctrlKey) {
                      setSelectedItems([]);
                      console.log("Deleted selected items");
                    } else {
                      console.log(selectedItems);
                    }
                  }}
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
                      <div className="text-xl font-semibold mb-4">
                        Decrypting
                      </div>
                      {/* SVG Spinner */}
                      <svg
                        className="animate-spin h-12 w-12 text-violet-500 mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {files?.map((v, i) => (
                    <tr
                      key={i}
                      id={v.id.toString()}
                      aria-label={v.uid}
                      aria-valuetext="file"
                      draggable
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDrag={handleDrag}
                      className={` cursor-pointer ${
                        isItemSelected(v.id.toString())
                          ? "bg-sky-100"
                          : "hover:bg-gray-100 bg-white"
                      }`}
                      // onDoubleClick={handleView}
                      onClick={handleOnClick}
                    >
                      <FileItem file={v} key={i} view="list" />
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  else
    return (
      <Fragment>
        <div className="flex overflow-x-auto whitespace-nowrap gap-3 mb-5 mt-3 overflow-visible">
          {folders.map((v, i) => (
            <div
              className={`cursor-pointer min-w-[220px] ${
                i < folders.length - 1 ? "mr-2" : ""
              }`}
              onDoubleClick={() => onFolderDoubleClick(v.uid)}
            >
              <FolderItem folder={v} key={i} view="grid" />
            </div>
          ))}
        </div>

        <h3 className="my-3">Files</h3>
        <div className="grid grid-200 gap-3">
          {files?.map((v, i) => (
            <FileItem file={v} key={i} view="grid" />
          ))}
        </div>
      </Fragment>
    );
};

export default Content;
