import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------- Types -------------------- */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional badge variant for different use cases */
  variant?: "default" | "success" | "warning" | "error" | "info";
  /** Content inside the badge */
  children?: React.ReactNode;
}

/* -------------------- Component -------------------- */
export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
