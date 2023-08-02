import { HTMLAttributes } from "react";

export default function Moon({ ...props }: HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18.2929 13.2929C17.2886 13.7471 16.1738 13.9999 15 13.9999C10.5817 13.9999 7 10.4182 7 5.9999C7 4.82593 7.25287 3.71102 7.70712 2.70667C4.93137 3.96191 3 6.75526 3 9.9997C3 14.418 6.58172 17.9997 11 17.9997C14.2443 17.9997 17.0376 16.0685 18.2929 13.2929Z"
        fill="#4F566B"
      />
    </svg>
  );
}
