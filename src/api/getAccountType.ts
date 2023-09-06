import { logoutUser } from "state/user/actions";

const getAccountType = () => {
    const accountType = localStorage.getItem("account_type");
    if (!accountType) {
        logoutUser();
        return;
    }
    return accountType;
}

export default getAccountType;