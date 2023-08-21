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
        dispatch(fetchContent(res.data));
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
