"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Crown, Download, RefreshCw, Sparkles, ImageIcon, AlertCircle } from "lucide-react"
import Image from "next/image"
import { isPremiumUser } from "@/utils/premium-storage"

interface AIIllustratedStampProps {
  tripName: string
  destinations: { name: string; coordinates: [number, number] }[]
  tripDate?: string
  tripComment?: string
  onDownload: (imageUrl: string) => void
  onOpenPremium: () => void
}

// Estilos artísticos para la IA con descripciones mejoradas
const artStyles = [
  {
    id: "watercolor",
    name: "Acuarela",
    premium: false,
    description: "Estilo suave con colores difuminados",
  },
  {
    id: "vintage-postcard",
    name: "Postal Vintage",
    premium: false,
    description: "Como una postal de los años 60",
  },
  {
    id: "pencil-sketch",
    name: "Dibujo a Lápiz",
    premium: false,
    description: "Boceto de cuaderno de viaje",
  },
  {
    id: "digital-art",
    name: "Arte Digital",
    premium: true,
    description: "Moderno con colores vibrantes",
  },
  {
    id: "oil-painting",
    name: "Emblema Clásico",
    premium: true,
    description: "Estilo parque nacional americano",
  },
  {
    id: "minimalist",
    name: "Minimalista",
    premium: true,
    description: "Diseño simple y elegante",
  },
  {
    id: "geometric",
    name: "Geométrico",
    premium: true,
    description: "Formas abstractas y patrones",
  },
  {
    id: "anime",
    name: "Sticker Kawaii",
    premium: true,
    description: "Estilo anime colorido",
  },
]

export default function AIIllustratedStamp({
  tripName,
  destinations,
  tripDate,
  tripComment,
  onDownload,
  onOpenPremium,
}: AIIllustratedStampProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState("watercolor")
  const [creativity, setCreativity] = useState([0.7])
  const [additionalPrompt, setAdditionalPrompt] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPremium = isPremiumUser()

  // Función para generar la estampita ilustrada
  const generateIllustration = async () => {
    if (destinations.length < 2) return

    // Bloquear completamente la generación para usuarios no premium
    if (!isPremium) {
      onOpenPremium()
      return
    }

    setIsGenerating(true)
    setIsRegenerating(false)
    setError(null)

    try {
      // Construir la descripción geográfica y contextual del viaje
      const destinationNames = destinations.map((d) => d.name).join(", ")
      const distanceKm = calculateDistance(destinations)

      // Identificar el tipo de paisaje basado en los destinos (ejemplo simple)
      const landscapeType = identifyLandscapeType(destinations)

      // Crear el prompt para la IA
      const prompt = `
        Crea una estampita de viaje para "${tripName}" que recorre ${destinationNames}.
        
        Detalles del viaje:
        - Distancia: ${distanceKm} kilómetros
        - Fecha: ${tripDate || "No especificada"}
        - Tipo de paisaje: ${landscapeType}
        ${tripComment ? `- Historia del viaje: ${tripComment}` : ""}
        ${additionalPrompt ? `- Elementos a incluir: ${additionalPrompt}` : ""}
        
        El nombre "${tripName}" debe aparecer prominentemente en la estampita.
        Incluye elementos visuales que representen los destinos mencionados.
      `

      setError(null)
      console.log("Enviando solicitud para generar ilustración")

      // Llamada a la API de generación de imágenes
      const response = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          creativity: creativity[0],
          isPremium,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error respuesta API:", data)
        throw new Error(data.error || data.details || "Error al generar la ilustración")
      }

      if (!data.imageUrl) {
        throw new Error("No se recibió URL de imagen en la respuesta")
      }

      console.log("Imagen generada correctamente:", data.note || "OK")
      setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error("Error generando la ilustración:", error)

      // Mensaje de error más amigable y específico para el usuario
      let errorMessage = "Error desconocido al generar la ilustración"

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "Error de configuración: API key de OpenAI no configurada correctamente."
        } else if (error.message.includes("429")) {
          errorMessage = "Demasiadas solicitudes a la API de OpenAI. Por favor, intenta más tarde."
        } else if (error.message.includes("content policy")) {
          errorMessage = "El contenido solicitado no cumple con las políticas de contenido."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para regenerar con los mismos parámetros
  const regenerateIllustration = async () => {
    setIsRegenerating(true)
    await generateIllustration()
  }

  // Función para calcular la distancia aproximada entre destinos
  const calculateDistance = (destinations: { coordinates: [number, number] }[]) => {
    if (destinations.length < 2) return 0

    let totalDistance = 0
    for (let i = 0; i < destinations.length - 1; i++) {
      const from = destinations[i].coordinates
      const to = destinations[i + 1].coordinates

      // Cálculo aproximado de distancia usando la fórmula de Haversine
      const R = 6371 // Radio de la Tierra en km
      const dLat = ((to[1] - from[1]) * Math.PI) / 180
      const dLon = ((to[0] - from[0]) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((from[1] * Math.PI) / 180) *
          Math.cos((to[1] * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      totalDistance += distance
    }

    return Math.round(totalDistance)
  }

  // Función para identificar el tipo de paisaje basado en coordenadas
  // Esta es una implementación simple, podría mejorarse con datos reales
  const identifyLandscapeType = (destinations: { coordinates: [number, number] }[]) => {
    // Calcular el centro aproximado de los destinos
    let avgLat = 0
    let avgLng = 0

    destinations.forEach((dest) => {
      avgLat += dest.coordinates[1]
      avgLng += dest.coordinates[0]
    })

    avgLat /= destinations.length
    avgLng /= destinations.length

    // Identificación muy básica basada en coordenadas
    // En América del Sur
    if (avgLat < 0 && avgLng < -30) {
      if (avgLng < -70) return "montañoso con cordilleras"
      return "costero con playas"
    }
    // En Europa
    else if (avgLat > 35 && avgLat < 60 && avgLng > -10 && avgLng < 40) {
      return "europeo con ciudades históricas"
    }
    // En América del Norte
    else if (avgLat > 25 && avgLat < 50 && avgLng < -50) {
      return "bosques y lagos"
    }

    return "variado con múltiples ecosistemas"
  }

  // Obtener el estilo seleccionado
  const getSelectedStyleInfo = () => {
    return artStyles.find((style) => style.id === selectedStyle) || artStyles[0]
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-amber-500" />
            Estampita Ilustrada con IA
          </h3>
          {isPremium && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </span>
          )}
        </div>

        <Tabs defaultValue="style">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="style">Estilo</TabsTrigger>
            <TabsTrigger value="advanced">Opciones Avanzadas</TabsTrigger>
          </TabsList>

          <TabsContent value="style">
            <div className="space-y-4">
              <Label>Elige un estilo de souvenir</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {artStyles.map((style) => (
                  <div
                    key={style.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted 
                      ${selectedStyle === style.id ? "bg-muted ring-2 ring-amber-500" : ""} 
                      ${style.premium && !isPremium ? "opacity-60" : ""}`}
                    onClick={() => {
                      if (style.premium && !isPremium) {
                        onOpenPremium()
                      } else {
                        setSelectedStyle(style.id)
                      }
                    }}
                  >
                    <div className="text-center">
                      <span className="text-sm font-medium">{style.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                      {style.premium && (
                        <div className="flex items-center justify-center mt-1">
                          <Crown className="h-3 w-3 text-amber-500 mr-1" />
                          <span className="text-xs text-amber-500">Premium</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-4">
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

              <div>
                <Label htmlFor="additional-prompt">Elementos a incluir (opcional)</Label>
                <Input
                  id="additional-prompt"
                  placeholder="Ej: 'montañas nevadas, lago azul, carretera serpenteante'"
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Añade elementos específicos que quieras incluir en tu souvenir
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-medium mb-1">Error al generar el souvenir:</p>
              <p>{error}</p>
              <p className="mt-2 text-xs">Puedes intentar con otro estilo o volver a intentarlo más tarde.</p>
            </div>
          </div>
        )}

        <div className="mt-6">
          {!generatedImage ? (
            <Button
              onClick={generateIllustration}
              disabled={isGenerating || destinations.length < 2}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Generando tu souvenir...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Souvenir de Viaje
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
                      <p className="text-amber-700">Regenerando tu souvenir...</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt={`Souvenir ilustrado de ${tripName}`}
                    width={500}
                    height={500}
                    className="w-full h-auto"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={regenerateIllustration} disabled={isRegenerating} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
                <Button
                  onClick={() => onDownload(generatedImage)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isPremium && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm flex items-start">
              <Crown className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
              <span>
                <span className="font-medium">Característica Premium:</span> Desbloquea la creación de souvenires
                ilustrados con IA en diferentes estilos. Convierte tus rutas en recuerdos de viaje únicos y
                personalizados.
              </span>
            </p>
            <Button onClick={onOpenPremium} className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-700">
              <Crown className="h-4 w-4 mr-2" />
              Desbloquear Souvenires IA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}







