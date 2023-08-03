import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { EncryptedIcon, PublicIcon } from "components";
import { Api, RootResponse } from "api";
import {
  HiDocumentDuplicate,
  HiFolder,
  HiDotsVertical,
  HiDocumentText,
  HiPhotograph,
} from "react-icons/hi";
import { formatBytes, formatUid } from "utils";

const constFolders = [
  {
    name: "Assets",
    uid: "0E70...270A",
    size: "10.6 MB",
    encryption: false,
    UpdatedAt: "2023-08-03T17:37:41.036027Z",
  },
  {
    name: "images",
    uid: "0A33...251J",
    size: "10.6 MB",
    encryption: false,
    UpdatedAt: "2023-08-03T17:37:41.036027Z",
  },
  {
    name: "Docs",
    uid: "2E33...556J",
    size: "10.6 MB",
    encryption: false,
    UpdatedAt: "2023-08-03T17:37:41.036027Z",
  },
];

const constFiles = [
  {
    name: "3d credit card.jpg",
    uid: "0A4T...937N",
    size: "244.92 KB",
    encryption: false,
    UpdatedAt: "2023-08-03T17:37:41.036027Z",
  },
  {
    name: "branding details.doc",
    uid: "0E73...887V",
    size: "1.3 MB",
    encryption: false,
    UpdatedAt: "2023-08-03T17:37:41.036027Z",
  },
];

dayjs.extend(relativeTime);

export default function Home() {
  const [response, setResponse] = useState<RootResponse>();

  const fetchContents = () => {
    Api.get<RootResponse>("/folder").then((res) => {
      console.log(res.data);
      setResponse(res.data);
    });
  };

  useEffect(() => {
    fetchContents();
  }, []);

  return (
    <div>
      <h1 className="text-xl">My Storage</h1>

      <div className="relative mt-3 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 ">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                CID
              </th>
              <th scope="col" className="px-6 py-3">
                Size
              </th>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                Last Modified
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b ">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-gray-100 rounded-md">
                    <HiFolder className="w-5 h-5" />
                  </div>
                  Assets
                </div>
              </th>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  0E70...270A
                  <HiDocumentDuplicate />
                </div>
              </td>
              <td className="px-6 py-4">10.6 MB</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <EncryptedIcon /> Encrypted
                </div>
              </td>
              <td className="px-6 py-4">1 days ago</td>
              <td className="px-6 py-4">
                <HiDotsVertical />
              </td>
            </tr>
            <tr className="bg-white border-b ">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-gray-100 rounded-md">
                    <HiFolder className="w-5 h-5" />
                  </div>
                  images
                </div>
              </th>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  0A33...251J
                  <HiDocumentDuplicate />
                </div>
              </td>
              <td className="px-6 py-4">1.3 GB</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <EncryptedIcon /> Encrypted
                </div>
              </td>
              <td className="px-6 py-4">2 days ago</td>
              <td className="px-6 py-4">
                <HiDotsVertical />
              </td>
            </tr>
            <tr className="bg-white border-b ">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-gray-100 rounded-md">
                    <HiFolder className="w-5 h-5" />
                  </div>
                  Docs
                </div>
              </th>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  2E33...556J
                  <HiDocumentDuplicate />
                </div>
              </td>
              <td className="px-6 py-4">150.9 MB</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <EncryptedIcon /> Encrypted
                </div>
              </td>
              <td className="px-6 py-4">3 days ago</td>
              <td className="px-6 py-4">
                <HiDotsVertical />
              </td>
            </tr>
            <tr className="bg-white border-b ">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-gray-100 rounded-md">
                    <HiPhotograph className="w-5 h-5" />
                  </div>
                  3d credit card.jpg
                </div>
              </th>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  0A4T...937N
                  <HiDocumentDuplicate />
                </div>
              </td>
              <td className="px-6 py-4">244.92 KB</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <PublicIcon /> Public
                </div>
              </td>
              <td className="px-6 py-4">8 days ago</td>
              <td className="px-6 py-4">
                <HiDotsVertical />
              </td>
            </tr>
            <tr className="bg-white ">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-gray-100 rounded-md">
                    <HiDocumentText className="w-5 h-5" />
                  </div>
                  branding details.doc
                </div>
              </th>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  0E73...887V
                  <HiDocumentDuplicate />
                </div>
              </td>
              <td className="px-6 py-4">1.3 MB</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <EncryptedIcon /> Encrypted
                </div>
              </td>
              <td className="px-6 py-4">15 days ago</td>
              <td className="px-6 py-4">
                <HiDotsVertical />
              </td>
            </tr>
            {response?.files.map((v, i) => (
              <tr className="bg-white" key={i}>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-gray-100 rounded-md">
                      <HiDocumentText className="w-5 h-5" />
                    </div>
                    {v.name}
                  </div>
                </th>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {formatUid(v.uid)}
                    <HiDocumentDuplicate />
                  </div>
                </td>
                <td className="px-6 py-4">{formatBytes(v.size)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <EncryptedIcon /> Encrypted
                  </div>
                </td>
                <td className="px-6 py-4">{dayjs(v.UpdatedAt).fromNow()}</td>
                <td className="px-6 py-4">
                  <HiDotsVertical />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
