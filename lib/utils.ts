// Utility functions
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utility
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Check if date is overdue
export function isOverdue(dueDate: Date | string): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return new Date() > due
}

