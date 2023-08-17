import React from "react";
import { HiChevronRight } from "react-icons/hi";
import { useAppSelector } from "state";

export default function Breadcrumb() {
  const response = useAppSelector((state) => state.dashboard);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xl font-medium">
        <li className="inline-flex items-center">
          <a
            href="/my-storage"
            className="inline-flex items-center font-medium text-gray-700 hover:text-blue-600"
          >
            My Storage
          </a>
        </li>
        {response.path.map((v, i) => (
          <li key={i}>
            <div className="flex items-center">
              <HiChevronRight />
              <a
                href={`/folder/${v.uid}`}
                className="ml-1 font-medium text-gray-700 hover:text-blue-600 md:ml-2"
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
