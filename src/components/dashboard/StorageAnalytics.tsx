import { UsedStoragePieChart } from "./DashboardCharts";
import { useSelector } from "react-redux";
import { selectFilesList } from "../../features/storage/filesSlice";

const StorageAnalytics = () => {

    const filesList = useSelector(selectFilesList);
    return (
        <div className="container-fluid">
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active display-4 p-2">Storage analytics</li>
            </ol>
            <div className="row-xl-3 text-black row-md-6">
                <div className="card bg-darker text-black bg-gradient-warning text-black shadow-lg rounded mb-4">
                    <div className="card-body">
                        <h4 className="card-title">Data pie</h4>
                        {filesList.length !== 0 &&
                            <UsedStoragePieChart filesList={filesList} />}
                        <h4 className="card-title">Warning Info</h4>
                        <p className="card-text">Warning Card</p>
                        <div className="card-footer d-flex align-items-center justify-content-between">
                            <a className="small text-black " href="#">View Details</a>
                            <div className="small text-black"><i className="fas fa-angle-right"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StorageAnalytics;
