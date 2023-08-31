import { HTMLAttributes } from "react";
interface ProgressBarProps extends HTMLAttributes<HTMLElement> {
  percent: number;
  color?: string;
}

export default function ProgressBar({ percent, ...props }: ProgressBarProps) {
  return (
    <div className={["w-full rounded-full", props.className].join(" ")}>
      <div
        className={["h-full rounded-full", props.color ?? ""].join(" ")}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
