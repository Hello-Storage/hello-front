import { useSelector } from "react-redux";
import { selectDatacap, selectUsedStorage, selectUploadedFilesCount } from "../../features/account/accountSlice";
import { formatByteWeight } from "../../helpers/storageHelper";
import { StorageBarChart } from "./DashboardCharts";

const AccountSummary = () => {

    const datacapGB = useSelector(selectDatacap);
    const datacapBytes = datacapGB ? datacapGB * 1000000000 : 0;
    const usedStorage = useSelector(selectUsedStorage) ?? 0;
    const currentlyStored = formatByteWeight(usedStorage);
    const uploadedFilesCount = useSelector(selectUploadedFilesCount);
    const availableStorage = datacapBytes - usedStorage;

    const usedPercentage = parseFloat(((usedStorage / datacapBytes) * 100).toFixed(4));
    const availablePercentage = parseFloat(((availableStorage / datacapBytes) * 100).toFixed(4));

    return (
        <div className="container-fluid">
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active display-4 p-2">Account summary</li>
            </ol>
            <div className="row-xl-3 row-md-6">
                <div className="card bg-gradient shadow-lg rounded mb-4">
                    <div className="card-body">
                        <h4 className="card-title">Datacap Info</h4>
                        <p className="card-text">Datacap: {datacapGB} GB</p>
                        <p className="card-text">Currently stored: {currentlyStored}</p>
                        <StorageBarChart used={parseFloat(usedPercentage.toFixed(4))} available={availablePercentage} />
                        <p className="card-text">Uploaded files count: {uploadedFilesCount}</p>
                    </div>
                    <div className="card-footer d-flex align-items-center justify-content-between">
                        <a className="small text-black " href="#">View Details</a>
                        <div className="small text-black"><i className="fas fa-angle-right"></i></div>
                    </div>
                </div>
            </div>
        </div>)
}
export default AccountSummary;