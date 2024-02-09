import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Folder, File, Api } from "api";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";
import "./spinner.css";
import { useNavigate } from "react-router-dom";
import { RiFolderAddLine } from "react-icons/ri";
import { CreateFolderModal } from "components";
import { useModal } from "components/Modal";
import { useAppDispatch, useAppSelector } from "state";
import { removeFileAction } from "state/mystorage/actions";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Theme } from "state/user/reducer";
import ContentFolderItem from "./ContentFolderItem";

interface ContentProps {
  loading: boolean;
  folders: Folder[];
  files: File[];
  view: "list" | "grid";
  showHorizontalFolders: boolean;
  actionsAllowed: boolean;
  showFolders: boolean;
  filesTitle: string;
  identifier: number;
}

const Content: React.FC<ContentProps> = ({ loading, view, folders, files, showFolders, filesTitle, identifier, showHorizontalFolders, actionsAllowed }) => {
  type itemInfo = {
    type: string;
    id: string;
    uid: string;
  };
  const navigate = useNavigate();
  const cloneRef = useRef<HTMLDivElement | null>(null);
  const initialCoords = useRef({ x: 0, y: 0 });

  const [selectedItems, setSelectedItems] = React.useState<itemInfo[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [draggingOverFolderId, setDraggingOverFolderId] = useState<
    string | null
  >(null);
  const [onPresent] = useModal(<CreateFolderModal />);
  const onFolderDoubleClick = (folderUID: string) => {
    if(window.location.pathname.includes("/shared/folder")){
      navigate(`/space/shared/folder/${folderUID}`);
    }else{
      navigate(`/space/folder/${folderUID}`);
    }
  };

  const [seleccionMultipleActivada, setSeleccionMultipleActivada] = useState(false);

  const handleButtonClick = () => {
    // Turns multiple selection on or off when you click the button
    setSeleccionMultipleActivada((prev) => !prev);

    if (seleccionMultipleActivada) {
      setSelectedItems([]);
    }
  };

  const buttonText = seleccionMultipleActivada ? "CANCEL" : "SELECT";

  // Event for select item
  const handleOnClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const ctrlPressed = event.ctrlKey || event.metaKey;

    if (ctrlPressed) {
      setSeleccionMultipleActivada(true)
    }

    if (seleccionMultipleActivada || ctrlPressed) {
      event.preventDefault();

      const selInfo = {
        type: event.currentTarget.ariaValueText?.toString() || "",
        id: event.currentTarget.id.toString(),
        uid: event.currentTarget.ariaLabel?.toString() || "",
      };

      const isAlreadySelected = selectedItems.some(
        (item) => item.id === selInfo.id
      );

      if (isAlreadySelected) {
        event.currentTarget.classList.remove("selected");
      } else {
        event.currentTarget.classList.add("selected");
      }

      const updatedSelection = isAlreadySelected
        ? selectedItems.filter((item) => item.id !== selInfo.id)
        : [...selectedItems, selInfo];

      setSelectedItems(updatedSelection);
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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setSelectedItems([])
        setSeleccionMultipleActivada(false)
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>) => {
    const dragInfo = JSON.stringify({
      type: event.currentTarget.ariaValueText?.toString(),
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString(),
    });
    if (selectedItems.length === 0) {
      event.dataTransfer.setData("text/plain", dragInfo);
    } else {
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify(selectedItems)
      );
    }
    event.dataTransfer.setDragImage(new Image(), 0, 0);

    const thElement = event.currentTarget.firstElementChild;

    if (!thElement) {
      console.log("thElement is null");
      return;
    }

    const clone = thElement.cloneNode(true) as HTMLDivElement;
    const cloneButton = clone.getElementsByTagName("button")[0];
    cloneButton?.remove();
    const rect = thElement.getBoundingClientRect();

    clone.style.position = "fixed";
    clone.style.top = rect.top + "px";
    clone.style.left = rect.left + "px";
    clone.style.width = "auto";
    clone.style.padding = "5px 15px 5px 10px";
    clone.style.height = rect.height + "px";
    clone.style.zIndex = "100";
    clone.style.pointerEvents = "none";
    clone.style.opacity = "1.0";
    clone.style.backgroundColor = "AliceBlue";
    clone.style.borderRadius = "10px";
    clone.style.border = "2px solid LightSkyBlue";
    clone.style.boxSizing = "border-box";
    clone.style.display = "flex";
    clone.style.alignItems = "center";

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

  const handleDragEnd = () => {
    if (cloneRef.current) {
      document.body.removeChild(cloneRef.current);
      cloneRef.current = null;
    }
    setSelectedItems([]);
    setDraggingOverFolderId(null);
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

  const dispatch = useAppDispatch();

  const handleDropSingle = (
    event: React.DragEvent<HTMLTableRowElement>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    itemType: string
  ) => {
    Api.put(`/${itemType}/update/root`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("Folder root updated:", res.data);
        dispatch(removeFileAction(payload.Uid));
      })
      .catch((err) => {
        console.log("Error updating folder root:", err);
      });
  };

  function handleMultipleDelete() {
    toast.info("Deleting files...");
    setSelectedItems([])
    setSeleccionMultipleActivada(false)
    let deletedCount = 0;

    const handleDeleteSuccess = (fileUid: string) => {
      deletedCount++;
      if (deletedCount === selectedItems.length) {
        toast.success("All files deleted!");
      }
      dispatch(removeFileAction(fileUid));
    };

    for (const file of selectedItems) {
      // Make a request to delete each file with response code 200
      Api.delete(`/file/delete/${file.uid}`)
        .then(() => {
          handleDeleteSuccess(file.uid);
        })
        .catch((err) => {
          console.error("Error deleting file:", err);
          toast.error("Error deleting file");
        });
    }
  }


  const handleResize = () => {
    setWindowWidth(window.innerWidth);
    const headerScroll = document.getElementById("files-headers_" + identifier);
    const rowsScroll = document.getElementById("files-rows_" + identifier);
    const tablerowdiv = document.getElementById("table-row-div_" + identifier);
    const tableheaderdiv = document.getElementById("header-scroll-inv_" + identifier);
    if (headerScroll && rowsScroll && tablerowdiv) {
      headerScroll.style.width = rowsScroll.getBoundingClientRect().width + "px"
      tablerowdiv.style.width = rowsScroll.getBoundingClientRect().width + "px"
    }
    if (tablerowdiv && tableheaderdiv) {
      tablerowdiv.onscroll = function () {
        if (headerScroll)
          tableheaderdiv.scrollLeft = tablerowdiv.scrollLeft;
      };
    }
  };

  function handleFocusResize() {
    const rowsScroll = document.getElementById("files-rows_" + identifier);
    const headerScroll = document.getElementById("files-headers_" + identifier);
    const content = document.getElementById("content")
    if (rowsScroll && headerScroll && content) {
      const contentSize = content.getBoundingClientRect().width
      if (contentSize > 850) {
        rowsScroll.style.width = content.getBoundingClientRect().width + "px";
        headerScroll.style.width = content.getBoundingClientRect().width + "px";
      }
    }
  }

  useEffect(() => {
    handleFocusResize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowWidth])

  useEffect(() => {
    const invScroll = document.getElementById("scroll-invisible-section");
    const visScroll = document.getElementById("scroll-visible-section");
    const widthHelper = document.getElementById("width-section-helper");
    const size = folders.length * 240 + 240 + "px";
    if (widthHelper) widthHelper.style.width = size;
    if (invScroll && visScroll) {
      invScroll.onscroll = function () {
        if (invScroll && visScroll)
          visScroll.scrollLeft = invScroll.scrollLeft;
      };
      visScroll.onscroll = function () {
        if (invScroll && visScroll)
          invScroll.scrollLeft = visScroll.scrollLeft;
      };
    }
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders]);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { theme } = useAppSelector((state) => state.user);

  return (
    <>
      {showHorizontalFolders ?
        <>
          <div className="position-sticky-left">
            <h4 className="mb-[15px]">Folders</h4>
          </div>
          <div className="folders-div">
            {actionsAllowed && (
              <button
                className={"cursor-pointer px-5 py-3 border border-gray-200 min-w-[220px] rounded-lg relative overflow-visible flex items-center justify-center mr-5"
                  + (theme === Theme.DARK ? " text-white bg-[#32334b] hover:bg-[#4b4d70]" : " bg-gray-50 text-gray-700 hover:bg-gray-100")}
                onClick={onPresent}
              >
                <RiFolderAddLine className="w-6 h-6" />
              </button>
            )}

            {folders.map((v, i) => (
              <div
                key={i}
                id={v.id.toString()}
                aria-label={v.uid}
                aria-valuetext="folder"
                draggable
                className={`cursor-pointer min-w-[220px] rounded-lg ${draggingOverFolderId === v.id.toString()
                  ? "bg-blue-200 border border-blue-500"
                  : isItemSelected(v.id.toString())
                    ? "bg-[#79d79d93]"
                    : ""
                  } ${i < folders.length - 1 ? "mr-5" : ""}`}
                onDrag={handleDrag}
                onDragStart={handleDragStart}
                onDragEnd={actionsAllowed ? handleDragEnd : () => { }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={actionsAllowed ? handleDrop : () => { }}
                onDoubleClick={() => onFolderDoubleClick(v.uid)}
                onClick={handleOnClick}
              >
                <FolderItem folder={v} key={i} actionsAllowed={actionsAllowed} />
              </div>
            ))}
          </div>

          <section
            className="custom-scrollbar position-sticky-left mb-[15px]"
            id="scroll-visible-section"
          >
            <div id="width-section-helper"></div>
          </section>
        </>
        :
        <></>
      }

      <section className="custom-scrollbar position-sticky-left">
        <div className="sticky left-0 flex flex-row items-center justify-between mb-[15px]">
          <h4 className="pt-1 pb-3">{filesTitle}</h4>
          <div className="flex flex-row items-center justify-between">
            {actionsAllowed && (
              <>
                <button
                  className={"px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700"
                    + (theme === Theme.DARK ? " text-white bg-[#32334b] hover:bg-[#4b4d70]" : "text-gray-900 bg-white hover:bg-gray-100")}
                  onClick={handleButtonClick}>{buttonText}
                </button>

                {(selectedItems.length > 0) ? (
                  <span className={"py-2 ml-3 font-medium rounded-lg ml-3px-4 border border-gray-200 hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700"
                    + (theme === Theme.DARK ? " text-white bg-[#32334b] hover:bg-[#4b4d70]" : " text-gray-900 bg-white hover:bg-gray-200")}

                    title="Delete selected items"
                    onClick={handleMultipleDelete}
                  >
                    <FaRegTrashAlt className="mx-2 text-lg" />
                  </span>
                ) : (<></>)}
              </>
            )}


          </div>
        </div>

        {view === "list" ? (
          <>
            <div id={"header-scroll-inv_" + identifier}>
              <table id={"files-headers_" + identifier} className="w-full text-sm text-left text-gray-500 table-with-lines">
                <thead className={"text-xs "
                  + (theme === Theme.DARK ? " text-white bg-[#32334b]" : " text-gray-700 bg-gray-100")}>
                  <tr>
                    <th
                      id="column-name"
                      scope="col"
                      className="p-2.5 rounded-tl-lg rounded-bl-lg"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="p-1"
                      id="column-cid"
                    >
                      CID
                    </th>
                    <th
                      scope="col"
                      className="p-1"
                      id="column-size"
                    >
                      Size
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-1"
                      id="column-type"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="p-1 whitespace-nowrap"
                      id="column-lm"
                    >
                      Last Modified
                    </th>
                    <th
                      id="column-option"
                      scope="col"
                      className="rounded-tr-lg rounded-br-lg"
                    ></th>
                  </tr>
                </thead>
              </table>
            </div>
            <div id={"table-row-div_" + identifier} className="h-full min-w-full table-div custom-scrollbar scrollbar-color">
              <table id={"files-rows_" + identifier} className={"w-full text-sm text-left table-with-lines"
                + (theme === Theme.DARK ? " text-white" : " text-gray-500")}>
                <tbody>
                  {loading ? (
                    <tr className="w-full h-64">
                      <td colSpan={6}>
                        <div className="flex flex-col items-center justify-center w-full h-full text-center">
                          <div className="mb-4 text-xl font-semibold">
                            Decrypting
                          </div>
                          <svg
                            className="w-12 h-12 mb-4 animate-spin text-violet-500"
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
                      {((files && files.length > 0) || (showFolders && folders && folders.length > 0)) ?
                        <>
                          {showFolders &&
                            folders.map((v, i) => (
                              <tr
                                key={i}
                                id={v.id.toString()}
                                aria-label={v.uid}
                                aria-valuetext="folder"
                                className={`cursor-pointer ${draggingOverFolderId === v.id.toString()
                                  ? "bg-blue-300 border border-blue-500"
                                  : isItemSelected(v.id.toString())
                                    ? "bg-[#79d79d93]"
                                    : ""
                                  } ${i < folders.length - 1 ? "mr-5" : ""}`}
                                onDrag={handleDrag}
                                draggable
                                onDragStart={handleDragStart}
                                onDragEnd={actionsAllowed ? handleDragEnd : () => { }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={actionsAllowed ? handleDrop : () => { }}
                                onDoubleClick={() => onFolderDoubleClick(v.uid)}
                                onClick={handleOnClick}
                              >
                                <ContentFolderItem
                                  actionsAllowed={actionsAllowed}
                                  folder={v} key={i} view="list" />
                              </tr>
                            ))
                          }
                          {files?.map((v, i) => (
                            <tr
                              key={i}
                              id={v.id.toString()}
                              aria-label={v.uid}
                              aria-valuetext="file"
                              draggable
                              onDragStart={handleDragStart}
                              onDragEnd={actionsAllowed ? handleDragEnd : () => { }}
                              onDrag={handleDrag}
                              className={` cursor-pointer ${isItemSelected(
                                v.id.toString()
                              )
                                ? " bg-[#79d79d93]"
                                : (theme === Theme.DARK ? " dark-theme5" : " hover:bg-gray-100 bg-white")}
                              }`}
                              onClick={handleOnClick}
                            >
                              <FileItem
                                actionsAllowed={actionsAllowed}
                                file={v}
                                key={i}
                                view="list"
                              />
                            </tr>
                          ))}
                        </>
                        :
                        <>
                          <tr
                          >
                            <td
                              scope="row"
                              className={"w-full px-3 font-medium  whitespace-nowrap"
                                + (theme === Theme.DARK ? " text-white " : " text-gray-900")}>
                              <div className="flex flex-col items-start justify-center w-full h-full text-center lg:items-center">
                                <div className="mt-4 mb-4">
                                  No files found
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      }

                    </>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) :

          <div className="table-div">
            {((files && files.length > 0) || (showFolders && folders && folders.length > 0)) ?
              <section className="grid gap-3 grid-200">
                {showFolders &&
                  <>
                    {folders.map((v, i) => (
                      <div
                        key={i}
                        id={v.id.toString()}
                        aria-label={v.uid}
                        aria-valuetext="folder"
                        className={`p-4 border mb-3 border-gray-200 rounded-lg cursor-pointer ${draggingOverFolderId === v.id.toString()
                          ? "bg-blue-200 border border-blue-500"
                          : isItemSelected(v.id.toString())
                            ? "bg-[#79d79d93]"
                            : ""
                          } ${i < folders.length - 1 ? "mr-5" : ""}`}
                        onDrag={handleDrag}
                        draggable
                        onDragStart={handleDragStart}
                        onDragEnd={actionsAllowed ? handleDragEnd : () => { }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={actionsAllowed ? handleDrop : () => { }}
                        onDoubleClick={() => onFolderDoubleClick(v.uid)}
                        onClick={handleOnClick}
                      >
                        <ContentFolderItem folder={v}
                          actionsAllowed={actionsAllowed}
                          key={i} view="grid" />
                      </div>
                    ))}
                  </>
                }
                {files?.map((v, i) => (
                  <div
                    key={i}
                    id={v.id.toString()}
                    aria-label={v.uid}
                    aria-valuetext="file"
                    onClick={handleOnClick}
                    className={`p-4 border mb-3 border-gray-200 rounded-lg cursor-pointer ${isItemSelected(
                      v.id.toString()
                    )
                      ? " bg-[#79d79d93]"
                      : (theme === Theme.DARK ? " dark-theme4" : " hover:bg-gray-200 bg-white")}
                }`}
                  >
                    <FileItem file={v} key={i}
                      view="grid"
                      actionsAllowed={actionsAllowed}
                      />
                  </div>
                ))}
              </section>
              :
              <section
              >
                <span
                  className={"w-full px-3 font-medium  whitespace-nowrap"
                    + (theme === Theme.DARK ? " text-white " : " text-gray-900")}>
                  <div className="flex flex-col items-start justify-center w-full h-full text-center lg:items-center">
                    <div className="mt-4 mb-4">
                      No files found
                    </div>
                  </div>
                </span>
              </section>}
          </div>
        }
      </section>
    </>
  );
};

export default Content;