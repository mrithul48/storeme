import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#070B24] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-4 py-2.5 rounded-xl gap-2",
      lg: "text-base px-6 py-3.5 rounded-2xl gap-2.5 font-semibold",
      icon: "p-2.5 rounded-xl aspect-square",
    };

    const variantStyles = {
      primary:
        "bg-[#4169E1] hover:bg-[#3458C7] text-[#F5F7FF] shadow-sm shadow-[#4169E1]/20 hover:shadow-md hover:shadow-[#4169E1]/30 focus:ring-[#638BFF] border border-[#638BFF]/30 font-semibold",
      secondary:
        "bg-[#172653] hover:bg-[#1C3066] text-[#F5F7FF] border border-[#202D55] focus:ring-[#638BFF]/40 font-medium",
      outline:
        "border border-[#202D55] bg-[#101A3D] hover:bg-[#172653] text-[#F5F7FF] hover:border-[#638BFF]/40 shadow-sm focus:ring-[#638BFF]/40 font-medium",
      ghost:
        "text-[#A5B2D1] hover:text-[#F5F7FF] hover:bg-[#172653] focus:ring-[#202D55] font-medium",
      danger:
        "bg-[#EF4444] hover:bg-red-700 text-white shadow-sm shadow-red-500/20 focus:ring-red-500 font-semibold",
      emerald:
        "bg-[#22C55E] hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25 focus:ring-emerald-500 font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
