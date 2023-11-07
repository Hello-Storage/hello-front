import {
  getFileIcon,
  viewableExtensions,
} from "pages/MyStorage/components/Content/utils";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublishedFile } from "./Utils/shareUtils";
import { AxiosError, AxiosProgressEvent, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { formatBytes } from "utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Api } from "api";
import { useDispatch } from "react-redux";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import {
  blobToArrayBuffer,
  decryptFileBuffer,
} from "utils/encryption/filesCipher";
import { PreviewImage, setImageViewAction } from "state/mystorage/actions";
import UploadProgress from "pages/MyStorage/components/UploadProgress";
import "lightbox.js-react/dist/index.css";
import { SlideshowLightbox } from "lightbox.js-react";
import { useAppSelector } from "state";
dayjs.extend(relativeTime);

const Shared = (props: { shareType: string }) => {
  //get the hash from the url
  const { hash } = useParams();
  const shareType = props.shareType;

  const [metadata, setMetadata] = useState<PublicFile>();

  const dispatch = useDispatch();

  const { uploading } = useAppSelector((state) => state.uploadstatus);

  const viewRef = useRef(false);

  const onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
    dispatch(
      setUploadStatusAction({
        info:
          `${viewRef.current ? "Loading" : "Downloading"} ` + metadata?.name,
        uploading: true,
      })
    );

    dispatch(
      setUploadStatusAction({
        read: progressEvent.loaded,
        size: metadata?.size,
      })
    );
  };

  useEffect(() => {
    //get file metadata from the hash
    switch (shareType) {
      case "public":
        //get file metadata from the hash
        if (hash && hash.length > 0)
          getPublishedFile(hash)
            .then((res) => {
              if ((res as AxiosResponse).status === 200) {
                res = res as AxiosResponse;
                const publishedFile = res.data as PublicFile;
                setMetadata(publishedFile);
              }

              if ((res as AxiosError).isAxiosError) {
                toast.error(
                  "An error occured while fetching the file metadata"
                );
                if (
                  (res as AxiosError).response?.status === 404 ||
                  (res as AxiosError).response?.status === 503
                ) {
                  return;
                }
              }
            })
            .catch((err) => {
              toast.error("An error occured while fetching the file metadata");
              console.log(err);
            });

        break;
      case "private":
        //get file metadata from the hash
        if (hash && hash.length > 0) alert("private");
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileExtension = (metadata?.name.split(".").pop() || "").toLowerCase();

  const { showPreview, preview } = useAppSelector((state) => state.mystorage);

  const viewable = viewableExtensions.has(fileExtension); // check if the file is viewable

  const downloadHandler = () => {
    switch (shareType) {
      case "public":
        //get file metadata from the hash
        if (hash && hash.length > 0) downloadFile(metadata, "public");
        break;
      case "private":
        //get file metadata from the hash
        if (hash && hash.length > 0) return () => alert("private");
        break;
      default:
        return () => {
          ("");
        };
    }
  };

  // Function to handle file download
  const downloadFile = (
    metadata: PublicFile | undefined,
    shareType: string
  ) => {
    viewRef.current = false;
    toast.info("Starting download for " + metadata?.name + "...");
    // Make a request to download the file with responseType 'blob'
    Api.get(`/file/download/${metadata?.file_uid}`, {
      responseType: "blob",
      onDownloadProgress: onDownloadProgress,
    })
      .then(async (res) => {
        dispatch(
          setUploadStatusAction({
            info: "Finished downloading data",
            uploading: false,
          })
        );
        // Create a blob from the response data
        let binaryData = res.data;
        if (metadata?.cid_original_decrypted) {
          const originalCid = metadata?.cid_original_decrypted;
          binaryData = await blobToArrayBuffer(binaryData);
          binaryData = await decryptFileBuffer(
            binaryData,
            originalCid,
            (percentage) => {
              dispatch(
                setUploadStatusAction({
                  info: "Decrypting...",
                  read: percentage,
                  size: 100,
                  uploading: true,
                })
              );
            }
          ).catch((err) => {
            console.error("Error downloading file:", err);
          });

          dispatch(
            setUploadStatusAction({
              info: "Decryption done",
              uploading: false,
            })
          );
        } else {
          binaryData = await blobToArrayBuffer(binaryData);
        }
        const blob = new Blob([binaryData], { type: metadata?.mime_type });

        // Create a link element and set the blob as its href
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = metadata?.name ? metadata?.name : ""; // Set the file name
        a.click(); // Trigger the download
        toast.success("Download complete!");

        // Clean up
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Error downloading file:", err);
      });
  };

  const handleView = (metadata: PublicFile | undefined, shareType: string) => {
    viewRef.current = true;

    Api.get(`/file/download/${metadata?.file_uid}`, {
      responseType: "blob",
      onDownloadProgress: onDownloadProgress,
    })
      .then(async (res) => {
        dispatch(
          setUploadStatusAction({
            info: "Finished downloading data",
            uploading: false,
          })
        );
        let binaryData = res.data;
        if (metadata?.cid_original_decrypted) {
          const originalCid = metadata?.cid_original_decrypted;
          binaryData = await blobToArrayBuffer(binaryData);
          binaryData = await decryptFileBuffer(
            binaryData,
            originalCid,
            (percentage) => {
              dispatch(
                setUploadStatusAction({
                  info: "Decrypting...",
                  read: percentage,
                  size: 100,
                  uploading: true,
                })
              );
            }
          );

          dispatch(
            setUploadStatusAction({
              info: "Decryption done",
              uploading: false,
            })
          );
        } else {
          binaryData = await blobToArrayBuffer(binaryData);
        }
        const blob = new Blob([binaryData], { type: metadata?.mime_type });
        if (!blob) {
          console.error("Error downloading file: blob is null");
          return;
        }
        const url = window.URL.createObjectURL(blob);

        let mediaItem: PreviewImage;
        if (metadata?.mime_type.startsWith("video/")) {
          mediaItem = {
            type: "htmlVideo",
            videoSrc: url,
            alt: metadata?.name,
          };
        } else if (
          metadata?.mime_type === "application/pdf" ||
          metadata?.mime_type === "text/plain"
        ) {
          window.open(url, "_blank"); // PDF or TXT in a new tab
          return;
        } else {
          mediaItem = {
            src: url,
            alt: metadata?.name ? metadata?.name : "",
          };
        }

        dispatch(setImageViewAction({ img: mediaItem, show: true }));
      })
      .catch((err) => {
        console.error("Error downloading file:", err);
      });
  };

  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useLayoutEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      const headerScroll1 = document.getElementById("files-headers-1");
      const rowsScroll1 = document.getElementById("files-rows-1");
      const tablerowdiv1 = document.getElementById("table-row-div-1");
      const tableheaderdiv1 = document.getElementById("header-scroll-inv-1");

      const headerScroll2 = document.getElementById("files-headers-2");
      const rowsScroll2 = document.getElementById("files-rows-2");
      const tablerowdiv2 = document.getElementById("table-row-div-2");
      const tableheaderdiv2 = document.getElementById("header-scroll-inv-2");

      const headerScroll3 = document.getElementById("files-headers-3");
      const rowsScroll3 = document.getElementById("files-rows-3");
      const tablerowdiv3 = document.getElementById("table-row-div-3");
      const tableheaderdiv3 = document.getElementById("header-scroll-inv-3");

      const headerScroll4 = document.getElementById("files-headers-4");
      const rowsScroll4 = document.getElementById("files-rows-4");
      const tablerowdiv4 = document.getElementById("table-row-div-4");
      const tableheaderdiv4 = document.getElementById("header-scroll-inv-4");

      if (headerScroll1 && rowsScroll1 && headerScroll2 && rowsScroll2 && headerScroll3 && rowsScroll3 && headerScroll4 && rowsScroll4) {
        headerScroll1.style.width = rowsScroll1.getBoundingClientRect().width + "px"
        headerScroll2.style.width = rowsScroll2.getBoundingClientRect().width + "px"
        headerScroll3.style.width = rowsScroll3.getBoundingClientRect().width + "px"
        headerScroll4.style.width = rowsScroll4.getBoundingClientRect().width + "px"
      }
      if (tablerowdiv1 && tableheaderdiv1) {
        tablerowdiv1.onscroll = function () {
          if (headerScroll1)
            tableheaderdiv1.scrollLeft = tablerowdiv1.scrollLeft;
        };
      }
      if (tablerowdiv2 && tableheaderdiv2) {
        tablerowdiv2.onscroll = function () {
          if (headerScroll1)
            tableheaderdiv2.scrollLeft = tablerowdiv2.scrollLeft;
        };
      }
      if (tablerowdiv3 && tableheaderdiv3) {
        tablerowdiv3.onscroll = function () {
          if (headerScroll3)
            tableheaderdiv3.scrollLeft = tablerowdiv3.scrollLeft;
        };
      }
      if (tablerowdiv4 && tableheaderdiv4) {
        tablerowdiv4.onscroll = function () {
          if (headerScroll4)
            tableheaderdiv4.scrollLeft = tablerowdiv4.scrollLeft;
        };
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="lg:hidden md:block">
        <section
          className="custom-scrollbar position-sticky-left mb-[15px]"
          id="scroll-visible-section"
        >
          <div id="width-section-helper"></div>
        </section>
        <section className="custom-scrollbar position-sticky-left">
          <h4 className="bg-gray-200 rounded py-2 my-3 mx-auto px-4 w-max">
            Shared with Me
          </h4>
          <div id="header-scroll-inv-1">
            <table
              id="files-headers-1"
              className="w-full text-sm text-left text-gray-500 table-with-lines"
            >
              <thead className="text-xs text-gray-700 bg-gray-100">
                <tr>
                  <th
                    id="column-name"
                    scope="col"
                    className="p-2.5 rounded-tl-lg rounded-bl-lg"
                    onClick={(
                      event: React.MouseEvent<HTMLTableCellElement>
                    ) => {
                      if (event.ctrlKey) {
                        console.log("Deleted selected items");
                      } else {
                      }
                    }}
                  >
                    Name
                  </th>
                  <th scope="col" className="p-1" id="column-cid">
                    CID
                  </th>
                  <th scope="col" className="p-1" id="column-size">
                    Size
                  </th>
                  <th scope="col" className="py-1 px-3" id="column-type">
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

          <div
            id="table-row-div-1"
            className="table-div custom-scrollbar h-full scrollbar-color"
          >
            <table
              id="files-rows-1"
              className="w-full text-sm text-left text-gray-500 table-with-lines"
            >
              <tbody></tbody>
            </table>
          </div>
        </section>
        <section
          className="custom-scrollbar position-sticky-left mb-[15px]"
          id="scroll-visible-section"
        >
          <div id="width-section-helper"></div>
        </section>
        <section className="custom-scrollbar position-sticky-left">
          <h4 className="bg-gray-200 rounded py-2 my-3 mx-auto px-4 w-max">
            Shared with Others
          </h4>
          <div id="header-scroll-inv-2">
            <table
              id="files-headers-2"
              className="w-full text-sm text-left text-gray-500 table-with-lines"
            >
              <thead className="text-xs text-gray-700 bg-gray-100">
                <tr>
                  <th
                    id="column-name"
                    scope="col"
                    className="p-2.5 rounded-tl-lg rounded-bl-lg"
                    onClick={(
                      event: React.MouseEvent<HTMLTableCellElement>
                    ) => {
                      if (event.ctrlKey) {
                        console.log("Deleted selected items");
                      } else {
                      }
                    }}
                  >
                    Name
                  </th>
                  <th scope="col" className="p-1" id="column-cid">
                    CID
                  </th>
                  <th scope="col" className="p-1" id="column-size">
                    Size
                  </th>
                  <th scope="col" className="py-1 px-3" id="column-type">
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

          <div
            id="table-row-div-2"
            className="table-div custom-scrollbar h-full scrollbar-color"
          >
            <table
              id="files-rows-2"
              className="w-full text-sm text-left text-gray-500 table-with-lines"
            >
              <tbody></tbody>
            </table>
          </div>
        </section>
      </div>
      <div className="min100:hidden lg:flex  w-fullflex-row justify-evenly items-center">
        <div className="w-full">
          <section
            className="custom-scrollbar position-sticky-left mb-[15px]"
            id="scroll-visible-section"
          >
            <div id="width-section-helper"></div>
          </section>
          <section className="custom-scrollbar position-sticky-left">
            <h4 className="bg-gray-200 rounded py-2 my-3 mx-auto px-4 w-max">
              Shared with Me
            </h4>
            <div id="header-scroll-inv-3">
              <table
                id="files-headers-3"
                className="w-full text-sm text-left text-gray-500 table-with-lines"
              >
                <thead className="text-xs text-gray-700 bg-gray-100">
                  <tr>
                    <th
                      id="column-name"
                      scope="col"
                      className="p-2.5 rounded-tl-lg rounded-bl-lg"
                      onClick={(
                        event: React.MouseEvent<HTMLTableCellElement>
                      ) => {
                        if (event.ctrlKey) {
                          console.log("Deleted selected items");
                        } else {
                        }
                      }}
                    >
                      Name
                    </th>
                    <th scope="col" className="p-1" id="column-cid">
                      CID
                    </th>
                    <th scope="col" className="p-1" id="column-size">
                      Size
                    </th>
                    <th scope="col" className="py-1 px-3" id="column-type">
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

            <div
              id="table-row-div-3"
              className="table-div custom-scrollbar h-full scrollbar-color"
            >
              <table
                id="files-rows-3"
                className="w-full text-sm text-left text-gray-500 table-with-lines"
              >
                <tbody></tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="w-full">
          <section
            className="custom-scrollbar position-sticky-left mb-[15px]"
            id="scroll-visible-section"
          >
            <div id="width-section-helper"></div>
          </section>
          <section className="custom-scrollbar position-sticky-left">
            <h4 className="bg-gray-200 rounded py-2 my-3 mx-auto px-4 w-max">
              Shared with Others
            </h4>
            <div id="header-scroll-inv-4">
              <table
                id="files-headers-4"
                className="w-full text-sm text-left text-gray-500 table-with-lines"
              >
                <thead className="text-xs text-gray-700 bg-gray-100">
                  <tr>
                    <th
                      id="column-name"
                      scope="col"
                      className="p-2.5 rounded-tl-lg rounded-bl-lg"
                      onClick={(
                        event: React.MouseEvent<HTMLTableCellElement>
                      ) => {
                        if (event.ctrlKey) {
                          console.log("Deleted selected items");
                        } else {
                        }
                      }}
                    >
                      Name
                    </th>
                    <th scope="col" className="p-1" id="column-cid">
                      CID
                    </th>
                    <th scope="col" className="p-1" id="column-size">
                      Size
                    </th>
                    <th scope="col" className="py-1 px-3" id="column-type">
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

            <div
              id="table-row-div-4"
              className="table-div custom-scrollbar h-full scrollbar-color"
            >
              <table
                id="files-rows-4"
                className="w-full text-sm text-left text-gray-500 table-with-lines"
              >
                <tbody></tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Shared;
