import React from "react";

interface StackedBarProps {
  data: {
    color: string;
    percent: number;
  }[];
}

export default function StackedBar({ data }: StackedBarProps) {
  return (
    <span className="bg-gray-100 flex overflow-hidden h-5 rounded-md gap-1 mt-2">
      {data.map((v, i) => (
        <span
          key={i}
          style={{ backgroundColor: v.color, width: `${v.percent}%` }}
        />
      ))}
    </span>
  );
}
