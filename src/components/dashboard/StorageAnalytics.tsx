import { UsedStoragePieChart } from "./DashboardCharts";
import { useSelector } from "react-redux";
import { selectFilesList } from "../../features/files/dataSlice";

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
                        <h4 className="card-title">Data types information</h4>
                        {filesList.map((file) => {
                            return (
                                <div key={file.ID}>
                                    <p>{file.metadata?.name}</p>
                                    <p>{file.userAddress}</p>
                                </div>
                            )
                        })}
                        <UsedStoragePieChart />
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
