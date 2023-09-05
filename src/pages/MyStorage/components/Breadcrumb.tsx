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

  const handleDrop = (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    let dragInfoReceived = JSON.parse(event.dataTransfer.getData("text/plain"));
    let dropInfo = {
      id: event.currentTarget.id.toString(),
      uid: event.currentTarget.ariaLabel?.toString(),
    };
    console.log("DragReceived: " + JSON.stringify(dragInfoReceived));
    console.log("Drop: " + JSON.stringify(dropInfo));
    if (dropInfo.id != dragInfoReceived.id) {
      const payload = {
        Id: dragInfoReceived.id,
        Uid: dragInfoReceived.uid,
        Root: dropInfo.uid
      };

      console.log("Sending payload:", payload);
      const type=dragInfoReceived.type;
      Api.put(`/${type}/update/root`, payload, {
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
    }
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xl font-medium">
        <li className="inline-flex items-center"  onDrop={handleDrop} aria-label={"/"}>
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



