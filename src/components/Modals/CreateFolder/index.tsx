import { Api, EncryptionStatus } from "api";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { Modal, useModal } from "components/Modal";
import { ChangeEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "state";
import { createFolderAction } from "state/mystorage/actions";
import { bufferToHex, encryptBuffer } from "utils/encryption/filesCipher";
import { useAuth } from "hooks";

export default function CreateFolderModal() {
  const [, onDismiss] = useModal(<></>);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { walletAddress } = useAppSelector((state) => state.user);
  const accountType = getAccountType();
  const { encryptionEnabled, autoEncryptionEnabled } = useAppSelector(
    (state) => state.userdetail
  );
  const {logout} = useAuth();

  const getRoot = () =>
    window.location.pathname.includes("/folder")
      ? window.location.pathname.split("/")[2]
      : "/";

  const onChange: ChangeEventHandler = (e: any) => {
    setTitle(e.target.value);
  };

  const handleCreateNewFolder = async () => {
    const root = getRoot();
    let titleFinal = title;

    let encryption_status = EncryptionStatus.Public;

    setLoading(true);
    if (encryptionEnabled) {
      const personalSignature = await getPersonalSignature(
        walletAddress,
        autoEncryptionEnabled,
        accountType,
        logout
      );
      const encryptedTitleBuffer = await encryptBuffer(
        new TextEncoder().encode(title),
        personalSignature
      );
      if (!encryptedTitleBuffer) {
        toast.error("Failed to encrypt buffer");
        return null;
      }
      titleFinal = bufferToHex(encryptedTitleBuffer);
      encryption_status = EncryptionStatus.Encrypted;
    }
    Api.post("/folder/create", {
      root: root,
      title: titleFinal,
      encryption_status: encryption_status,
    })
      .then((resp) => {
        toast.success("folder created!");
        if (encryptionEnabled) {
          dispatch(createFolderAction({ ...resp.data, title: title }));
        } else {
          dispatch(createFolderAction(resp.data));
        }
      })
      .catch((err) => {
        toast.error("failed!");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
        onDismiss();
      });
  };
  return (
    <Modal className="p-5 bg-white rounded-lg w-80">
      <label className="text-xl">New Folder</label>
      <div className="mt-3">
        <input
          type="text"
          className="lock w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:outline-none"
          placeholder="input folder name"
          value={title}
          onChange={onChange}
        />
      </div>

      <div className="text-right mt-3">
        <button
          type="button"
          className="text-blue-700 bg-transparent hover:bg-gray-200 focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
          disabled={loading}
          onClick={onDismiss}
        >
          Cancel
        </button>
        <button
          type="button"
          className="text-blue-700 bg-transparent hover:bg-gray-200 focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
          disabled={loading}
          onClick={handleCreateNewFolder}
        >
          Create
        </button>
      </div>
    </Modal>
  );
}
