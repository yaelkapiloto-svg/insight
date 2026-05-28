import { clsx } from "clsx";

interface BadgeProps {
  variant?: "draft" | "published" | "neutral";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-yellow-50 text-yellow-700 border border-yellow-200": variant === "draft",
          "bg-green-50 text-green-700 border border-green-200": variant === "published",
          "bg-gray-100 text-gray-600": variant === "neutral",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
