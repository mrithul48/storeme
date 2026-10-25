import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/40 text-slate-900 transition-all",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
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
      "flex min-h-[100px] w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
