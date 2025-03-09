import TravelStampGenerator from "@/components/travel-stamp-generator"
import { SiteFooter } from "@/components/site-footer"

export default function MapStampPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-amber-900 mb-6">Generador de Estampitas de Mapa</h1>
          <p className="text-amber-700 mb-8">
            Crea estampitas personalizadas basadas en tus rutas de viaje. Añade destinos, personaliza el estilo y
            descarga tu recuerdo de viaje.
          </p>

          <TravelStampGenerator />
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}

