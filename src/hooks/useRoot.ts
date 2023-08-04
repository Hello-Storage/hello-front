import { Api, RootResponse } from "api";
import { useAppDispatch } from "state";
import { fetchContent } from "state/dashboard/actions";

const useRoot = () => {
  const dispatch = useAppDispatch();

  const fetchRootContent = () => {
    Api.get<RootResponse>("/folder")
      .then((res) => {
        console.log(res.data);
        dispatch(fetchContent(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    fetchRootContent,
  };
};

export default useRoot;
