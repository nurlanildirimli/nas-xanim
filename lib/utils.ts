import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const aznFormatter = {
  format(value: number) {
    return `${value.toFixed(2)} AZN`;
  },
};
