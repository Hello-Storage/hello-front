import { getFileIcon, viewableExtensions } from "pages/MyStorage/components/Content/utils";
import { useEffect, useRef, useState } from "react";
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
import { blobToArrayBuffer, decryptFileBuffer } from "utils/encryption/filesCipher";
import { PreviewImage, setImageViewAction } from "state/mystorage/actions";
import UploadProgress from "pages/MyStorage/components/UploadProgress";
import "lightbox.js-react/dist/index.css";
import { SlideshowLightbox } from "lightbox.js-react";
import { useAppSelector } from "state";
dayjs.extend(relativeTime);

const SharedWithMe = (props: { shareType: string }) => {
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
        info: `${viewRef.current ? "Loading" : "Downloading"} ` + metadata?.name,
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
          getPublishedFile(hash).then((res) => {
            if ((res as AxiosResponse).status === 200) {
              res = res as AxiosResponse
              const publishedFile = res.data as PublicFile;
              setMetadata(publishedFile);
            }

            if ((res as AxiosError).isAxiosError) {
              toast.error("An error occured while fetching the file metadata");
              if ((res as AxiosError).response?.status === 404 || (res as AxiosError).response?.status === 503) {
                return;
              }
            }
          }).catch((err) => {
            toast.error("An error occured while fetching the file metadata");
            console.log(err);
          });

        break;
      case "private":
        //get file metadata from the hash
        if (hash && hash.length > 0)
          alert("private")
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const fileExtension = (metadata?.name.split('.').pop() || '').toLowerCase();

  const { showPreview, preview } = useAppSelector(
    (state) => state.mystorage
  );

  const viewable = viewableExtensions.has(fileExtension); // check if the file is viewable

  const downloadHandler = () => {
    switch (shareType) {
      case "public":
        //get file metadata from the hash
        if (hash && hash.length > 0)
          downloadFile(metadata)
        break;
      case "private":
        //get file metadata from the hash
        if (hash && hash.length > 0)
          return () => alert("private")
        break;
      default:
        return () => { "" };
    }
  }

  // Function to handle file download
  const downloadFile = (metadata: PublicFile | undefined) => {
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
        toast.error("Error downloading file");
        console.error("Error downloading file:", err);
      });
  };

  const handleView = (metadata: PublicFile | undefined) => {
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
        toast.error("Error downloading file");
        console.error("Error downloading file:", err);
      });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl md:mx-0">
        <header className="flex flex-row items-center justify-between p-6 bg-gray-600 rounded-t-lg">
          <h2 className="flex flex-row text-3xl font-semibold text-white">
            {metadata?.name && getFileIcon(metadata?.name)}
            <p className="ml-2">{shareType.toUpperCase()} File</p>
          </h2>
        </header>
        <div className="p-6">
          <table className="w-full text-left">
            <tbody>
              <tr className="border-b">
                <th className="py-2 font-semibold text-gray-600">Name</th>
                <td className="py-2 text-gray-800" id="fileName">{metadata?.name}</td>
              </tr>
              <tr className="border-b">
                <th className="py-2 font-semibold text-gray-600">Type</th>
                <td className="py-2 text-gray-800" id="fileType">{metadata?.mime_type}</td>
              </tr>
              <tr className="border-b">
                <th className="py-2 font-semibold text-gray-600">Size</th>
                <td className="py-2 text-gray-800" id="fileSize">{metadata?.size ? formatBytes(metadata.size) : ''}</td>
              </tr>
              <tr className="border-b">
                <th className="py-2 font-semibold text-gray-600">Last Modified</th>
                <td className="py-2 text-gray-800" id="lastModified">{dayjs(metadata?.updated_at).fromNow()}</td>
              </tr>
              <tr>
                <th className="py-2 font-semibold text-gray-600">Created At</th>
                <td className="py-2 text-gray-800" id="createdAt">{metadata?.created_at ? new Date(metadata.created_at).toString() : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-6 bg-gray-100 rounded-b-lg">
          <a href="#" onClick={() => downloadHandler()} className="px-6 py-2 text-white transition duration-200 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700">Download</a>
          {viewable && <button onClick={() => handleView(metadata)} className="px-6 py-2 text-white transition duration-200 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700">
            <i className="mr-1 fas fa-eye"></i> View
          </button>}
        </div>
      </div>
      {/* Upload Info */}
      {uploading && <UploadProgress />}

      {/* lightbox */}
      <SlideshowLightbox
        images={preview == undefined ? [] : [preview]}
        showThumbnails={false}
        showThumbnailIcon={false}
        open={showPreview}
        lightboxIdentifier="lbox1"
        backgroundColor="#0f0f0fcc"
        iconColor="#ffffff"
        modalClose="clickOutside"
        onClose={() => {
          dispatch(setImageViewAction({ show: false }));
        }}
      />
    </div>
  );
}

export default SharedWithMe;