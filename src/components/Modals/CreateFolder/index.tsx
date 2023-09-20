import { Api, EncryptionStatus } from "api";
import { Modal, useModal } from "components/Modal";
import { ChangeEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "state";
import { createFolderAction } from "state/mystorage/actions";
import { decrypt, decryptStr, encryptStr } from "utils";

export default function CreateFolderModal() {
  const [, onDismiss] = useModal(<></>);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { signature } = useAppSelector((state) => state.user);
  const { encryptionEnabled } = useAppSelector((state) => state.userdetail);

  const getRoot = () =>
    window.location.pathname.includes("/folder")
      ? window.location.pathname.split("/")[2]
      : "/";

  const onChange: ChangeEventHandler = (e: any) => {
    setTitle(e.target.value);
  };

  const handleCreateNewFolder = async () => {
    if (encryptionEnabled && signature === "") {
      toast.warning("need to config signature");
      return;
    }

    const root = getRoot();
    const titleForm = encryptionEnabled
      ? await encryptStr(title, signature)
      : title;
    const status = encryptionEnabled
      ? EncryptionStatus.Encrypted
      : EncryptionStatus.Public;

    setLoading(true);

    Api.post("/folder/create", {
      root: root,
      title: titleForm,
      status: status,
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
