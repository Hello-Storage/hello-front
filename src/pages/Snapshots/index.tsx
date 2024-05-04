import { Link } from "react-router-dom";
import LogoHello from "@images/beta.png";
import { SnapshotContainer } from "./components/SnapshotContainer";
import { useEffect, useState } from "react";
import { Api } from "api";
import { Helmet } from "react-helmet";

type Snapshot = {
  transaction_date: string;
  transaction_id: string;
  transaction_owner: string;
  transaction_message: string;
}

const getData = async (setSnapshots: React.Dispatch<React.SetStateAction<[Snapshot] | undefined>>) => {

  const res = await Api.get("https://api-staging.joinhello.app/api/arweave/snapshots")

  console.log(res)
  setSnapshots(res.data.AllTransactions)
}

export default function Snapshots() {

  const [snapshots, setSnapshots] = useState<[Snapshot]>()

  useEffect(() => {

    getData(setSnapshots)
  }, [])



  return (
    <>
      <Helmet>
        <title>Snapshots | hello.app</title>
        <meta name="description" content="hello.app Snapshots" />
        <link rel="canonical" href="https://hello.app/snapshots" />
      </Helmet>
      <div className="custom-scrollbar h-screen  bg-[#05072b] flex items-center flex-col relative w-screen overflow-hidden">
        <p className="absolute top-0 right-2 bg-[#32334b] text-white p-2 rounded-lg m-2">
          Updated: 20/03/2024
        </p>
        <div className="flex items-center gap-3 absolute top-0 left-2  text-white p-2 m-2">
          <Link
            to="/space/my-storage"
            className="text-2xl font-semibold font-[Outfit]"
          >
            hello.app
          </Link>
          <img src={LogoHello} alt="beta" className="w-12 h-6" />
        </div>
        <h1 className="bg-[#32334b] text-white text-2xl font-bold p-[10px] rounded-lg mt-[50px] mb-[15px]">
          <u>hello.app Snapshots</u>
        </h1>
        <div className="mx-5">
          <div className="flex items-center justify-center flex-col">
            {snapshots?.map((snapshot) => {
              return (
                <SnapshotContainer
                  date={new Date(snapshot.transaction_date).toDateString()}
                  transaction_id={snapshot.transaction_id}
                  owner={snapshot.transaction_owner}
                  cid={snapshot.transaction_message} />
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}
