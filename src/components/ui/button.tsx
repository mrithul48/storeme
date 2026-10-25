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
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-4 py-2.5 rounded-xl gap-2",
      lg: "text-base px-6 py-3.5 rounded-2xl gap-2.5 font-semibold",
      icon: "p-2.5 rounded-xl aspect-square",
    };

    const variantStyles = {
      primary:
        "bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 focus:ring-blue-500 border border-blue-600 font-semibold pointer",
      secondary:
        "bg-slate-100 hover:bg-slate-200/90 text-[#0F172A] border border-slate-200 focus:ring-slate-400 font-medium",
      outline:
        "border border-slate-200 bg-white hover:bg-slate-50 text-[#0F172A] hover:border-slate-300 shadow-sm focus:ring-blue-500 font-medium",
      ghost:
        "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 focus:ring-slate-300 font-medium",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500 font-semibold",
      emerald:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25 focus:ring-emerald-500 font-semibold",
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
