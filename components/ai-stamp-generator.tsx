"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Download, RefreshCw, Sparkles, AlertCircle } from "lucide-react"
import { getCurrentCredits, useCredits } from "@/utils/credits-storage"

// Estilos artísticos para la IA con descripciones mejoradas
const artStyles = [
  {
    id: "watercolor",
    name: "Acuarela",
    description: "Estilo suave con colores difuminados",
  },
  {
    id: "vintage-postcard",
    name: "Postal Vintage",
    description: "Estilo retro de los años 60",
  },
  {
    id: "pencil-sketch",
    name: "Boceto a Lápiz",
    description: "Estilo de diario de viaje",
  },
  {
    id: "digital-art",
    name: "Arte Digital",
    description: "Estilo moderno con colores vibrantes",
  },
  {
    id: "oil-painting",
    name: "Pintura al Óleo",
    description: "Estilo clásico con textura",
  },
  {
    id: "minimalist",
    name: "Minimalista",
    description: "Diseño simple con líneas limpias",
  },
]

export default function AIStampGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState("watercolor")
  const [creativity, setCreativity] = useState([0.7])
  const [tripName, setTripName] = useState("")
  const [tripDescription, setTripDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [inputMethod, setInputMethod] = useState("text")
  const [destinations, setDestinations] = useState<string[]>([])
  const [newDestination, setNewDestination] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentCredits, setCurrentCredits] = useState(getCurrentCredits())
  const [insufficientCredits, setInsufficientCredits] = useState(false)

  // Función para añadir un destino
  const addDestination = () => {
    if (newDestination.trim()) {
      setDestinations([...destinations, newDestination.trim()])
      setNewDestination("")
    }
  }

  // Función para eliminar un destino
  const removeDestination = (index: number) => {
    const newDestinations = [...destinations]
    newDestinations.splice(index, 1)
    setDestinations(newDestinations)
  }

  // Función para generar la estampita ilustrada
  const generateIllustration = async (regenerate = false) => {
    // Verificar si hay suficientes créditos
    const credits = getCurrentCredits()
    if (credits < 1) {
      setInsufficientCredits(true)
      return
    }

    // Validar entrada
    if (inputMethod === "text" && !tripDescription) {
      setError("Por favor, describe tu viaje para generar una ilustración")
      return
    }

    if (inputMethod === "destinations" && destinations.length < 1) {
      setError("Por favor, añade al menos un destino para generar una ilustración")
      return
    }

    if (!tripName) {
      setError("Por favor, ingresa un nombre para tu viaje")
      return
    }

    setIsGenerating(true)
    setIsRegenerating(regenerate)
    setError(null)

    try {
      // Construir el prompt para la IA
      let prompt

      if (inputMethod === "text") {
        prompt = `Viaje: "${tripName}". Descripción: ${tripDescription}`
      } else {
        prompt = `Viaje: "${tripName}". Destinos: ${destinations.join(", ")}`
      }

      // Simulación de llamada a la API (en producción, esto sería una llamada real)
      // En una implementación real, esto sería una llamada a la API de generación de imágenes
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Usar un crédito
      useCredits(1)
      setCurrentCredits(getCurrentCredits())

      // Imágenes de ejemplo para diferentes estilos (para simulación)
      const SAMPLE_IMAGES = {
        watercolor: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop",
        "vintage-postcard":
          "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?q=80&w=1000&auto=format&fit=crop",
        "pencil-sketch":
          "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop",
        "digital-art": "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop",
        "oil-painting": "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop",
        minimalist: "https://images.unsplash.com/photo-1605106702734-205df224ecce?q=80&w=1000&auto=format&fit=crop",
      }

      // Usar la imagen de ejemplo correspondiente al estilo seleccionado
      const imageUrl = SAMPLE_IMAGES[selectedStyle as keyof typeof SAMPLE_IMAGES] || SAMPLE_IMAGES.watercolor

      setGeneratedImage(imageUrl)
    } catch (error) {
      console.error("Error generando la ilustración:", error)
      setError("Hubo un error al generar la ilustración. Por favor, intenta de nuevo.")
    } finally {
      setIsGenerating(false)
      setIsRegenerating(false)
    }
  }

  // Función para descargar la imagen generada
  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `${tripName.replace(/\s+/g, "-").toLowerCase()}-ilustracion.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" onValueChange={setInputMethod}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="text">Describir mi viaje</TabsTrigger>
          <TabsTrigger value="destinations">Usar destinos</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <div className="space-y-4">
            <div>
              <Label htmlFor="trip-name">Nombre del viaje</Label>
              <Input
                id="trip-name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Ej: Ruta de los Lagos"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="trip-description">Describe tu viaje</Label>
              <Textarea
                id="trip-description"
                value={tripDescription}
                onChange={(e) => setTripDescription(e.target.value)}
                placeholder="Describe los lugares que visitaste, paisajes, experiencias, sensaciones..."
                className="mt-1 min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cuantos más detalles proporciones, mejor será la ilustración generada.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="destinations">
          <div className="space-y-4">
            <div>
              <Label htmlFor="trip-name">Nombre del viaje</Label>
              <Input
                id="trip-name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Ej: Ruta de los Lagos"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destination">Añadir destino</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="destination"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="Ej: París, Francia"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addDestination()
                    }
                  }}
                />
                <Button onClick={addDestination}>Añadir</Button>
              </div>
            </div>

            {destinations.length > 0 && (
              <div>
                <Label>Destinos añadidos</Label>
                <div className="mt-1 space-y-2">
                  {destinations.map((dest, index) => (
                    <div key={index} className="flex items-center justify-between bg-amber-50 p-2 rounded">
                      <span>{dest}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDestination(index)}
                        className="h-8 w-8 p-0"
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t border-amber-200 pt-6">
        <h3 className="text-lg font-medium mb-4">Personalización</h3>

        <div className="space-y-4">
          <div>
            <Label>Estilo artístico</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {artStyles.map((style) => (
                <div
                  key={style.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted 
                    ${selectedStyle === style.id ? "bg-muted ring-2 ring-amber-500" : ""}`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <div className="text-center">
                    <span className="text-sm font-medium">{style.name}</span>
                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="creativity" className="flex items-center justify-between">
              <span>Creatividad</span>
              <span className="text-sm text-muted-foreground">{Math.round(creativity[0] * 100)}%</span>
            </Label>
            <Slider
              id="creativity"
              defaultValue={creativity}
              max={1}
              step={0.1}
              onValueChange={setCreativity}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Menos creatividad = más precisión geográfica. Más creatividad = más artístico.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {insufficientCredits && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Créditos insuficientes</p>
            <p className="text-sm text-amber-700">
              Necesitas al menos 1 crédito para generar una estampita con IA. Compra más créditos para continuar.
            </p>
          </div>
        </div>
      )}

      <div className="pt-4">
        {!generatedImage ? (
          <Button
            onClick={() => generateIllustration(false)}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Generando tu estampita...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Estampita (1 crédito)
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-amber-200 rounded-lg overflow-hidden max-w-md mx-auto">
              {isRegenerating ? (
                <div className="aspect-square bg-amber-50 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 mx-auto text-amber-500 animate-pulse mb-2" />
                    <p className="text-amber-700">Regenerando tu estampita...</p>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-square">
                  {generatedImage && (
                    <img
                      src={generatedImage || "/placeholder.svg"}
                      alt={`Estampita ilustrada de ${tripName}`}
                      className="w-full h-auto"
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => generateIllustration(true)}
                disabled={isRegenerating || currentCredits < 1}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar (1 crédito)
              </Button>
              <Button onClick={downloadImage} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

