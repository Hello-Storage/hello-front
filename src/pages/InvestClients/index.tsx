import { Spinner2 } from "components/Spinner"
import React from "react"
import axios from "axios"
import { useParams } from "react-router-dom"


interface ClientData {
    ip: string;
    email: string;
    social_network: string;
  }

export default function InvestClient(){

    const apiUrl = import.meta.env.VITE_API_ENDPOINT
    const {code} = useParams()
    const [dataComplete, setData] = React.useState(false)
    const [clientData, setClientData] = React.useState<ClientData>({
        ip: '',
        email: '',
        social_network: '',
    })


    React.useEffect(() => {
        async function fetchIp() {
          try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setClientData((prevData) => ({...prevData, ip: response.data.ip }));

            if(code?.includes("yt")){
            setClientData((prevData) => ({...prevData, social_network: "Youtube" }));
            }

            setData(true)


          } catch (error) {
            console.error(error);
          }
        }
    
        fetchIp();
      }, []);

      React.useEffect(() => {
        if(dataComplete){
            console.log("Data actualizada:", clientData);
            axios.post(`${apiUrl}/invest?code=${code}`, clientData);

            window.location.href = 'https://www.seedrs.com/hello-app'
        }
    }, [clientData]);



    return (
        <div className="h-screen flex items-center justify-center flex-col">
            <div className="absolute top-5 left-5 flex items-center">
                <h1 className="text-2xl font-semibold text-black flex items-center font-[outfit]" title="hello app"> {"hello.app"} </h1>
                <img src="https://hello.app/assets/beta-e8ce8431.png" alt="hello beta" className="h-[22px] w-auto ml-3"/>
            </div>
            <h1>You are being redirect to our crowdfunding</h1>
            <div className="h-[50px] overflow-hidden flex justify-center items-center"><Spinner2/></div>
        </div>
    )
}