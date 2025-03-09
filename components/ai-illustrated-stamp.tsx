"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Crown, Download, RefreshCw, Sparkles, ImageIcon, AlertCircle, Clock } from "lucide-react"
import { isPremiumUser } from "@/utils/premium-storage"
import OpenAIDiagnostics from "./openai-diagnostics"
import { getCurrentCredits, useCredits } from "@/utils/credits-storage"

interface AIIllustratedStampProps {
  tripName: string
  destinations: string[]
  tripComment?: string
  onDownload: (imageUrl: string) => void
  onOpenPremium: () => void
}

// Estilos artísticos para la IA con descripciones mejoradas
const artStyles = [
  {
    id: "vintage-emblem",
    name: "Emblema Vintage",
    description: "Estilo retro con bordes ornamentados",
    premium: false,
  },
  {
    id: "official-stamp",
    name: "Sello Oficial",
    description: "Inspirado en sellos de pasaporte",
    premium: false,
  },
  {
    id: "modern-postal",
    name: "Postal Moderna",
    description: "Diseño minimalista contemporáneo",
    premium: false,
  },
  {
    id: "national-park",
    name: "Parque Nacional",
    description: "Estilo emblema americano clásico",
    premium: true,
  },
  {
    id: "art-deco",
    name: "Art Déco",
    description: "Elegante con patrones geométricos",
    premium: true,
  },
  {
    id: "japanese",
    name: "Estilo Japonés",
    description: "Inspirado en sellos tradicionales",
    premium: true,
  },
]

// Ejemplos de ilustraciones para mostrar como inspiración
const inspirationExamples = [
  {
    style: "watercolor",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1631234567/travel-stamps/example_watercolor.jpg",
    title: "Ruta de los Lagos",
  },
  {
    style: "vintage-postcard",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1631234567/travel-stamps/example_vintage.jpg",
    title: "Costa Mediterránea",
  },
  {
    style: "pencil-sketch",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1631234567/travel-stamps/example_sketch.jpg",
    title: "Camino de Santiago",
  },
]

export default function AIIllustratedStamp({
  tripName,
  destinations,
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
  const [isTimeoutError, setIsTimeoutError] = useState(false)
  const [isPremium, setIsPremium] = useState(isPremiumUser())
  const [retryCount, setRetryCount] = useState(0)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [imageId, setImageId] = useState<string | null>(null)

  // Añadir estados para créditos
  const [currentCredits, setCurrentCredits] = useState(getCurrentCredits())
  const [insufficientCredits, setInsufficientCredits] = useState(false)

  // Actualizar créditos al cargar el componente
  useEffect(() => {
    setIsPremium(isPremiumUser())
    setCurrentCredits(getCurrentCredits())
  }, [])

  // Función para generar la estampita ilustrada
  const generateIllustration = async (retry = false) => {
    if (destinations.length < 2) {
      setError("Por favor, añade al menos dos destinos para generar una estampita.")
      return
    }

    // Bloquear completamente la generación para usuarios no premium
    if (!isPremium) {
      onOpenPremium()
      return
    }

    // Verificar si hay suficientes créditos
    const credits = getCurrentCredits()
    if (credits < 1) {
      setInsufficientCredits(true)
      return
    }

    setInsufficientCredits(false)
    setIsGenerating(true)
    setIsRegenerating(false)
    setError(null)
    setIsTimeoutError(false)

    // Si es un reintento, incrementar el contador
    if (retry) {
      setRetryCount((prev) => prev + 1)
    } else {
      setRetryCount(0)
    }

    // Si ya hemos intentado más de 2 veces, usar un prompt más corto
    const useSimplifiedPrompt = retryCount >= 2

    try {
      // Construir la descripción geográfica y contextual del viaje
      const destinationNames = destinations.join(", ")

      // Extraer solo los nombres de ciudades/países de los destinos
      const locationNames = destinations.join(", ")

      // Crear el prompt para la IA
      let prompt

      if (useSimplifiedPrompt) {
        // Versión muy simplificada para evitar tiempos de espera
        prompt = `Travel souvenir for "${tripName || "My Trip"}". Locations: ${locationNames}.`
      } else {
        prompt = `
  Create a travel souvenir illustration for "${tripName || "My Trip"}".
  
  Travel details:
  - Locations: ${locationNames}
  
  IMPORTANT INSTRUCTIONS:
  1. The title "${tripName || "My Trip"}" should be the ONLY text prominently displayed.
  2. DO NOT include any additional text or words in the illustration.
  3. Create a visual representation inspired by these locations and their landscapes.
  4. Use the following as inspiration for the mood and style (but don't include as text): ${tripComment || "A memorable journey"}
  5. Focus on creating iconic visual elements representing the destinations.
  
  ${additionalPrompt ? `Additional elements to include: ${additionalPrompt}` : ""}
  `
      }

      console.log("Enviando solicitud para generar ilustración")

      // Llamada a la API de generación de imágenes con un timestamp para evitar caché
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
          tripName: tripName || "My Trip",
          destinationNames,
          timestamp: Date.now(), // Añadir timestamp para evitar caché
        }),
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      // Verificar primero si la respuesta es válida
      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        console.log("Tipo de contenido de error:", contentType)

        // Intentar obtener el texto del error
        let errorText
        try {
          errorText = await response.text()
          console.log("Texto de error:", errorText)
        } catch (e) {
          errorText = "No se pudo leer la respuesta del servidor"
          console.error("Error al leer respuesta:", e)
        }

        // Verificar si es un error de tiempo de espera
        if (
          response.status === 504 ||
          errorText.includes("timeout") ||
          errorText.includes("FUNCTION_INVOCATION_TIMEOUT")
        ) {
          setIsTimeoutError(true)
          throw new Error(
            "La generación de la imagen está tardando demasiado tiempo. Por favor, intenta con un estilo diferente o simplifica tu solicitud.",
          )
        }

        // Intentar parsear como JSON si parece ser JSON
        let errorData
        if (contentType.includes("application/json") && errorText.trim().startsWith("{")) {
          try {
            errorData = JSON.parse(errorText)
            throw new Error(errorData.error || errorData.details || "Error al generar la ilustración")
          } catch (e) {
            // Si falla el parsing, usar el texto original
            throw new Error(`Error del servidor: ${response.status} - ${errorText.substring(0, 100)}`)
          }
        } else {
          throw new Error(`Error del servidor: ${response.status} - ${errorText.substring(0, 100)}`)
        }
      }

      // Ahora intentamos parsear el JSON con manejo de errores
      let data
      try {
        const responseText = await response.text()
        console.log("Texto de respuesta recibido, longitud:", responseText.length)
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error al parsear JSON:", e)
        throw new Error("Error al procesar la respuesta del servidor. La respuesta no es un JSON válido.")
      }

      console.log("Datos de respuesta recibidos:", data)

      if (!data.imageUrl) {
        console.error("No se recibió URL de imagen en la respuesta:", data)
        throw new Error("No se recibió URL de imagen en la respuesta")
      }

      console.log("Imagen generada correctamente:", data.imageUrl)
      setGeneratedImage(data.imageUrl)

      // Después de generar exitosamente, usar un crédito
      useCredits(1)
      setCurrentCredits(getCurrentCredits())

      // Si hay una nota de respaldo, mostrarla como advertencia
      if (data.note && data.note.includes("respaldo")) {
        setError(
          "Usando imagen de ejemplo debido a problemas con el servicio de IA. La imagen no es generada específicamente para tu ruta.",
        )
      }
    } catch (error) {
      console.error("Error generando la ilustración:", error)

      // Mensaje de error más amigable y específico para el usuario
      let errorMessage = "Error desconocido al generar la ilustración"

      if (error instanceof Error) {
        if (error.message.includes("JSON")) {
          errorMessage = "Error al procesar la respuesta del servidor. Por favor, intenta de nuevo."
        } else if (error.message.includes("API key")) {
          errorMessage = "Error de configuración: API key de OpenAI no configurada correctamente."
        } else if (error.message.includes("429")) {
          errorMessage = "Demasiadas solicitudes a la API de OpenAI. Por favor, intenta más tarde."
        } else if (error.message.includes("content policy")) {
          errorMessage = "El contenido solicitado no cumple con las políticas de contenido."
        } else if (
          error.message.includes("tiempo de espera") ||
          error.message.includes("timeout") ||
          error.message.includes("FUNCTION_INVOCATION_TIMEOUT")
        ) {
          setIsTimeoutError(true)
          errorMessage = "La generación está tardando demasiado. Estamos usando una imagen de ejemplo como alternativa."

          // Usar una imagen de ejemplo para este estilo
          const fallbackImageUrl = artStyles.find((s) => s.id === selectedStyle)?.id || "watercolor"
          setGeneratedImage(SAMPLE_IMAGES[fallbackImageUrl as keyof typeof SAMPLE_IMAGES] || SAMPLE_IMAGES.watercolor)
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
    // Verificar si hay suficientes créditos
    const credits = getCurrentCredits()
    if (credits < 1) {
      setInsufficientCredits(true)
      return
    }

    setIsRegenerating(true)
    await generateIllustration(true) // Pasar true para indicar que es un reintento
  }

  // Obtener el estilo seleccionado
  const getSelectedStyleInfo = () => {
    return artStyles.find((style) => style.id === selectedStyle) || artStyles[0]
  }

  // Imágenes de ejemplo para diferentes estilos (copia del servidor para respaldo en cliente)
  const SAMPLE_IMAGES = {
    watercolor: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop",
    "vintage-postcard": "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?q=80&w=1000&auto=format&fit=crop",
    "pencil-sketch": "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop",
    "digital-art": "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop",
    "oil-painting": "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop",
    minimalist: "https://images.unsplash.com/photo-1605106702734-205df224ecce?q=80&w=1000&auto=format&fit=crop",
    geometric: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
    anime: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-amber-500" />
            Souvenir Ilustrado con IA
          </h3>
          <div className="flex items-center gap-2">
            {isPremium && (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              {currentCredits} créditos
            </span>
          </div>
        </div>

        {/* Sección de inspiración - solo mostrar si no hay imagen generada aún */}
        {!generatedImage && !isGenerating && (
          <div className="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
              Transforma tu viaje en arte
            </h4>
            <p className="text-sm text-amber-700 mb-4">
              Nuestra IA creará un souvenir ilustrado único basado en tu ruta y destinos. Selecciona un estilo artístico
              para comenzar.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {inspirationExamples.map((example, index) => (
                <div key={index} className="rounded-lg overflow-hidden border border-amber-200">
                  <div className="aspect-square bg-amber-100 flex items-center justify-center text-xs text-amber-500">
                    [Imagen de ejemplo]
                  </div>
                  <div className="p-2 text-center bg-white">
                    <p className="text-xs font-medium text-amber-800">{example.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="style">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="style">Estilo</TabsTrigger>
            <TabsTrigger value="advanced">Opciones Avanzadas</TabsTrigger>
          </TabsList>

          <TabsContent value="style">
            <div className="space-y-4">
              <Label>Elige un estilo de souvenir</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              <p className="mt-2 text-xs">
                {isTimeoutError
                  ? "La generación está tardando demasiado. Prueba con un estilo más simple o menos detalles."
                  : "Puedes intentar con otro estilo o volver a intentarlo más tarde."}
              </p>
            </div>
          </div>
        )}

        {insufficientCredits && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Créditos insuficientes</p>
              <p className="text-sm text-amber-700">
                Necesitas al menos 1 crédito para generar una estampita con IA. Compra más créditos para continuar.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full text-xs"
            >
              {showDiagnostics ? "Ocultar diagnóstico" : "Mostrar diagnóstico técnico"}
            </Button>

            {showDiagnostics && (
              <div className="mt-2">
                <OpenAIDiagnostics />
              </div>
            )}
          </div>
        )}

        {isTimeoutError && generatedImage && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start">
            <Clock className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">Usando imagen de ejemplo</p>
              <p>
                Debido a problemas de tiempo de espera, estamos mostrando una imagen de ejemplo. Esta no es una imagen
                generada específicamente para tu ruta.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          {!generatedImage ? (
            <Button
              onClick={() => generateIllustration(false)}
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
                  Generar Souvenir de Viaje (1 crédito)
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
                  <div className="relative aspect-square">
                    {generatedImage && (
                      <img
                        src={generatedImage || "/placeholder.svg"}
                        alt={`Souvenir ilustrado de ${tripName}`}
                        className="w-full h-auto"
                        crossOrigin="anonymous"
                        loading="eager"
                        onError={(e) => {
                          console.error("Error al cargar la imagen:", e)
                          setError("Error al cargar la imagen generada. Por favor, intenta de nuevo.")
                          // Intentar cargar la imagen original si está disponible
                          const imgElement = e.target as HTMLImageElement
                          if (imgElement.src !== generatedImage) {
                            imgElement.src = generatedImage
                          }
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={regenerateIllustration}
                  disabled={isRegenerating || currentCredits < 1}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar (1 crédito)
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





































