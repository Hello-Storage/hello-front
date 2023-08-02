import { HTMLAttributes } from "react";

export default function Eth({ ...props }: HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="11"
      height="18"
      viewBox="0 0 11 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clip-path="url(#clip0_24_2316)">
        <path
          d="M5.62992 0.5L5.5127 0.88729V12.1256L5.62992 12.2393L10.9967 9.15573L5.62992 0.5Z"
          fill="#343434"
        />
        <path
          d="M5.63001 0.5L0.263184 9.15573L5.63001 12.2393V6.78462V0.5Z"
          fill="#8C8C8C"
        />
        <path
          d="M5.63002 13.227L5.56396 13.3053V17.3086L5.63002 17.4962L11.0001 10.145L5.63002 13.227Z"
          fill="#3C3C3B"
        />
        <path
          d="M5.63001 17.4961V13.227L0.263184 10.145L5.63001 17.4961Z"
          fill="#8C8C8C"
        />
        <path
          d="M5.63 12.2393L10.9967 9.15578L5.63 6.78467V12.2393Z"
          fill="#141414"
        />
        <path
          d="M0.263184 9.15572L5.62993 12.2393V6.78461L0.263184 9.15572Z"
          fill="#393939"
        />
      </g>
      <defs>
        <clipPath id="clip0_24_2316">
          <rect
            width="10.7368"
            height="17"
            fill="white"
            transform="translate(0.263184 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
