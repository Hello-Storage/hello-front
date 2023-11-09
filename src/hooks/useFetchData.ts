import { useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Api, RootResponse, UserDetailResponse } from "api";
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

          const sortedFiles = res.data.files.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          const sortedFolders = res.data.folders.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          const resDataA = res.data;

          Api.get("/user/shared/general")
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
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
