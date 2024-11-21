import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Funzione che unisce le classi con clsx e le ottimizza con twMerge
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
