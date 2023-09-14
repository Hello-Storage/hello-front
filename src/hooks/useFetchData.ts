import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Api, EncryptionStatus, RootResponse, UserDetailResponse } from "api";
import { useAppDispatch, useAppSelector } from "state";
import { fetchContentAction } from "state/mystorage/actions";
import { loadUserDetail } from "state/userdetail/actions";
import { File, Folder } from "api/types/base";
import { toast } from "react-toastify";
import { decryptMeta } from "utils/encrypt";

const useFetchData = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { signature } = useAppSelector((state) => state.user);

  const decryptFilesMeta = async (files: File[]) => {
    // Using map to create an array of promises
    const decrytpedFilesPromises = files.map(async (file) => {
      if (file.status === EncryptionStatus.Encrypted) {
        return await decryptMeta(file, signature);
      } else return file;
    });

    // Wait for all promises to resolve
    const decryptedFiles = await Promise.all(decrytpedFilesPromises);
    return decryptedFiles;
  };

  const fetchRootContent = useCallback(() => {
    let root = "/folder";

    if (location.pathname.includes("/folder")) {
      root = "/folder/" + location.pathname.split("/")[2];
    }

    Api.get<RootResponse>(root)
      .then(async (res) => {
        const decryptedFiles = await decryptFilesMeta(res.data.files).catch(
          (err) => {
            console.log(err);
          }
        );

        if (!decryptedFiles) {
          toast.error("Failed to decrypt files");
          dispatch(fetchContentAction(res.data));
          return;
        }

        const sortedFiles = decryptedFiles.sort(
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
            path: res.data.path,
          })
        );
      })
      .catch((err) => {
        console.log(err);
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
