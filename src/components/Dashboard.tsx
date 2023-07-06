import { useSelector, useDispatch } from 'react-redux';
import {
    selectDatacap,
    selectCustomToken,
    setAddress,
    removeCustomToken,
    selectUsedStorage,
    selectUploadedFilesCount,
} from '../features/counter/accountSlice.ts';
import { useEffect } from 'react';
import { isSignedIn } from '../helpers/userHelper.tsx';
import { useNavigate } from 'react-router-dom';
import { formatByteWeight } from '../helpers/storageHelper.ts';
import { PieChart, Pie, Cell } from 'recharts';
import CustomRadialBarChart from './RadialBarChart.tsx';

const currentPage = "dashboard";

const data01 = [
    { name: 'Photos', value: 30 },
    { name: 'Videos', value: 70 },
];

const COLORS = ['#8883d8', '#82ca9d'];

const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, name,
}: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="gray" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const customToken = useSelector(selectCustomToken);
    //if not signed in, remove all credentials and redirect to login
    useEffect(() => {
        if (!customToken) {
            //go to /login if no customToken
            dispatch(setAddress(null));
            dispatch(removeCustomToken())
            sessionStorage.removeItem("personalSignature");
            //redirect to login
            location.pathname !== "/login" && location.pathname !== "/register"
                ? navigate(`/login/${currentPage}`)
                : console.log("already on login page");

            return;
        }
        if (!isSignedIn(navigate, currentPage)) {
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const datacap = useSelector(selectDatacap);
    const currentlyStored = formatByteWeight(useSelector(selectUsedStorage) || 0);
    const uploadedFilesCount = useSelector(selectUploadedFilesCount);



    return (
        <div className="container z-index-0 position-relative d-block" >
            <div className='row'>
                <h1 className="mt-4">Dashboard</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item active display-4 p-2">Account summary</li>
                </ol>
                <div className="row-xl-3 row-md-6">
                    <div className="card bg-gradient shadow-lg rounded mb-4">
                        <div className="card-body">
                            <h4 className="card-title">Datacap Info</h4>
                            <p className="card-text">Datacap: {datacap} GB</p>
                            <p className="card-text">Currently stored: {currentlyStored}</p>
                            <CustomRadialBarChart />
                            <p className="card-text">Uploaded files count: {uploadedFilesCount}</p>
                        </div>
                        <div className="card-footer d-flex align-items-center justify-content-between">
                            <a className="small text-black " href="#">View Details</a>
                            <div className="small text-black"><i className="fas fa-angle-right"></i></div>
                        </div>
                    </div>
                </div>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item active display-4 p-2">Storage analytics</li>
                </ol>
                <div className="row-xl-3 text-black row-md-6">
                    <div className="card bg-darker text-black bg-gradient-warning text-black shadow-lg rounded mb-4">
                        <div className="card-body">
                            <PieChart width={350} height={250}>
                                <p className='text-black'>asd</p>
                                <Pie
                                    data={data01}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label={renderCustomizedLabel}
                                >
                                    {data01.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
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
            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1"></i>
                    DataTable Example
                </div>
                <div className="card-body">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Office</th>
                                <th>Age</th>
                                <th>Start date</th>
                                <th>Salary</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Office</th>
                                <th>Age</th>
                                <th>Start date</th>
                                <th>Salary</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            <tr>
                                <td>Tiger Nixon</td>
                                <td>System Architect</td>
                                <td>Edinburgh</td>
                                <td>61</td>
                                <td>2011/04/25</td>
                                <td>$320,800</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </div>
        </div>

    )
}

export default Dashboard;