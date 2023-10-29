import { FC } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner3 } from "components/Spinner";
import { useAppDispatch, useAppSelector } from "state";
import { setRedirectUrl } from "state/user/actions";

const PrivateRoute: FC<{ component: React.ComponentType }> = ({
  component: RouteComponent,
}) => {
  const { authenticated, loading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const location = useLocation();

  let content;


  if (loading) {
    content = <Spinner3 />;
  } else if (authenticated) {
    content = <RouteComponent />;
  } else {
    dispatch(setRedirectUrl(location.pathname));


    content = <Navigate to="/space/login" />;
  }

  return content;
};

export default PrivateRoute;
