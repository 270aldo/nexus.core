import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string
 * Useful for conditional and dynamic class applications
 * 
 * @param inputs - Array of class values to be merged
 * @returns A string of merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
