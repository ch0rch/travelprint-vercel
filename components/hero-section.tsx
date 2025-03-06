import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100 py-20 md:py-32">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-amber-700" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full border-4 border-amber-700" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full border-4 border-amber-700" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight">
            Convierte tus aventuras en recuerdos tangibles
          </h1>

          <h2 className="text-xl md:text-2xl text-amber-800 mb-8">
            Transforma tus rutas de viaje en estampitas personalizadas que cuentan tu historia
          </h2>

          <p className="text-amber-700 mb-10 max-w-2xl mx-auto text-lg">
            Cada viaje traza un camino único sobre el mapa del mundo. TravelPrint.me te permite capturar esas rutas
            especiales en hermosas estampitas personalizadas que podrás guardar, compartir o coleccionar. Porque los
            kilómetros recorridos merecen ser celebrados.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-lg py-6"
              asChild
            >
              <Link href="#generator">Crea tu primera estampita gratis →</Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-amber-600 text-amber-700 hover:bg-amber-100 text-lg py-6"
              asChild
            >
              <Link href="#premium">
                <Crown className="h-5 w-5 mr-2" />
                Descubre Premium
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}









