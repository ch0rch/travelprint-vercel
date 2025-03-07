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

// Estilos artísticos para la IA
const artStyles = [
  { id: "watercolor", name: "Acuarela", premium: false },
  { id: "vintage-postcard", name: "Postal Vintage", premium: false },
  { id: "pencil-sketch", name: "Dibujo a Lápiz", premium: false },
  { id: "digital-art", name: "Arte Digital", premium: true },
  { id: "oil-painting", name: "Pintura al Óleo", premium: true },
  { id: "minimalist", name: "Minimalista", premium: true },
  { id: "geometric", name: "Geométrico", premium: true },
  { id: "anime", name: "Estilo Anime", premium: true },
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

      // Crear el prompt para la IA
      const prompt = `
        Crea una hermosa ilustración de estampita de viaje en estilo ${getStyleDescription(selectedStyle)} 
        para un viaje llamado "${tripName}" 
        que recorre ${destinationNames}.
        ${tripDate ? `El viaje fue realizado en ${tripDate}.` : ""}
        ${tripComment ? `Contexto adicional del viaje: ${tripComment}` : ""}
        ${additionalPrompt ? `Detalles adicionales: ${additionalPrompt}` : ""}
        La ruta tiene aproximadamente ${distanceKm} kilómetros de distancia.
        Incluye elementos visuales que representen el paisaje y la cultura de la ruta.
        Formato cuadrado, con aspecto de estampita o sello de viaje.
      `

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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al generar la ilustración")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error("Error generando la ilustración:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al generar la ilustración")
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

  // Obtener descripción detallada del estilo para mejorar los resultados
  const getStyleDescription = (styleId: string) => {
    switch (styleId) {
      case "watercolor":
        return "acuarela con colores suaves y bordes difuminados"
      case "vintage-postcard":
        return "postal vintage con tipografías antiguas y colores envejecidos"
      case "pencil-sketch":
        return "dibujo a lápiz con trazos definidos y sombreado suave"
      case "digital-art":
        return "arte digital moderno con colores vibrantes"
      case "oil-painting":
        return "pintura al óleo con textura y pinceladas visibles"
      case "minimalist":
        return "minimalista con líneas simples y espacios negativos"
      case "geometric":
        return "geométrico con formas abstractas y patrones"
      case "anime":
        return "anime estilizado con colores brillantes y contornos definidos"
      default:
        return "acuarela artística"
    }
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
              <Label>Elige un estilo artístico</Label>
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
                <Label htmlFor="additional-prompt">Detalles adicionales (opcional)</Label>
                <Input
                  id="additional-prompt"
                  placeholder="Ej: 'Incluir montañas nevadas y un lago azul'"
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Añade detalles específicos que quieras incluir en la ilustración
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
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
                  Generando tu estampita...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Estampita Ilustrada
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
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt={`Estampita ilustrada de ${tripName}`}
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
                <span className="font-medium">Característica Premium:</span> Desbloquea la creación de estampitas
                ilustradas con IA en diferentes estilos artísticos. Convierte tus rutas en obras de arte únicas y
                personalizadas.
              </span>
            </p>
            <Button onClick={onOpenPremium} className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-700">
              <Crown className="h-4 w-4 mr-2" />
              Desbloquear Ilustraciones IA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



