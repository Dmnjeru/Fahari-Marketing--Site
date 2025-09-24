import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card container — provides padding, rounded corners, and shadow.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * CardContent — section inside Card for content layout.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 md:p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardHeader — optional header for titles, actions, etc.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between p-4 md:p-6 border-b", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardFooter — optional footer for buttons, metadata, etc.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end p-4 md:p-6 border-t", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardHeader, CardFooter };
