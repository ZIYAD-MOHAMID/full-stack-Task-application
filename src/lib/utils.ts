import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  }
  if (isTomorrow(date)) {
    return "Tomorrow";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d, yyyy");
}

export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getPriorityColor(priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"): string {
  switch (priority) {
    case "LOW":
      return "text-gray-600 bg-gray-100";
    case "MEDIUM":
      return "text-blue-600 bg-blue-100";
    case "HIGH":
      return "text-orange-600 bg-orange-100";
    case "URGENT":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getStatusColor(status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"): string {
  switch (status) {
    case "PENDING":
      return "text-yellow-600 bg-yellow-100";
    case "IN_PROGRESS":
      return "text-blue-600 bg-blue-100";
    case "COMPLETED":
      return "text-green-600 bg-green-100";
    case "CANCELLED":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function isOverdue(dueDate: Date | null, status: string): boolean {
  if (!dueDate || status === "COMPLETED") return false;
  return new Date() > dueDate;
}

export function generateRandomColor(): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e",
  ];
  return colors[Math.floor(Math.random() * colors.length)] ?? "#6b7280";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
