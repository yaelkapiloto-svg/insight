import { clsx } from "clsx";

interface Props {
  percent: number;
  direction: "up" | "down" | "neutral";
  className?: string;
}

export function MetricChangePill({ percent, direction, className }: Props) {
  const isUp = direction === "up";
  const isDown = direction === "down";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-green-50 text-green-700": isUp,
          "bg-red-50 text-red-700": isDown,
          "bg-gray-100 text-gray-500": direction === "neutral",
        },
        className
      )}
    >
      {isUp ? "↑" : isDown ? "↓" : "–"}
      {Math.abs(percent)}%
    </span>
  );
}
