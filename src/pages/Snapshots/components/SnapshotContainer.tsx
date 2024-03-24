import React from "react";
import { HiClipboardCopy } from "react-icons/hi";
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
            <td className="flex flex-row m-2 p-2 cursor-pointer" onClick={() => { copyToClipboard(transaction_id) }}>{transaction_id}<HiClipboardCopy className="ml-2 w-50 h-50" /></td>
          </tr>
          <tr>
            <td className="p-2">owner</td>
            <td className="p-2 cursor-pointer" onClick={() => { copyToClipboard(owner) }}>{owner}</td>
          </tr>
          <tr>
            <td className="p-2">cid</td>
            <td className="p-2 cursor-pointer" onClick={() => { copyToClipboard(cid) }}>{cid}</td>
          </tr>
        </tbody>
      </table>
      <section className="w-full flex flex-col md:flex-row justify-center items-center gap-2 mt-2">
        <a target="_blank" href={`https://arweave.net/${transaction_id}`}>  <button>Arweave</button></a>
        <a target="_blank" href={`https://ipfs.io/ipfs/${cid}`}><button>IPFS</button></a>
        <a target="_blank" href={`https://viewblock.io/arweave/tx/${transaction_id}`}><button>View On Chain Explorer</button></a>
      </section>
    </div>
  );
};
