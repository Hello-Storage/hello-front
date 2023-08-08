import { HTMLAttributes } from "react";

export default function Share({ ...props }: HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.26646 7.69998H4.823C4.89437 6.46286 5.12992 5.32323 5.49325 4.4058C4.33411 5.11705 3.5002 6.30676 3.26646 7.69998ZM8.0001 2.09998C4.46548 2.09998 1.6001 4.96535 1.6001 8.49998C1.6001 12.0346 4.46548 14.9 8.0001 14.9C11.5347 14.9 14.4001 12.0346 14.4001 8.49998C14.4001 4.96535 11.5347 2.09998 8.0001 2.09998ZM8.0001 3.69998C7.93926 3.69998 7.81439 3.72536 7.62786 3.90945C7.43788 4.09694 7.23011 4.4079 7.03836 4.85531C6.72741 5.58086 6.50002 6.56844 6.42599 7.69998H9.5742C9.50017 6.56844 9.27279 5.58086 8.96184 4.85531C8.77009 4.4079 8.56231 4.09694 8.37234 3.90945C8.1858 3.72536 8.06094 3.69998 8.0001 3.69998ZM11.1772 7.69998C11.1058 6.46286 10.8703 5.32323 10.5069 4.4058C11.6661 5.11705 12.5 6.30676 12.7337 7.69998H11.1772ZM9.5742 9.29998H6.42599C6.50002 10.4315 6.72741 11.4191 7.03836 12.1446C7.23011 12.5921 7.43788 12.903 7.62786 13.0905C7.81439 13.2746 7.93926 13.3 8.0001 13.3C8.06094 13.3 8.1858 13.2746 8.37234 13.0905C8.56231 12.903 8.77009 12.5921 8.96184 12.1446C9.27279 11.4191 9.50017 10.4315 9.5742 9.29998ZM10.5069 12.5942C10.8703 11.6767 11.1058 10.5371 11.1772 9.29998H12.7337C12.5 10.6932 11.6661 11.8829 10.5069 12.5942ZM5.49325 12.5942C5.12992 11.6767 4.89437 10.5371 4.823 9.29998H3.26646C3.5002 10.6932 4.33411 11.8829 5.49325 12.5942Z"
        fill="#272727"
      />
    </svg>
  );
}