import { HTMLAttributes } from "react";

export default function Image({ ...props }: HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14 12.6667V3.33333C14 2.6 13.4 2 12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667ZM5.66667 9L7.33333 11.0067L9.66667 8L12.6667 12H3.33333L5.66667 9Z"
        fill="#272727"
      />
    </svg>
  );
}
