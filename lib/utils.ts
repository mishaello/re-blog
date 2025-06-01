import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "щойно"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} хв тому`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} год тому`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} дн тому`
  }

  // Для старших дат показуємо повну дату
  return date.toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Новини: "border-blue-400/50 text-blue-300 bg-blue-500/10",
    Політика: "border-red-400/50 text-red-300 bg-red-500/10",
    Економіка: "border-green-400/50 text-green-300 bg-green-500/10",
    Культура: "border-purple-400/50 text-purple-300 bg-purple-500/10",
    Спорт: "border-orange-400/50 text-orange-300 bg-orange-500/10",
    Технології: "border-cyan-400/50 text-cyan-300 bg-cyan-500/10",
    Освіта: "border-indigo-400/50 text-indigo-300 bg-indigo-500/10",
    "Здоров'я": "border-pink-400/50 text-pink-300 bg-pink-500/10",
    Розваги: "border-yellow-400/50 text-yellow-300 bg-yellow-500/10",
    Інше: "border-gray-400/50 text-gray-300 bg-gray-500/10",
  }

  return colors[category] || colors["Інше"]
}
