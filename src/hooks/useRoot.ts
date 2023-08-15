import { useLocation } from "react-router-dom";
import { Api, RootResponse } from "api";
import { useAppDispatch } from "state";
import { fetchContent } from "state/dashboard/actions";
import { useCallback } from "react";

const useRoot = () => {
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

  return {
    fetchRootContent,
  };
};

export default useRoot;
