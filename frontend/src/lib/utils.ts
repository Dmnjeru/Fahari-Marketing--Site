import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind + conditional classes.
 * Example: cn("p-2", isActive && "bg-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
