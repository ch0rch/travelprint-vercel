import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100 py-16 md:py-24">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-amber-700" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full border-4 border-amber-700" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full border-4 border-amber-700" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-amber-900 mb-4 leading-tight">
            Convierte tus aventuras en recuerdos tangibles
          </h1>

          <h2 className="text-xl md:text-2xl text-amber-800 mb-6">
            Transforma tus rutas de viaje en estampitas personalizadas que cuentan tu historia
          </h2>

          <p className="text-amber-700 mb-8 max-w-2xl mx-auto">
            Cada viaje traza un camino único sobre el mapa del mundo. TravelPrint.me te permite capturar esas rutas
            especiales en hermosas estampitas personalizadas que podrás guardar, compartir o coleccionar. Porque los
            kilómetros recorridos merecen ser celebrados.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white"
              asChild
            >
              <Link href="#generator">Crea tu primera estampita gratis →</Link>
            </Button>

            <Button size="lg" variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-100" asChild>
              <Link href="#premium">
                <Crown className="h-4 w-4 mr-2" />
                Descubre Premium
              </Link>
            </Button>
          </div>

          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-amber-50 to-transparent z-10 h-8 bottom-0 top-auto"></div>
            <div className="flex justify-center gap-4 overflow-x-auto pb-8 px-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-64 rounded-lg border-2 border-amber-200 bg-white shadow-lg overflow-hidden"
                >
                  <div className="h-36 bg-amber-100 flex items-center justify-center">
                    <img
                      src={`/placeholder.svg?height=144&width=192&text=Ejemplo ${i}`}
                      alt={`Ejemplo de estampita ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-amber-900 text-sm">Ruta de Aventura {i}</h3>
                    <p className="text-amber-700 text-xs mt-1">Un recuerdo especial de tu viaje por la naturaleza</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

