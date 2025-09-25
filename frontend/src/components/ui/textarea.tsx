import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------- Types -------------------- */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Show error styling (e.g., for validation errors) */
  error?: boolean;
  /** Control whether resizing is allowed (default: "vertical") */
  resize?: "none" | "vertical" | "horizontal" | "both";
}

/* -------------------- Component -------------------- */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, resize = "vertical", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          "flex w-full min-h-[80px] rounded-md border bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          {
            "resize-none": resize === "none",
            "resize-y": resize === "vertical",
            "resize-x": resize === "horizontal",
            "resize": resize === "both",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
