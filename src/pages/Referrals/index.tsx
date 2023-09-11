import { HiClipboard, HiOutlineUsers, HiUsers } from "react-icons/hi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAppSelector } from "state";


const copyToClipboard = (str: string) => {
    navigator.clipboard.writeText(str);
    toast.success("Copied referral link to clipboard!")
}

const Referrals = () => {
    const baseUrl = window.location.origin;

    const { walletAddress } = useAppSelector((state) => state.user);
    const referralLink = `${baseUrl}/login?ref=${walletAddress}`

    const totalUsers = 9;
    const referredUsers = 3;
    const referredBy = "0xCd0534c21Eb5004e97554DBdd2dE1c9b761863A9"

    const navigate = useNavigate();
    return (
        <div className="flex flex-col h-full relative">
            <a
                onClick={() => navigate("/referrals")}
                className="p-2 text-xl inline-flex items-center text-gray-700 hover:text-blue-600 cursor-pointer"
            >
                Referrals
            </a>
            <hr className="mt-5 mb-3" />
            <div className="h-full p-8 flex flex-col justify-center items-center border rounded-xl">
                {/*a nice tailwindcss designed two paragraphs stating: "you were referred by:" and the referredBy address*/}
                <div className="mb-4 flex flex-col  items-center">
                    <div className="mb-4 flex flex-row items-center space-x-2">
                        <p>You were referred by:</p>
                    </div>
                    <div className="mb-4 flex flex-row items-center space-x-2">
                        <p>{referredBy}</p>
                    </div>
                </div>
                <div className="flex-grow flex flex-col justify-center items-center">
                    <div className="mb-4 flex items-center space-x-2">
                        <HiOutlineUsers className="text-blue-600 w-6 h-6" />
                        <span className="text-lg">Get +10GB for free per each invited user!</span>
                    </div>
                    <div className="mb-4 relative rounded-md shadow-sm w-3/4 max-w-md">
                        <input
                            type="text"
                            readOnly
                            value={referralLink}
                            onClick={() => {
                                copyToClipboard(referralLink);
                            }}
                            className="pr-8 text-xl p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md border-gray-300 border-2"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => copyToClipboard(referralLink)}>
                            <HiClipboard className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </div>
                    </div>
                    <div>
                        <p className="pt-10 w-full text-lg text-left">You got {referredUsers * 10}GB/{totalUsers * 10}GB from {referredUsers} invited users</p>
                        <div className="grid grid-cols-9 gap-2">
                            {Array.from({ length: totalUsers }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-8 w-20 p-2 rounded ${index < referredUsers ? 'bg-green-500' : 'bg-red-500'} hover:bg-blue-500 fex items-center`}
                                    title={index < referredUsers ? `Invited user wallet address: syntheticWalletAddress${index}` : ''}
                                ><p className="text-white leading-none select-none">{index < referredUsers ? `+10GB` : ''}</p></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Referrals;