import { Api } from "api";
import { HiChevronRight } from "react-icons/hi";
import { FaFolder } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "state";
import { removeFileAction } from "state/mystorage/actions";
import { Theme } from "state/user/reducer";

export default function Breadcrumb() {
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
    const dragInfoReceived = JSON.parse(
      event.dataTransfer.getData("text/plain")
    );
    const dropInfo = {
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString(),
    };
    // check if array or single item
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

    // console.log("DragReceived: " + JSON.stringify(dragInfoReceived));
    // console.log("Drop: " + JSON.stringify(dropInfo));
    // if (dropInfo.id != dragInfoReceived.id) {
    //   const payload = {
    //     Id: dragInfoReceived.id,
    //     Uid: dragInfoReceived.uid,
    //     Root: dropInfo.uid
    //   };

    //   console.log("Sending payload:", payload);
    //   const type=dragInfoReceived.type;
    //   Api.put(`/${type}/update/root`, payload, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   })
    //     .then((res) => {
    //       console.log("Folder root updated:", res.data);
    //       fetchRootContent();
    //     })
    //     .catch((err) => {
    //       console.log("Error updating folder root:", err);
    //     });
    // }
  };

  const handleDropSingle = (
    event: React.DragEvent<HTMLLIElement>,
    payload: any,
    itemType: string
  ) => {

    console.log("Sending payload:", payload);
    Api.put(`/${itemType}/update/root`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("Folder root updated:", res.data);
        //dispatch the file uid removal
        dispatch(removeFileAction(payload.Uid));
      })
      .catch((err) => {
        console.log("Error updating folder root:", err);
      });
  };
  
	const {theme} = useAppSelector((state) => state.user);

  return (
    <nav className="flex flex-row items-center mr-2" aria-label="Breadcrumb">
      <ol className="flex flex-row items-center overflow-auto text-lg font-medium custom-scrollbar">
        <h3
          onClick={() => onClick("/space/my-storage")}
          className={"inline hover:text-blue-600 cursor-pointer text-xl min-w-[125px]"+ (theme===Theme.DARK? " text-white" : " text-gray-700")}
        >
          <strong className="whitespace-nowrap">My Storage</strong>
        </h3>
        {mystorage.path.map((v, i, array) => (
          <li onDrop={handleDrop} key={i} aria-label={v.uid}
            className={`min-w-fit flex items-center flex-nowrap 
            ${i === array.length - 1 ? 'mr-[50px]' : ''}`+ (theme===Theme.DARK? " text-gray-300" : " text-gray-700")}
          >
            <>
              <span className="h-full"> <HiChevronRight /></span>
              <a
                onClick={() => onClick(`/space/folder/${v.uid}`)}
                className="ml-1 cursor-pointer hover:text-blue-600 md:ml-2 forlder-path"
              >
                <FaFolder
                  className="inline-flex mr-2"
                  size={26}
                  color="#737373"
                />
                {v.title} 
              </a>
            </>
          </li>
        ))}
      </ol>
    </nav>
  );
}
