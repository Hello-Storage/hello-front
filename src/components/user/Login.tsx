import ConnectWalletButton from "../ConnectWalletButton";
import { AppDispatch } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { selectLoading, selectCustomToken, setShowPasswordModal, setLoading, selectAddress, setDestiny } from "../../features/counter/accountSlice";
import { useParams } from "react-router-dom";


const roundedDivStyle = {
    width: "299px",
    height: "199px",
    borderRadius: "19px",
    backgroundColor: "#f4f5f5",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    margin: "-1 auto",
}


const Login = () => {

    const { destiny } = useParams();

    const dispatch = useDispatch<AppDispatch>();

    const loading = useSelector(selectLoading);
    const address = useSelector(selectAddress);
    const customToken = useSelector(selectCustomToken);

    const onPressConnect = async () => {
        dispatch(setShowPasswordModal(true));
        dispatch(setLoading(true));
        dispatch(setDestiny(destiny));
    };
    return (
        <div className="d-flex flex-column h-75 container mt-4 align-items-center justify-content-center">
            <div className="rounded-top text-center text-dark p-2">
                <p className="m-0" style={{ color: "#999999" }}>Login with provider</p>
            </div>
            <div style={roundedDivStyle} className="rounded-div">
                <ConnectWalletButton
                    onPressConnect={onPressConnect}
                    onPressLogout={() => { return }}
                    loading={loading}
                    address={address}
                    customToken={customToken}
                />
            </div>
        </div>
    )
}

export default Login;