import { Button } from "@/components/ui/button"
import { Crown, MapPin } from "lucide-react"
import Link from "next/link"

// Rutas codificadas en formato polyline para Mapbox
const exampleRoutes = [
  {
    id: 1,
    title: "Ruta de los Lagos",
    description: "Recorriendo los lagos del sur de Chile, desde Pucón hasta Puerto Varas",
    distance: "320 km",
    locations: ["Pucón", "Villarrica", "Puerto Varas"],
    // Mapa con marcadores más grandes y línea que conecta los puntos
    image:
      "https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/path-5+e05d37-0.8(%7DrpFbgiiMl%40jy%40xdAruBvcE)/pin-l+e05d37(-71.954,-39.272),pin-l+e05d37(-72.228,-39.536),pin-l+e05d37(-72.983,-41.319)/-72.2,-40.2,6.5/500x300@2x?access_token=pk.eyJ1Ijoiam9yamVyb2phcyIsImEiOiJjbTd2eG42bXYwMTNlMm1vcWRycWpicmRhIn0.hDwomrUtCTWGe0gtLHil2Q",
  },
  {
    id: 2,
    title: "Ruta del Vino",
    description: "Un viaje por los valles vinícolas desde Casablanca hasta Santa Cruz",
    distance: "245 km",
    locations: ["Casablanca", "San Fernando", "Santa Cruz"],
    // Mapa con marcadores más grandes y línea que conecta los puntos
    image:
      "https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/path-5+e05d37-0.8(ynrFhvfkMtcBnuDfgA%7CqC)/pin-l+e05d37(-71.409,-33.319),pin-l+e05d37(-70.987,-34.583),pin-l+e05d37(-71.365,-34.639)/-71.2,-34,7/500x300@2x?access_token=pk.eyJ1Ijoiam9yamVyb2phcyIsImEiOiJjbTd2eG42bXYwMTNlMm1vcWRycWpicmRhIn0.hDwomrUtCTWGe0gtLHil2Q",
  },
]

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
        <div className="max-w-4xl mx-auto text-center">
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

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
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

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {exampleRoutes.map((route) => (
              <div
                key={route.id}
                className="rounded-lg border-2 border-amber-200 bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={route.image || "/placeholder.svg"}
                    alt={`Mapa de ${route.title}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center text-xs font-medium bg-amber-500 text-white rounded-full px-2.5 py-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {route.distance}
                    </div>
                  </div>

                  {/* Overlay para explicar el producto */}
                  <div className="absolute top-2 right-2 bg-white/90 rounded px-2 py-1 text-xs text-amber-800 font-medium border border-amber-200">
                    Ruta personalizada
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-amber-900 text-lg mb-2">{route.title}</h3>
                  <p className="text-amber-700 text-sm mb-3">{route.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {route.locations.map((location, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-amber-700 text-sm mt-6 max-w-lg mx-auto">
            Selecciona tus destinos, personaliza el estilo y descarga tu estampita para compartir tus aventuras con el
            mundo.
          </p>
        </div>
      </div>
    </div>
  )
}







