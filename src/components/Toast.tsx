import { useEffect } from "react";


type ToastStateType = [boolean, React.Dispatch<React.SetStateAction<boolean>>];


const Toast = ({ message, toastState }: { message: string, toastState:  ToastStateType}) => {

    const [showToast, setShowToast] = toastState;

    const handleClose = () => {
        setShowToast(false);
    };

    useEffect(() => {
        if (showToast) {
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        }
    }, [setShowToast, showToast]);
    

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
                            {message}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Toast;