import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800";
    case "WARNING":
      return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800";
    case "LOW":
      return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-700";
  }
}

export function riskTypeLabel(type: string): string {
  switch (type) {
    case "STOCKOUT":
      return "Stockout Risk";
    case "EXCESS":
      return "Excess Inventory";
    case "SUPPLIER":
      return "Supplier Risk";
    default:
      return type;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "OPEN":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    case "ACKNOWLEDGED":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950";
    case "RESOLVED":
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950";
    default:
      return "";
  }
}
