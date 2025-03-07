import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"

export default function CartaDelCreador() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Elementos decorativos */}
          <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full border-4 border-amber-700 opacity-10" />
          <div className="absolute top-1/4 right-8 w-8 h-8 rounded-full border-4 border-amber-700 opacity-10" />

          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-8 relative">
            La historia detrás de TravelPrint.me
            <div className="h-1 w-20 bg-amber-500 mt-4"></div>
          </h1>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-amber-800 mb-4">Cómo nació una idea sobre dos ruedas</h2>

            <p className="text-amber-900 mb-4 leading-relaxed">
              Todo comenzó en los serpenteantes caminos del sur de Chile. Con el rugido de la moto como única compañía y
              más de 2.500 kilómetros recorridos, me encontré contemplando la inmensidad del paisaje cuando surgió la
              pregunta: ¿cómo podré recordar este viaje cuando solo queden las fotografías borrosas y las historias
              contadas una y otra vez?
            </p>

            <p className="text-amber-900 mb-4 leading-relaxed">
              Hay algo mágico en ver una ruta trazada sobre un mapa. Cada curva representa una decisión, cada punto un
              descubrimiento. Los mapas cuentan historias que las palabras no pueden expresar.
            </p>

            <p className="text-amber-900 mb-4 leading-relaxed">
              Así nació TravelPrint.me: de la necesidad de capturar no solo los destinos, sino también el camino entre
              ellos. Porque a veces, ese camino es tan importante como el lugar al que nos lleva.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-amber-800 mb-4">Un proyecto con alma viajera</h2>

            <p className="text-amber-900 mb-4 leading-relaxed">
              Soy Chorch, un emprendedor independiente que, como tú, vive para explorar nuevos horizontes. Creé esta
              herramienta pensando en todos nosotros: los motociclistas que desafiamos la ruta, las familias que crean
              recuerdos en cada viaje, los aventureros solitarios y los grupos de amigos que comparten kilómetros y
              experiencias.
            </p>

            <p className="text-amber-900 mb-4 leading-relaxed">
              TravelPrint.me es más que una aplicación web. Es mi forma de ayudar a que cada aventura cuente su
              historia, para que puedas guardarla, compartirla o incluso colgarla en la pared de tu habitación como un
              recordatorio de que hay un mundo allí fuera esperando por ti.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-amber-800 mb-4">Una ruta compartida</h2>

            <p className="text-amber-900 mb-4 leading-relaxed">
              La versión gratuita de TravelPrint.me siempre estará disponible para todos los viajeros. Si decides apoyar
              este proyecto con la versión premium, no solo estarás mejorando la calidad de tus estampitas – también
              estarás ayudando a mantener viva esta herramienta y, quizás, contribuyendo al tanque de combustible para
              mi próxima aventura. 😉
            </p>

            <p className="text-amber-900 mb-4 leading-relaxed">
              Porque los viajeros nos apoyamos entre nosotros. Porque entendemos que cada ruta merece ser recordada. Y
              porque sabemos que no es solo un viaje... es parte de quienes somos.
            </p>

            <p className="text-amber-900 mb-6 leading-relaxed font-medium">Gracias por ser parte de este camino.</p>
          </section>

          <div className="text-center mt-12 mb-6">
            <p className="text-xl text-amber-800 font-semibold mb-6">¿Listo para crear tu primera estampita?</p>

            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-lg py-6 px-8"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Creá tu estampita de mapa
              </Button>
            </Link>
          </div>

          {/* Firma */}
          <div className="text-center mt-16 opacity-70">
            <p className="text-sm text-amber-700">Escrito con ♥ desde algún lugar del camino</p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}



