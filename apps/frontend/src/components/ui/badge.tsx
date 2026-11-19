import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 font-semibold",
    warning: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 font-semibold",
    danger: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 font-semibold",
    info: "bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30 font-semibold",
    neutral: "bg-[#172653] text-[#A5B2D1] border-[#202D55] font-medium",
    purple: "bg-[#638BFF]/15 text-[#638BFF] border-[#638BFF]/30 font-medium",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 rounded-full border",
    md: "text-sm px-3 py-1 rounded-full border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
