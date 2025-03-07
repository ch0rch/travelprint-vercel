import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"
import {
  DollarSign,
  Globe,
  RefreshCw,
  BarChart3,
  Wallet,
  Palette,
  UserPlus,
  Users,
  Camera,
  Bike,
  Smartphone,
  PenTool,
} from "lucide-react"

export default function ProgramaAfiliados() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Elementos decorativos */}
          <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full border-4 border-amber-700 opacity-10" />
          <div className="absolute top-1/4 right-8 w-8 h-8 rounded-full border-4 border-amber-700 opacity-10" />

          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-8 relative">
            Programa de Afiliados TravelPrint.me
            <div className="h-1 w-20 bg-amber-500 mt-4"></div>
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-amber-800 mb-6 text-center">
              Viaja más, gana más: Conviértete en afiliado de TravelPrint.me
            </h2>

            <p className="text-amber-900 mb-6 leading-relaxed text-lg">
              Únete a la comunidad de viajeros que no solo comparten aventuras, sino que también obtienen ingresos
              reales haciéndolo. Como afiliado de TravelPrint.me, ganarás el 50% de cada venta que generes, ayudando a
              otros viajeros a crear recuerdos tangibles mientras financias tus propias aventuras.
            </p>
          </section>

          <section className="mb-12 bg-amber-50 rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-amber-800 mb-6">Para quién es ideal</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Camera className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">Creadores de contenido de viajes</h3>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <PenTool className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">Bloggers y vloggers de aventuras</h3>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Smartphone className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">Influencers en redes sociales</h3>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Bike className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">Comunidades de motociclistas y viajeros</h3>
                </div>
              </div>

              <div className="flex items-start space-x-3 md:col-span-2">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">
                    Cualquier persona con pasión por viajar y una audiencia que comparta ese interés
                  </h3>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-amber-800 mb-6">Beneficios destacados</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900">Comisiones generosas</h3>
                </div>
                <p className="text-amber-800">
                  Gana el 50% de cada venta generada a través de tu enlace de afiliado. Sin techos ni límites.
                </p>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <Globe className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900">Producto fácil de promocionar</h3>
                </div>
                <p className="text-amber-800">
                  Un servicio único que resuena con cualquier viajero: la creación de estampitas personalizadas de sus
                  rutas.
                </p>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <RefreshCw className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900">Compras recurrentes</h3>
                </div>
                <p className="text-amber-800">
                  Los viajeros vuelven con cada nueva aventura, generando ingresos continuos para ti.
                </p>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900">Panel de control intuitivo</h3>
                </div>
                <p className="text-amber-800">
                  Monitorea tus estadísticas, ventas y comisiones en tiempo real en un dashboard fácil de usar.
                </p>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <Wallet className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900">Pagos puntuales</h3>
                </div>
                <p className="text-amber-800">
                  Recibe tus ganancias mensualmente a través de PayPal, transferencia bancaria o criptomonedas.
                </p>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <Palette className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900">Materiales de marketing</h3>
                </div>
                <p className="text-amber-800">
                  Accede a banners, textos promocionales e imágenes de muestra para facilitar tus campañas.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-amber-800 mb-6">Cómo funciona</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-lg mb-1">Regístrate como afiliado</h3>
                  <p className="text-amber-800">Completa un formulario simple para unirte al programa</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-lg mb-1">Recibe tu enlace único</h3>
                  <p className="text-amber-800">Obtén tu URL personalizada con código de seguimiento</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-lg mb-1">Comparte con tu audiencia</h3>
                  <p className="text-amber-800">Promociona TravelPrint.me en tus canales</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-lg mb-1">Rastrea tus resultados</h3>
                  <p className="text-amber-800">Monitorea conversiones y ganancias en tiempo real</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-lg mb-1">Cobra tus comisiones</h3>
                  <p className="text-amber-800">Recibe el 50% de cada venta que generes</p>
                </div>
              </div>
            </div>
          </section>

          <div className="text-center mt-12 mb-6">
            <p className="text-xl text-amber-800 font-semibold mb-6">
              ¿Listo para empezar a ganar mientras compartes tu pasión por viajar?
            </p>

            <a href="https://travelprint.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-lg py-6 px-8"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Únete al programa de afiliados
              </Button>
            </a>
          </div>

          {/* Información adicional */}
          <div className="mt-12 bg-amber-50 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-amber-900 mb-3">¿Tienes preguntas sobre el programa?</h3>
            <p className="text-amber-800 mb-4">
              Contáctanos en{" "}
              <a href="mailto:hi@travelprint.me" className="text-amber-600 underline">
                hi@travelprint.me
              </a>{" "}
              y te responderemos a la brevedad.
            </p>
          </div>

          {/* Firma */}
          <div className="text-center mt-16 opacity-70">
            <p className="text-sm text-amber-700">Viaja. Comparte. Gana.</p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}

