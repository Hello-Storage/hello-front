import React from "react";
import { toast } from "react-toastify";

interface SnapshotContainerProps {
  date: string;
  transaction_id: string;
  owner: string;
  cid: string;
}

export const SnapshotContainer: React.FC<SnapshotContainerProps> = ({
  date,
  transaction_id,
  owner,
  cid,
}) => {

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

  return (
    <div className="snapshots-p-container">
      <h3 className="text-center">{date}</h3>
      <table>
        <tbody>
          <tr>
            <td className="p-2">transaction_id</td>
            <td className="p-2 cursor-pointer" onClick={()=>{copyToClipboard(transaction_id)}}>{transaction_id}</td>
          </tr>
          <tr>
            <td className="p-2">owner</td>
            <td className="p-2 cursor-pointer" onClick={()=>{copyToClipboard(owner)}}>{owner}</td>
          </tr>
          <tr>
            <td className="p-2">cid</td>
            <td className="p-2 cursor-pointer" onClick={()=>{copyToClipboard(cid)}}>{cid}</td>
          </tr>
        </tbody>
      </table>
      <section className="w-full flex flex-col md:flex-row justify-center items-center gap-2 mt-2">
        <button>Arweave</button>
        <button>IPFS</button>
        <button>View On Chain Explorer</button>
      </section>
    </div>
  );
};
