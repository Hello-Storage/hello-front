import { HTMLAttributes } from "react";
interface ProgressCircleProps extends HTMLAttributes<HTMLElement> {
  percent: number;
}

export default function ProgressCircle({
  percent,
  ...props
}: ProgressCircleProps) {
  return (
    <div
      className={["rounded-full circle-progress", props.className].join(" ")}
      style={{
        background: `radial-gradient(closest-side, white 79%, transparent 80% 100%),conic-gradient(#34a853 ${percent}%, #d1d5db 0)`,
      }}
    ></div>
  );
}
