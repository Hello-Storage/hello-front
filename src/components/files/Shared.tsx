import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setSelectedPage, setShowToast, setToastMessage } from "../../features/account/accountSlice";
import { isSignedIn } from "../../helpers/userHelper";
import { useEffect, useState } from "react";
import { FileMetadata } from "../../types";
import { getPublicMetadata } from "../../requests/shareRequests";
import { AxiosError, AxiosResponse } from "axios";

const currentPage = "shared"
const Shared = (props: { shareType: string }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    dispatch(setSelectedPage(currentPage))
    const shareType = props.shareType;
    //get the hash from the :hash param
    const hash = useParams().hash;


    const [metadata, setMetadata] = useState<FileMetadata>();

    useEffect(() => {
        if (!isSignedIn(navigate, currentPage)) {
            return;
        }

        //get file metadata from the hash
        switch (shareType) {
            case "public":
                //get file metadata from the hash
                if (hash && hash.length > 0)
                    getPublicMetadata(hash).then((res) => {
                        if ((res as AxiosResponse).status === 200) {
                            res = res as AxiosResponse
                            setMetadata(res.data);
                        }

                        if ((res as AxiosError).isAxiosError) {
                            if ((res as AxiosError).response?.status === 404 || (res as AxiosError).response?.status === 503) {
                                return;
                            }
                            dispatch(setToastMessage((res as AxiosError).response?.data));
                            dispatch(setShowToast(true));
                        }
                    }).catch((err) => {
                        dispatch(setToastMessage(err));
                        dispatch(setShowToast(true));
                    });

                break;
            case "private":
                //get file metadata from the hash
                if (hash && hash.length > 0)
                    alert("private")
                break;
            default:
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="container z-index-0 position-relative d-block" >
            <p>shared hash: {hash} shareType: {shareType}</p>
            <p>Metadata: {metadata !== undefined && JSON.stringify(metadata)}</p>
        </div>

    )
}

export default Shared;