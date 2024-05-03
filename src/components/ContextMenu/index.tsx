import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  HiDocumentDownload,
  HiFolderAdd,
  HiFolderDownload,
} from "react-icons/hi";

interface ContextMenuProps {
  targetId: string;
}
export default function ContextMenu({ targetId }: Readonly<ContextMenuProps>) {
  const [contextData, setContextData] = useState({
    visible: false,
    posX: 0,
    posY: 0,
  });
  const contextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contextMenuEventHandler = (event: any) => {
      const targetElement = document.getElementById(targetId);
      if (targetElement?.contains(event.target)) {
        event.preventDefault();

        setContextData({
          visible: true,
          posX: event.clientX,
          posY: event.clientY,
        });
      } else if (
        contextRef.current &&
        !contextRef.current.contains(event.target)
      ) {
        setContextData({ ...contextData, visible: false });
      }
    };

    const offClickHandler = (event: any) => {
      if (contextRef.current && !contextRef.current.contains(event.target)) {
        setContextData({ ...contextData, visible: false });
      }
    };

    document.addEventListener("contextmenu", contextMenuEventHandler);
    document.addEventListener("click", offClickHandler);
    return () => {
      document.removeEventListener("contextmenu", contextMenuEventHandler);
      document.removeEventListener("click", offClickHandler);
    };
  }, [contextData, targetId]);

  useLayoutEffect(() => {
    if (!contextRef || !contextRef.current) return;

    if (contextData.posX + contextRef.current.offsetWidth > window.innerWidth) {
      setContextData({
        ...contextData,
        posX: contextData.posX - contextRef.current.offsetWidth,
      });
    }
    if (
      contextData.posY + contextRef.current.offsetHeight >
      window.innerHeight
    ) {
      setContextData({
        ...contextData,
        posY: contextData.posY - contextRef.current.offsetHeight,
      });
    }
  }, [contextData]);

  return (
    <div
      ref={contextRef}
      className="absolute bg-white min-w-[180px] shadow divide-y border text-gray-600"
      style={{
        display: `${contextData.visible ? "block" : "none"}`,
        left: contextData.posX,
        top: contextData.posY,
      }}
    >
      <div className="py-2">
        <button className="block cursor-pointer px-4 py-2 hover:bg-gray-100 ">
          <HiFolderAdd className="inline-flex mr-3" />
          New Folder
        </button>
      </div>
      <ul className="py-2">
        <li>
          <div
            className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
            // onClick={handleFileUpload}
          >
            <HiDocumentDownload className="inline-flex mr-3" />
            Upload files
          </div>
        </li>
        <li>
          <div
            className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
            // onClick={handleFolderUpload}
          >
            <HiFolderDownload className="inline-flex mr-3" />
            Folder Upload
          </div>
        </li>
      </ul>
    </div>
  );
}
