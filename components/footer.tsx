import { Heart, Code } from "lucide-react"

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-16">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2 text-gray-400">
            <span>Створено з</span>
            <Heart className="h-4 w-4 text-red-400 animate-pulse" />
            <span>та</span>
            <Code className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>для спільноти</span>
          </div>
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} re-blog. Усі права захищено.</p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
    </footer>
  )
}
