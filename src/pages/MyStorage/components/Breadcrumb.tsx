import language from "languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";
import { Api } from "api";
import { HiChevronRight } from "react-icons/hi";
import { FaFolder } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "state";
import { removeFileAction, removeFolder } from "state/mystorage/actions";
import { Theme } from "state/user/reducer";
import { getRoot } from "utils/upload/filesUpload";
import { toast } from "react-toastify";

export default function Breadcrumb() {
  const {lang} = useLanguage()
  const mystorage = useAppSelector((state) => state.mystorage);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onClick = (url: string) => {
    navigate(url);
  };
  type itemInfo = {
    type: string;
    id: string;
    uid: string;
  };

  const handleDrop = (event: React.DragEvent<HTMLLIElement>) => {
    // Llamar a index de content para tener selected items y a partir de ahi hacer el update
    event.preventDefault();
    toast.dismiss()
    const dragInfoReceived = JSON.parse(
      event.dataTransfer.getData("text/plain")
    );
    const dropInfo = {
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString(),
    };

    //if trying to drop on the same folder
    if (dropInfo.uid == getRoot()) {
      // console.log("Same folder");
      toast.error("Cannot drop on the same folder");
      return;
    }

    // Check if selectedItems is empty

    if (dragInfoReceived.length === undefined) {
      if (dropInfo.id == dragInfoReceived.id) {
        //
        // Comprobar tambien en selectedItems
        // console.log("Same folder");
        return;
      }
      // If empty, handle drop as normal
      const payload = {
        Id: dragInfoReceived.id,
        Uid: dragInfoReceived.uid,
        Root: dropInfo.uid,
      };
      handleDropSingle(event, payload, dragInfoReceived.type);
    } else {
      // If not empty, handle drop as batch

      // Check if the drop target is one of the selected items
      if (dragInfoReceived.some((item: itemInfo) => item.id === dropInfo.id)) {
        // console.log("Drop target is one of the selected items");
        return;
      }
      dragInfoReceived.forEach((item: itemInfo) => {
        const payload = {
          Id: item.id,
          Uid: item.uid,
          Root: dropInfo.uid,
        };
        handleDropSingle(event, payload, item.type);
      });
    }
  };

  const handleDropSingle = (
    event: React.DragEvent<HTMLLIElement>,
    payload: any,
    itemType: string
  ) => {
    toast.info("Moving to folder...");
    Api.put(`/${itemType}/update/root`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        toast.dismiss();
        toast.success("Item moved to folder");
        //dispatch the file/folder uid removal
        if(itemType === "folder"){
          dispatch(removeFolder(payload.Uid));
        }else{
          dispatch(removeFileAction(payload.Uid));
        }
      })
      .catch((err) => {
        toast.dismiss();
        toast.error("Error moving item to folder");
        console.log("Error updating folder root:", err);
      });
  };

  const { theme } = useAppSelector((state) => state.user);

  return (
    <nav className="flex flex-auto max-w-fit overflow-auto whitespace-nowrap flex-row items-center mr-2" aria-label="Breadcrumb">
      <ol className="flex flex-row items-center text-lg font-medium whitespace-nowrap invisible-scrollbar ">
        <li onDrop={handleDrop}
         aria-label={"/"}
         className="min-w-[125px]"
        >
          <button
            onClick={() => onClick("/space/my-storage")}
            className={"inline hover:text-blue-600 cursor-pointer text-xl min-w-[125px]" + (theme === Theme.DARK ? " text-white" : " text-gray-700")}
          >
                                                {/* My Storage */}
            <strong className="whitespace-nowrap">{language[lang]["15"]}</strong>
          </button>
        </li>
        {mystorage.path.map((v, i, array) => (
          <li onDrop={handleDrop} key={i} aria-label={v.uid}
            className={`min-w-fit flex items-center flex-nowrap 
            ${i === array.length - 1 ? 'mr-[50px]' : ''}` + (theme === Theme.DARK ? " text-gray-300" : " text-gray-700")}
          >
            <span className="h-full"> <HiChevronRight /></span>
            <button
              onClick={() => onClick(`/space/folder/${v.uid}`)}
              className="ml-1 cursor-pointer hover:text-blue-600 md:ml-2 forlder-path"
            >
              <FaFolder
                className="inline-flex mr-2"
                size={26}
                color="#737373"
              />
              {v.title}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
