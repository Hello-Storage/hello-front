import { HTMLAttributes } from "react";

export default function Doc({ ...props }: HTMLAttributes<SVGElement>) {
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
        d="M13.6067 5.60667L10.3867 2.38667C10.14 2.14 9.8 2 9.44667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V6.55333C14 6.2 13.86 5.86 13.6067 5.60667ZM4.66667 4.66667H9.33333V6H4.66667V4.66667ZM11.3333 11.3333H4.66667V10H11.3333V11.3333ZM11.3333 8.66667H4.66667V7.33333H11.3333V8.66667Z"
        fill="#272727"
      />
    </svg>
  );
}
