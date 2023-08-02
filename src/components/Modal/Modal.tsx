import { HTMLAttributes } from "react";

export default function Modal({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["modal", className].join(" ")} {...props}>
      {props.children}
    </div>
  );
}
