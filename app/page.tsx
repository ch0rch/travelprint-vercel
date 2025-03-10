import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Sparkles, Globe, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700">
          Recuerdos de Viaje con IA
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Crea hermosas estampitas de tus viajes generadas por inteligencia artificial. Personaliza, descarga y comparte
          tus recuerdos en segundos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-amber-700">
            <Link href="/ia">
              Crear Estampita con IA
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-amber-100">
            <CardContent className="pt-8">
              <div className="rounded-full bg-amber-100 w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Describe tu viaje</h3>
              <p className="text-muted-foreground">
                Cuéntanos sobre tu destino, experiencias y momentos especiales que quieres recordar.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-100">
            <CardContent className="pt-8">
              <div className="rounded-full bg-amber-100 w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Genera con IA</h3>
              <p className="text-muted-foreground">
                Nuestra IA creará una hermosa ilustración personalizada basada en tu descripción.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-100">
            <CardContent className="pt-8">
              <div className="rounded-full bg-amber-100 w-12 h-12 flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Descarga y comparte</h3>
              <p className="text-muted-foreground">
                Descarga tu estampita en alta resolución y compártela en redes sociales o imprímela.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Examples Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Ejemplos de estampitas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src={`/placeholder.svg?height=400&width=600&text=Ejemplo ${i}`}
                alt={`Ejemplo de estampita ${i}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-white">
                <h3 className="font-medium">
                  Viaje a {["París", "Tokio", "Nueva York", "Machu Picchu", "Santorini", "Bali"][i - 1]}
                </h3>
                <p className="text-sm text-muted-foreground">Estampita generada con IA</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/ia">
              Crea tu propia estampita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros usuarios</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-8">
              <p className="italic mb-4">
                "¡Increíble! La IA capturó perfectamente la esencia de mi viaje a Japón. La estampita quedó tan bonita
                que la imprimí y enmarqué."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center mr-3">
                  <span className="font-medium text-amber-800">MC</span>
                </div>
                <div>
                  <p className="font-medium">María Castillo</p>
                  <p className="text-sm text-muted-foreground">Viajera entusiasta</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-8">
              <p className="italic mb-4">
                "Generar estampitas de mis viajes se ha convertido en mi tradición. La calidad de las ilustraciones es
                impresionante y el proceso es muy sencillo."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center mr-3">
                  <span className="font-medium text-amber-800">JR</span>
                </div>
                <div>
                  <p className="font-medium">Juan Rodríguez</p>
                  <p className="text-sm text-muted-foreground">Fotógrafo de viajes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-amber-50 to-orange-50 p-12 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">¿Listo para crear tu recuerdo de viaje?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Convierte tus experiencias de viaje en hermosas ilustraciones que podrás atesorar para siempre.
        </p>
        <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-amber-700">
          <Link href="/ia">
            Crear mi estampita ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  )
}












