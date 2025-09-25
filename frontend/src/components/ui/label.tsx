import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------- Types -------------------- */
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Apply error styling (e.g., when validation fails) */
  error?: boolean;
  /** Label content */
  children?: React.ReactNode;
}

/* -------------------- Component -------------------- */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, error = false, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-red-600",
          className
        )}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
