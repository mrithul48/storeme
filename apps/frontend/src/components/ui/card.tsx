import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isCustomOrTransparent =
    className?.includes("bg-transparent") ||
    className?.includes("border-0 sm:border") ||
    className?.includes("p-0 sm:p-6");

  return (
    <div
      className={cn(
        "text-[#F5F7FF] transition-all",
        !isCustomOrTransparent &&
          "rounded-2xl border border-[#202D55] bg-[#101A3D] p-6 shadow-sm shadow-black/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-[#202D55] bg-[#080D28] px-4 py-2 text-sm text-[#F5F7FF] placeholder:text-[#7181A8] focus:outline-none focus:ring-2 focus:ring-[#638BFF]/25 focus:border-[#638BFF] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#070B24] shadow-sm",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[100px] w-full rounded-xl border border-[#202D55] bg-[#080D28] p-4 text-sm text-[#F5F7FF] placeholder:text-[#7181A8] focus:outline-none focus:ring-2 focus:ring-[#638BFF]/25 focus:border-[#638BFF] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#070B24] shadow-sm",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
