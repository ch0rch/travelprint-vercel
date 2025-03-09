import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Sparkles } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      {/* Hero Section */}
      <HeroSection />

      {/* Product Selection Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-amber-900 mb-12">
          Elige cómo quieres crear tu recuerdo de viaje
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Map-Based Option */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-100 transition-transform hover:scale-105">
            <div className="h-48 bg-amber-100 flex items-center justify-center">
              <MapPin className="h-20 w-20 text-amber-500" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-2">Estampitas de Mapa</h3>
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Gratis
                </span>
              </div>
              <p className="text-amber-700 mb-6">
                Crea estampitas personalizadas basadas en mapas reales. Añade tus destinos, personaliza el estilo y
                descarga tu recuerdo de viaje.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-amber-800">Mapas interactivos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-amber-800">Múltiples destinos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-amber-800">Personalización básica</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-amber-800">Descarga con marca de agua</span>
                </li>
              </ul>
              <Link href="/mapa">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800">
                  <MapPin className="h-4 w-4 mr-2" />
                  Crear estampita de mapa
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium AI-Based Option */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-amber-300 transition-transform hover:scale-105">
            <div className="h-48 bg-gradient-to-r from-amber-200 to-amber-300 flex items-center justify-center">
              <Sparkles className="h-20 w-20 text-amber-700" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-2">Estampitas con IA</h3>
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Premium
                </span>
              </div>
              <p className="text-amber-700 mb-6">
                Transforma tus viajes en obras de arte únicas generadas con IA. Elige entre múltiples estilos artísticos
                y personaliza cada detalle.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">★</span>
                  <span className="text-amber-800">Ilustraciones artísticas con IA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">★</span>
                  <span className="text-amber-800">Múltiples estilos visuales</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">★</span>
                  <span className="text-amber-800">Alta resolución sin marca de agua</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">★</span>
                  <span className="text-amber-800">10 créditos por $10</span>
                </li>
              </ul>
              <Link href="/ia">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Crear estampita con IA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16 bg-amber-50 rounded-xl my-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-amber-900 mb-12">
          Lo que dicen nuestros viajeros
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="italic text-amber-700 mb-4">
              "Creé una estampita de mi viaje por la Patagonia y quedó increíble. La tengo como fondo de pantalla y
              siempre me trae buenos recuerdos."
            </p>
            <p className="font-medium text-amber-900">- María L.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="italic text-amber-700 mb-4">
              "Las estampitas con IA son impresionantes. Generé una en estilo acuarela de mi ruta por Europa y parece
              hecha por un artista profesional."
            </p>
            <p className="font-medium text-amber-900">- Carlos M.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="italic text-amber-700 mb-4">
              "Uso TravelPrint para documentar todas mis aventuras en moto. Es una forma única de recordar cada ruta y
              los paisajes que recorrí."
            </p>
            <p className="font-medium text-amber-900">- Juan P.</p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}










