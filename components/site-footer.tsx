import Link from "next/link"
import { Heart, Sparkles } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full py-4 border-t border-amber-200 bg-amber-50/50 mt-12">
      <div className="container mx-auto px-4 text-center text-sm text-amber-700">
        <p className="flex items-center justify-center gap-1 flex-wrap">
          TravelPrint.me fue creado con
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          por{" "}
          <Link
            href="https://x.com/jorjerojas"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-amber-900 underline underline-offset-2"
          >
            Chorch
          </Link>{" "}
          en algún lugar del camino.
        </p>
        <p className="mt-2 text-xs flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Convirtiendo recuerdos en arte con IA desde 2025
        </p>
      </div>
    </footer>
  )
}


