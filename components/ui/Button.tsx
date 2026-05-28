"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]": variant === "primary",
          "bg-white text-[#1a1a2e] border border-[#e2e8f0] hover:bg-[#f8f8fb]": variant === "secondary",
          "text-[#1a1a2e] hover:bg-[#f0f0f5]": variant === "ghost",
          "bg-[#e94560] text-white hover:bg-[#c73550]": variant === "danger",
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2.5 text-sm": size === "md",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
