import { FC } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "components/Spinner";
import { useAppSelector } from "state";

const PrivateRoute: FC<{ component: React.ComponentType }> = ({
  component: RouteComponent,
}) => {
  const { authenticated, loading } = useAppSelector((state) => state.user);

  if (loading) return <Spinner />;
  if (authenticated) return <RouteComponent />;

  return <Navigate to="/login" />;
};

export default PrivateRoute;
