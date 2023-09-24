import { Api } from "api";
import { HiChevronRight, HiFolder } from "react-icons/hi";
import { FaFolder } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "state";
import { useFetchData } from "hooks";

export default function Breadcrumb() {
  const { fetchRootContent } = useFetchData();
  const mystorage = useAppSelector((state) => state.mystorage);
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
    // console.log("DragReceived: " + JSON.stringify(dragInfoReceived));
    // console.log("Drop: " + JSON.stringify(dropInfo));

    console.log("Sending payload:", payload);
    Api.put(`/${itemType}/update/root`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("Folder root updated:", res.data);
        fetchRootContent();
      })
      .catch((err) => {
        console.log("Error updating folder root:", err);
      });
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xl font-medium">
        <li
          className="inline-flex items-center"
          onDrop={handleDrop}
          aria-label={"/"}
        >
          <a
            onClick={() => onClick("/my-storage")}
            className="inline-flex items-center text-gray-700 hover:text-blue-600 cursor-pointer"
          >
            My Storage
          </a>
        </li>
        {mystorage.path.map((v, i) => (
          <li onDrop={handleDrop} key={i} aria-label={v.uid}>
            <div className="flex items-center">
              <HiChevronRight />
              <a
                onClick={() => onClick(`/folder/${v.uid}`)}
                className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2 cursor-pointer"
              >
                <FaFolder
                  className="inline-flex mr-2"
                  size={26}
                  color="#737373"
                />
                {v.title}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
