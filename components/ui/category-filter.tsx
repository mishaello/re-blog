"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, Tag } from "lucide-react"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory?: string
}

// Функція для отримання кольору категорії
function getCategoryColor(category: string) {
  const colors: { [key: string]: string } = {
    Новини: "border-blue-400/50 text-blue-300 hover:bg-blue-500/20",
    Політика: "border-red-400/50 text-red-300 hover:bg-red-500/20",
    Економіка: "border-green-400/50 text-green-300 hover:bg-green-500/20",
    Культура: "border-purple-400/50 text-purple-300 hover:bg-purple-500/20",
    Спорт: "border-orange-400/50 text-orange-300 hover:bg-orange-500/20",
    Технології: "border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20",
    Освіта: "border-indigo-400/50 text-indigo-300 hover:bg-indigo-500/20",
    "Здоров'я": "border-pink-400/50 text-pink-300 hover:bg-pink-500/20",
    Розваги: "border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20",
    Інше: "border-gray-400/50 text-gray-300 hover:bg-gray-500/20",
  }
  return colors[category] || "border-gray-400/50 text-gray-300 hover:bg-gray-500/20"
}

export default function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }

    const queryString = params.toString()
    const url = queryString ? `/?${queryString}` : "/"

    router.push(url)
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Фільтр за категоріями</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Кнопка "Всі" */}
        <Button
          variant={!selectedCategory || selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange("all")}
          className={
            !selectedCategory || selectedCategory === "all"
              ? "web3-button"
              : "border-gray-400/50 text-gray-300 hover:bg-gray-500/20 hover:text-white transition-all duration-300"
          }
        >
          Всі категорії
        </Button>

        {/* Кнопки категорій */}
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className={`
              cursor-pointer transition-all duration-300 px-3 py-2 text-sm
              ${getCategoryColor(category)}
              ${
                selectedCategory === category
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20"
                  : ""
              }
            `}
            onClick={() => handleCategoryChange(category)}
          >
            <Tag className="h-3 w-3 mr-1" />
            {category}
          </Badge>
        ))}
      </div>

      {selectedCategory && selectedCategory !== "all" && (
        <div className="text-sm text-gray-400 mt-3">
          Показано пости в категорії: <span className="text-cyan-300 font-medium">{selectedCategory}</span>
        </div>
      )}
    </div>
  )
}
