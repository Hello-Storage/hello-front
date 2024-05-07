import { Spinner2 } from "components/Spinner"
import React from "react"
import axios from "axios"
import { useParams } from "react-router-dom"


interface ClientData {
    ip: string;
  }

export default function InvestClient(){

    const apiUrl = import.meta.env.VITE_API_ENDPOINT
    const {code} = useParams()
    const [dataComplete, setData] = React.useState(false)
    const [clientData, setClientData] = React.useState<ClientData>({
        ip: '',
    })

    const [wrongUrl, setWrongUrl] = React.useState(false)


    React.useEffect(() => {
        async function fetchIp() {
          try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setClientData((prevData) => ({...prevData, ip: response.data.ip }));

            setData(true)


          } catch (error) {
            console.error(error);
          }
        }
    
        fetchIp();
      }, []);

      React.useEffect(() => {

        async function postData(){
          if(dataComplete){

            const {data} = await axios.post(`${apiUrl}/invest?code=${code}`, clientData);

            if(data.isSuccess){
              window.location.href = 'https://www.seedrs.com/hello-app'
            }else{
              setWrongUrl(true)
            }

        }
        }

        postData()
        
    }, [clientData]);

    if(wrongUrl){
      return(
        <div className="h-screen flex items-center justify-center flex-col">
            <div className="absolute top-5 left-5 flex items-center">
                <h1 className="text-2xl font-semibold text-black flex items-center font-[outfit]" title="hello app"> {"hello.app"} </h1>
                <img src="https://hello.app/assets/beta-e8ce8431.png" alt="hello beta" className="h-[22px] w-auto ml-3"/>
            </div>
            <h1>The URL is not correct</h1>
        </div>
      )
    }



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