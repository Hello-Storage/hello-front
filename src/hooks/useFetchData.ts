import { useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Api, RootResponse, SharedResponse, UserDetailResponse } from "api";
import { useAppDispatch } from "state";
import { fetchContentAction } from "state/mystorage/actions";
import { loadUserDetail } from "state/userdetail/actions";
import { toast } from "react-toastify";
import { handleEncryptedFolders } from "utils/encryption/filesCipher";
const useFetchData = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const personalSignatureRef = useRef<string | undefined>();
  
  const fetchRootContent = useCallback(
    (setLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
      if (setLoading) setLoading(true);
      let root = "/folder";

      if (location.pathname.includes("/space/folder")) {
        root = "/folder/" + location.pathname.split("/")[3];
      }

      Api.get<RootResponse>(root)
        .then(async (res) => {
          personalSignatureRef.current =
            sessionStorage.getItem("personal_signature") ?? undefined;
          if (!personalSignatureRef.current) {
            toast.error("Failed to fetch root");
            return;
          }
          const decryptedPath = await handleEncryptedFolders(
            res.data.path,
            personalSignatureRef.current
          ).catch((err) => {
            console.log(err);
          });

          if (!decryptedPath) {
            toast.error("Failed to decrypt files");
            dispatch(fetchContentAction(res.data));
            return;
          }

          console.log("files length:")
          console.log(res.data.files.length)

          const sortedFiles = res.data.files.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          console.log("sorted files length:")
          console.log(sortedFiles.length)
          
          console.log("folders length:")
          console.log(res.data.folders.length)
          const sortedFolders = res.data.folders.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          console.log("sorted folders length:")
          console.log(sortedFolders.length)

          const resDataA = res.data;

          Api.get<SharedResponse>("/user/shared/general")
            .then((res) => {

              const FsharedWithMe = res.data.SharedWithMe ? res.data.SharedWithMe : [];
              const FsharedByMe = res.data.SharedByMe ? res.data.SharedByMe : [];
              const sortedFileSharedW = FsharedWithMe.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );

              const sortedFilesSharedB = FsharedByMe.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
              dispatch(
                fetchContentAction({
                  ...resDataA,
                  files: sortedFiles,
                  sharedFiles: {
                    sharedWithMe: sortedFileSharedW,
                    sharedByMe: sortedFilesSharedB,
                  },
                  folders: sortedFolders,
                  path: decryptedPath,
                })
              );
            })
            .catch((err) => {
              console.error("Error fetching data:", err);
            })
            .finally(() => {
              if (setLoading) setLoading(false);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    },
    [location.pathname]
  );

  const fetchUserDetail = useCallback(() => {
    Api.get<UserDetailResponse>("/user/detail")
      .then((res) => {
        dispatch(loadUserDetail(res.data));
      })
      .catch((err) => {
        console.log(err);
        localStorage.removeItem("access_token");
      });
  }, []);

  return {
    fetchRootContent,
    fetchUserDetail,
  };
};

export default useFetchData;
