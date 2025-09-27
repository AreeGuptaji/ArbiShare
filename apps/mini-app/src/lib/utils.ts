import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

export function formatPercentage(value: number): string {
  const formatted = (value * 100).toFixed(1);
  return `${value >= 0 ? "+" : ""}${formatted}%`;
}

export function formatChange(value: number): string {
  const formatted = value.toFixed(1);
  return `${value >= 0 ? "+" : ""}${formatted}%`;
}
