import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../app/store";
import { selectShowToast, selectToastMessage, setShowToast } from "../../features/account/accountSlice";




const Toast = () => {

    const dispatch = useDispatch<AppDispatch>();

    const toastMessage = useSelector(selectToastMessage);
    const showToast = useSelector(selectShowToast);

    const handleClose = () => {
        dispatch(setShowToast(false));
    };

    useEffect(() => {
        if (showToast) {
            setTimeout(() => {
                dispatch(setShowToast(false));
            }, 3000);
        }
    }, [dispatch, showToast, toastMessage]);


    return (
        <>
            {showToast && (
                <div className="position-absolute top-0 end-0 p-2">
                    <div className={`toast ${showToast && 'show'}`} role="alert" aria-live="assertive" aria-atomic="true">
                        <div className="toast-header">
                            <strong className="me-auto">Information</strong>
                            <button type="button" className="btn-close" onClick={() => handleClose()}></button>
                        </div>
                        <div className="toast-body">
                            {toastMessage}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Toast;