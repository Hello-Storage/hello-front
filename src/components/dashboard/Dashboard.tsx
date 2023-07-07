import { useSelector, useDispatch } from 'react-redux';
import {
    selectCustomToken,
    setAddress,
    removeCustomToken,
} from '../../features/counter/accountSlice.ts';
import { useEffect } from 'react';
import { isSignedIn } from '../../helpers/userHelper.tsx';
import { useNavigate } from 'react-router-dom';
import AccountSummary from './AccountSummary.tsx';
import StorageAnalytics from './StorageAnalytics.tsx';

const currentPage = "dashboard";

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




    return (
        <div className="container z-index-0 position-relative d-block" >
            <div className='row'>
                <h1 className="mt-4">Dashboard</h1>
                <AccountSummary />
                <StorageAnalytics />
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