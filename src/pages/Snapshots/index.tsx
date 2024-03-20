import { Link } from "react-router-dom";
import LogoHello from "@images/beta.png";
import { SnapshotContainer } from "./components/SnapshotContainer";

export default function Snapshots() {
  return (
    <div className="custom-scrollbar max-h-screen  bg-[#05072b] flex items-center flex-col relative w-screen overflow-hidden">
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
          <SnapshotContainer
            date="14:36-20/03/2024"
            transaction_id="6vADecq8ezLU9KG7SooxVuAwBa_Hg9Av9FU9MGYXJto"
            owner="F0_rfwl6LpM_4WnR5pZ2lKI1VXB7u_BctR-gG1VCRWI"
            cid="bafybeicm4w4vstqisfm6y67sfuusemftosfhmf4kluzeczaweyynunxele"
          />
          <SnapshotContainer
            date="14:36-20/03/2024"
            transaction_id="6vADecq8ezLU9KG7SooxVuAwBa_Hg9Av9FU9MGYXJto"
            owner="F0_rfwl6LpM_4WnR5pZ2lKI1VXB7u_BctR-gG1VCRWI"
            cid="bafybeicm4w4vstqisfm6y67sfuusemftosfhmf4kluzeczaweyynunxele"
          />
          <SnapshotContainer
            date="14:36-20/03/2024"
            transaction_id="6vADecq8ezLU9KG7SooxVuAwBa_Hg9Av9FU9MGYXJto"
            owner="F0_rfwl6LpM_4WnR5pZ2lKI1VXB7u_BctR-gG1VCRWI"
            cid="bafybeicm4w4vstqisfm6y67sfuusemftosfhmf4kluzeczaweyynunxele"
          />
          <SnapshotContainer
            date="14:36-20/03/2024"
            transaction_id="6vADecq8ezLU9KG7SooxVuAwBa_Hg9Av9FU9MGYXJto"
            owner="F0_rfwl6LpM_4WnR5pZ2lKI1VXB7u_BctR-gG1VCRWI"
            cid="bafybeicm4w4vstqisfm6y67sfuusemftosfhmf4kluzeczaweyynunxele"
          />
        </div>
      </div>
    </div>
  );
}
