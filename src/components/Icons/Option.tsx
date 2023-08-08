import { HTMLAttributes } from "react";

export default function Option({ ...props }: HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="31"
      height="32"
      viewBox="0 0 31 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.2087 23.976C15.8862 23.976 15.612 23.8631 15.3862 23.6373C15.1604 23.4115 15.0475 23.1374 15.0475 22.8148C15.0475 22.4922 15.1604 22.218 15.3862 21.9922C15.612 21.7665 15.8862 21.6536 16.2087 21.6536C16.5313 21.6536 16.8055 21.7665 17.0313 21.9922C17.2571 22.218 17.37 22.4922 17.37 22.8148C17.37 23.1374 17.2571 23.4115 17.0313 23.6373C16.8055 23.8631 16.5313 23.976 16.2087 23.976ZM16.2087 17.3957C15.8862 17.3957 15.612 17.2828 15.3862 17.057C15.1604 16.8312 15.0475 16.557 15.0475 16.2345C15.0475 15.9119 15.1604 15.6377 15.3862 15.4119C15.612 15.1861 15.8862 15.0732 16.2087 15.0732C16.5313 15.0732 16.8055 15.1861 17.0313 15.4119C17.2571 15.6377 17.37 15.9119 17.37 16.2345C17.37 16.557 17.2571 16.8312 17.0313 17.057C16.8055 17.2828 16.5313 17.3957 16.2087 17.3957ZM16.2087 10.8154C15.8862 10.8154 15.612 10.7025 15.3862 10.4767C15.1604 10.2509 15.0475 9.97669 15.0475 9.65412C15.0475 9.33156 15.1604 9.05738 15.3862 8.83158C15.612 8.60579 15.8862 8.49289 16.2087 8.49289C16.5313 8.49289 16.8055 8.60579 17.0313 8.83158C17.2571 9.05738 17.37 9.33156 17.37 9.65412C17.37 9.97669 17.2571 10.2509 17.0313 10.4767C16.8055 10.7025 16.5313 10.8154 16.2087 10.8154Z"
        fill="#272727"
      />
    </svg>
  );
}