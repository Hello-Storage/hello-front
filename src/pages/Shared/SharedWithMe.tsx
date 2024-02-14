import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublishedFile } from "./Utils/shareUtils";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { File } from "api";
import { useAppDispatch, useAppSelector } from "state";
import Content from "pages/MyStorage/components/Content";
import { setFileViewAction, setImageViewAction } from "state/mystorage/actions";
import { CustomFileViewer } from "components/ImageView/CustomFileViewer";
import { useModal } from "components/Modal";
dayjs.extend(relativeTime);

const SharedWithMe = (props: { shareType: string }) => {
  //get the hash from the url
  const { hash } = useParams();
  const dispatch = useAppDispatch();
  const shareType = props.shareType;
  const [loading, setLoading] = useState(true);
  const [error, seterror] = useState<boolean>()

  const [metadata, setMetadata] = useState<File>();

  const { showPreview } = useAppSelector((state) => state.mystorage);

  useEffect(() => {
    //get file metadata from the hash
    switch (shareType) {
      case "public":
        //get file metadata from the hash
        if (hash && hash.length > 0)
          getPublishedFile(hash).then((res) => {
            if ((res as AxiosResponse).status === 200) {
              res = res as AxiosResponse
              const publishedFile = res.data as File;
              setMetadata(publishedFile);
              setLoading(false);
            }

            if ((res as AxiosError).isAxiosError) {
              toast.error("An error occured while fetching the file metadata");
              seterror(true)
              if ((res as AxiosError).response?.status === 404 || (res as AxiosError).response?.status === 503) {
                return;
              }
            }
          }).catch((err) => {
            toast.error("An error occured while fetching the file metadata");
            seterror(true)
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

  }, [])

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (metadata) {
      toast.info("Loading " + metadata.name + "...");
      setLoaded(!loaded)
      dispatch(setFileViewAction({ file: undefined }));
      dispatch(setImageViewAction({ show: false }));

      dispatch(
        setFileViewAction({
          file: metadata,
        })
      );
      dispatch(
        setImageViewAction({
          show: true,
        })
      );
    }
  }, [metadata])


  const [onPresent] = useModal(<CustomFileViewer
    files={metadata ? [metadata] : []}
  />);

  useEffect(() => {
    if (showPreview && (metadata ? [metadata] : []).length > 0) {
      onPresent();
    }
  }, [showPreview]);

  return (
    <>
      {metadata && (
        <section>
          <div className="w-full flex">
            <div className="w-[99%] share-content">
              <Content
                loading={loading}
                actionsAllowed={false}
                files={[metadata]}
                folders={[]}
                view="list"
                showHorizontalFolders={false}
                showFolders={true}
                filesTitle="Shared File"
                identifier={1}
              />
            </div>
          </div>
        </section>
      )}
      {(error) && (
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl text-gray-400">File not found</span>
        </div>
      )}
    </>
  );
}

export default SharedWithMe;