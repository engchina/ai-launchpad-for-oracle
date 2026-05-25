import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@renderer/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-950 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
