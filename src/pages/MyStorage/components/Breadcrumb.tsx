import React from "react";
import { HiChevronRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "state";

export default function Breadcrumb() {
  const response = useAppSelector((state) => state.dashboard);
  const navigate = useNavigate();
  const onClick = (url: string) => {
    navigate(url);
  };
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xl font-medium">
        <li className="inline-flex items-center">
          <a
            onClick={() => onClick("/my-storage")}
            className="inline-flex items-center text-gray-700 hover:text-blue-600 cursor-pointer"
          >
            My Storage
          </a>
        </li>
        {response.path.map((v, i) => (
          <li key={i}>
            <div className="flex items-center">
              <HiChevronRight />
              <a
                onClick={() => onClick(`/folder/${v.uid}`)}
                className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2 cursor-pointer"
              >
                {v.title}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
