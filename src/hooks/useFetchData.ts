import { useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Api, EncryptionStatus, RootResponse, UserDetailResponse } from "api";
import { useAppDispatch } from "state";
import { fetchContentAction } from "state/mystorage/actions";
import { loadUserDetail } from "state/userdetail/actions";
import { Folder } from "api/types/base";
import { toast } from "react-toastify";
import {
  decryptContent,
  handleEncryptedFiles,
  handleEncryptedFolders,
  hexToBuffer,
} from "utils/encryption/filesCipher";

const useFetchData = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const personalSignatureRef = useRef<string | undefined>();







  const fetchRootContent = useCallback((setLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (setLoading)
      setLoading(true);
    let root = "/space/folder";

    if (location.pathname.includes("/space/folder")) {
      root = "/space/folder/" + location.pathname.split("/")[3];
    }


    Api.get<RootResponse>(root)
      .then(async (res) => {
        const decryptedPath = await handleEncryptedFolders(res.data.path, personalSignatureRef).catch(
          (err) => {
            console.log(err);
          }
        );
        if (!decryptedPath) {
          toast.error("Failed to decrypt files");
          dispatch(fetchContentAction(res.data));
          return;
        }

        const sortedFiles = res.data.files.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const sortedFolders = res.data.folders.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        dispatch(
          fetchContentAction({
            ...res.data,
            files: sortedFiles,
            folders: sortedFolders,
            path: decryptedPath,
          })
        );
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        if (setLoading)
          setLoading(false);
      });
  }, [location.pathname]);

  const fetchUserDetail = useCallback(() => {
    Api.get<UserDetailResponse>("/user/detail")
      .then((res) => {
        dispatch(loadUserDetail(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return {
    fetchRootContent,
    fetchUserDetail,
  };
};

export default useFetchData;
