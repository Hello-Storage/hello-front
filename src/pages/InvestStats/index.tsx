import axios from "axios"
import React from "react"

interface InvestAccount {
    id: number;
    ip: string;
    created_at: string; // Tipar created_at como una cadena de texto
    updated_at: string;
    deleted_at: string | null;
    code: string;
}


export default function InvestStats() {

    const apiUrl = import.meta.env.VITE_API_ENDPOINT
    const [investAccounts, setInvestAccounts] = React.useState([])
    const [allAccounts, setAllAccounts] = React.useState<InvestAccount[]>()

    const [filterAccount, setFilterAccount] = React.useState<InvestAccount[]>([])


    React.useEffect(() => {

        async function fetchData() {
            const { data } = await axios.get(`${apiUrl}/invest`)
            setInvestAccounts(data.message)
            if (!allAccounts) {
                const response = await axios.get(`${apiUrl}/invest/all`)
                setAllAccounts(response.data.message)
            }

        }

        fetchData()
    }, [])


    return (

        <div className="min-h-screen pt-[100px] flex flex-col gap-5 box-border">

            <div className="absolute top-5 left-5 flex items-center">
                <h1 className="text-2xl font-semibold text-black flex items-center font-[outfit]" title="hello app"> {"hello.app"} </h1>
                <img src="https://hello.app/assets/beta-e8ce8431.png" alt="hello beta" className="h-[22px] w-auto ml-3" />
            </div>

            <div className="relative w-full px-5 sm:px-10 box-border">
                <button onClick={() => { setFilterAccount([]) }} className="h-[40px] bg-blue-100 px-3 border-0 rounded-lg absolute top-[-45px] right-[50px] transition-all hover:bg-blue-300 hover:scale-[1.05]">Reset</button>
                <div className="w-full border rounded-lg bg-blue-100 p-5 overflow-y-scroll">

                    <ul className="w-full flex justify-start">
                        <li className="min-w-[150px] w-[30%] flex justify-start">Code</li>
                        <li className="min-w-[150px] w-[30%] flex justify-start">Social network</li>
                    </ul>

                    <div className="w-full flex flex-col justify-start items-start gap-2">

                        {investAccounts?.map((x, index) => {
                            const { code, social_network, InvestAccounts } = x
                            return (
                                <ul onClick={() => { setFilterAccount(InvestAccounts) }} key={index} className="w-full flex justify-start p-3 cursor-pointer border rounded-lg hover:bg-blue-300">
                                    <li className="min-w-[150px] w-[30%] flex justify-start">{code}</li>
                                    <li className="min-w-[150px] w-[30%] flex justify-start">{social_network}</li>
                                </ul>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full px-5 sm:px-10 flex justify-end">
                {filterAccount.length == 0
                    ? <p>{`Total Accounts: ${allAccounts?.length}`}</p>
                    : <p>{`Total Accounts by code: ${filterAccount?.length}`}</p>}
            </div>

            <div className="min-h-[40%] h-min w-full px-5 sm:px-10 box-border">
                <div className="w-full border rounded-lg bg-blue-100 p-5 overflow-auto ">

                    <ul className="w-full flex justify-between">
                        <li className="min-w-[150px] w-[30%] flex justify-start">Ip</li>
                        <li className="min-w-[150px] w-[30%] flex justify-start">Date</li>
                        <li className="min-w-[150px] w-[30%] flex justify-start">Hour</li>
                        <li className="min-w-[150px] w-[30%] flex justify-start">Code</li>
                    </ul>

                    <div className="w-full flex flex-col justify-start items-start gap-2">
                        {filterAccount?.length !== 0 ? filterAccount?.map((x, index) => {
                            const { ip, created_at, code } = x
                            return (
                                <ul key={index} className="w-full flex justify-between p-3 cursor-pointer border rounded-lg hover:bg-blue-300">
                                    <li className="min-w-[150px] w-[28%] flex justify-start">{ip}</li>
                                    <li className="min-w-[150px] w-[28%] flex justify-start">{created_at.split("T")[0]}</li>
                                    <li className="min-w-[150px] w-[28%] flex justify-start">{created_at.split("T")[1].split(".")[0]}</li>
                                    <li className="min-w-[150px] w-[28%] flex justify-start">{code}</li>
                                </ul>
                            )
                        })
                            : allAccounts?.map((x, index) => {
                                const { ip, created_at, code } = x
                                return (
                                    <ul key={index} className="w-full flex justify-between p-3 cursor-pointer border rounded-lg hover:bg-blue-300">
                                        <li className="min-w-[150px] w-[28%] flex justify-start">{ip}</li>
                                        <li className="min-w-[150px] w-[28%] flex justify-start">{created_at.split("T")[0]}</li>
                                        <li className="min-w-[150px] w-[28%] flex justify-start">{created_at.split("T")[1].split(".")[0]}</li>
                                        <li className="min-w-[150px] w-[28%] flex justify-start">{code}</li>
                                    </ul>
                                )
                            })}
                    </div>
                </div>
            </div>
        </div>

    )
}
