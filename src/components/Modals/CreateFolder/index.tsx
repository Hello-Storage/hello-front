import { Api } from "api";
import { Modal, useModal } from "components/Modal";
import { ChangeEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "state";
import { createFolderAction } from "state/mystorage/actions";

export default function CreateFolderModal() {
  const [, onDismiss] = useModal(<></>);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onChange: ChangeEventHandler = (e: any) => {
    setTitle(e.target.value);
  };

  const handleCreateNewFolder = () => {
    var root = "/";

    if (window.location.pathname.includes("/folder")) {
      root = window.location.pathname.split("/")[2];
    }
    setLoading(true);
    Api.post("/folder/create", { root, title })
      .then((resp) => {
        toast.success("folder created!");

        dispatch(createFolderAction(resp.data));
      })
      .catch((err) => {
        toast.error("failed!");
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
