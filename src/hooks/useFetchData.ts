import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Api, RootResponse, UserDetailResponse } from "api";
import { useAppDispatch } from "state";
import { fetchContent } from "state/mystorage/actions";
import { loadUserDetail } from "state/userdetail/actions";

const useFetchData = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const fetchRootContent = useCallback(() => {
    var root = "/folder";

    if (location.pathname.includes("/folder")) {
      root = "/folder/" + location.pathname.split("/")[2];
    }

    Api.get<RootResponse>(root)
    .then((res) => {
      const sortedFiles = res.data.files.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const sortedFolders = res.data.folders.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      dispatch(fetchContent({
        ...res.data,
        files: sortedFiles,
        folders: sortedFolders
      }));
    })
    .catch((err) => {});
}, [location.pathname]);

  const fetchUserDetail = useCallback(() => {
    Api.get<UserDetailResponse>("/user/detail")
      .then((res) => {
        dispatch(loadUserDetail(res.data));
      })
      .catch((err) => {});
  }, []);

  return {
    fetchRootContent,
    fetchUserDetail,
  };
};

export default useFetchData;
