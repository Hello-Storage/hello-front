import { Modal, useModal } from "components/Modal";
import { useAppDispatch, useAppSelector } from "state";
import { Theme } from "state/user/reducer";
import { File as FileType } from "api/types";
import { useEffect, useState } from "react";
import { StreamToIpfs } from "api/ipfs/streamToIpfs";
import { SiIpfs } from "react-icons/si";
import { PinFile } from "utils/ipfs/PinFile";
import { SpinnerMini } from "components/Spinner";
import { useHelia } from "hooks/useHelia";
import { toast } from "react-toastify";

type Props = {
    file: FileType
}

export const ShowOnIpfsModal: React.FC<Props> = ({ file }) => {
    const [, onDismiss] = useModal(<></>);
    const dispatch = useAppDispatch();
    const { helia } = useHelia()
    const [hash, setHash] = useState("")
    const helloGateway = import.meta.env.VITE_IPFS_GATEWAY

    async function viewOnIpfsHandler() {
        if (file.ipfs_hash && file.ipfs_hash !== "") {
            setHash(file.ipfs_hash)
        } else {
            const hashUpdated = await StreamToIpfs(file.cid, file.name, file.uid, dispatch)
            setHash(hashUpdated)
        }
    }

    useEffect(() => {
        viewOnIpfsHandler()
    }, [])

    useEffect(() => {
        if (hash) {
            PinFile(hash, helia)
        }
    }, [hash])

    function copyHashHandler() {
        navigator.clipboard.writeText(hash)
        toast.success("Copied hash to clipboard")
    }

    const { theme } = useAppSelector((state) => state.user);

    return (
        <Modal className={"p-5 rounded-lg lg:ml-[288px]" + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
            <div className={"rounded-lg relative modal-center " + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
                <p>
                    {!hash ? "Connecting client to IPFS. Please be patient." : "Your file is ready to be fetched on IPFS."}
                </p>
                {!hash ?
                    <>
                        <SpinnerMini />
                        <p className="text-center">Validating stream on IPFS...</p>
                    </>
                    :
                    <div className="w-full flex items-center justify-evenly p-2 my-2">
                        <button
                            className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                                + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                        >
                            <a className=" flex flex-row  items-center justify-center px-5 py-2.5" href={helloGateway + "/" + hash} target="_blank" >
                                <SiIpfs className="mr-3"></SiIpfs>View File
                            </a>
                        </button>
                        <button
                            className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                                + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                            onClick={copyHashHandler}
                        >
                            <span className=" flex flex-row  items-center justify-center px-5 py-2.5">
                                <SiIpfs className="mr-3"></SiIpfs>Copy Hash
                            </span>
                        </button>
                    </div>}
                <div className="flex items-end justify-end">
                    <button
                        className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                        onClick={onDismiss}>
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
