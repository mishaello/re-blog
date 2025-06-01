"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold neon-text">404</h1>
          <h2 className="text-3xl font-bold text-white">Сторінку не знайдено</h2>
          <p className="text-xl text-gray-400 max-w-md mx-auto">
            Вибачте, але сторінка, яку ви шукаете, не існує або була видалена.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="web3-button">
              <Home className="h-4 w-4 mr-2" />
              На головну
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="glass border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Декоративні елементи */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  )
}
