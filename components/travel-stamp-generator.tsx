"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Download, RefreshCw, Share2 } from "lucide-react"
import { checkPurchaseFromURL } from "@/utils/lemonsqueezy-utils"
import { verifyAndSavePremiumStatus } from "@/utils/premium-storage"
import { isPremiumUser } from "@/utils/premium-storage"

export default function TravelStampGenerator() {
  const [mapStyle, setMapStyle] = useState("streets-v11")
  const [stampStyle, setStampStyle] = useState("classic")
  const [stampColor, setStampColor] = useState("#B45309") // Amber-700
  const [zoom, setZoom] = useState([12])
  const [location, setLocation] = useState("")
  const [locations, setLocations] = useState<{ name: string; coordinates: [number, number] }[]>([])
  const [generatedMap, setGeneratedMap] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  // Verificar si hay una licencia en la URL al cargar
  useEffect(() => {
    try {
      const result = checkPurchaseFromURL()
      if (result.isValid && result.licenseKey) {
        // Activar la licencia
        verifyAndSavePremiumStatus(result.licenseKey)
          .then((success) => {
            if (success) {
              console.log("Licencia activada correctamente")
              // Actualizar el estado premium
              setIsPremium(isPremiumUser())
            }
          })
          .catch((error) => {
            console.error("Error al activar licencia:", error)
          })
      }
    } catch (error) {
      console.error("Error al verificar licencia en URL:", error)
    }
  }, [])

  // Función para añadir una ubicación
  const addLocation = () => {
    if (!location.trim()) return

    // En una implementación real, aquí se haría una llamada a una API de geocodificación
    // Para este ejemplo, usamos coordenadas aleatorias
    const randomLat = 40 + Math.random() * 10
    const randomLng = -5 + Math.random() * 10

    setLocations([
      ...locations,
      {
        name: location,
        coordinates: [randomLng, randomLat],
      },
    ])
    setLocation("")
  }

  // Función para eliminar una ubicación
  const removeLocation = (index: number) => {
    const newLocations = [...locations]
    newLocations.splice(index, 1)
    setLocations(newLocations)
  }

  // Función para generar el mapa
  const generateMap = () => {
    if (locations.length === 0) return

    setIsGenerating(true)

    // Simulación de generación de mapa
    setTimeout(() => {
      // En una implementación real, aquí se generaría el mapa con las ubicaciones
      setGeneratedMap("/placeholder.svg?height=500&width=500")
      setIsGenerating(false)
    }, 1500)
  }

  // Función para descargar el mapa
  const downloadMap = () => {
    if (!generatedMap) return

    // Crear un enlace temporal y descargar la imagen
    const link = document.createElement("a")
    link.href = generatedMap
    link.download = "mapa-viaje.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Añadir Destinos</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Barcelona, España"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLocation()
                    }
                  }}
                />
                <Button onClick={addLocation}>Añadir</Button>
              </div>
            </div>

            {locations.length > 0 && (
              <div>
                <Label>Destinos añadidos</Label>
                <div className="mt-1 space-y-2">
                  {locations.map((loc, index) => (
                    <div key={index} className="flex items-center justify-between bg-amber-50 p-2 rounded">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 text-amber-500 mr-2" />
                        {loc.name}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => removeLocation(index)} className="h-8 w-8 p-0">
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Personalización</h2>

          <Tabs defaultValue="style">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="style">Estilo</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            </TabsList>

            <TabsContent value="style">
              <div className="space-y-4">
                <div>
                  <Label>Estilo de Mapa</Label>
                  <Select value={mapStyle} onValueChange={setMapStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streets-v11">Calles</SelectItem>
                      <SelectItem value="outdoors-v11">Exteriores</SelectItem>
                      <SelectItem value="light-v10">Claro</SelectItem>
                      <SelectItem value="dark-v10">Oscuro</SelectItem>
                      <SelectItem value="satellite-v9">Satélite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estilo de Estampita</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {["classic", "modern", "vintage"].map((style) => (
                      <div
                        key={style}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted 
                          ${stampStyle === style ? "bg-muted ring-2 ring-amber-500" : ""}`}
                        onClick={() => setStampStyle(style)}
                      >
                        <div className="text-center">
                          <span className="text-sm font-medium capitalize">{style}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="color">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stamp-color">Color de Estampita</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="color"
                      id="stamp-color"
                      value={stampColor}
                      onChange={(e) => setStampColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium">{stampColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zoom" className="flex items-center justify-between">
                    <span>Nivel de Zoom</span>
                    <span className="text-sm text-muted-foreground">{zoom[0]}</span>
                  </Label>
                  <Slider
                    id="zoom"
                    defaultValue={zoom}
                    min={5}
                    max={18}
                    step={1}
                    onValueChange={setZoom}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={generateMap}
          disabled={locations.length === 0 || isGenerating}
          className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
        >
          {isGenerating ? "Generando..." : "Generar Estampita de Mapa"}
        </Button>
      </div>

      {generatedMap && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Tu Estampita de Mapa</h2>

            <div className="border-2 border-amber-200 rounded-lg overflow-hidden max-w-md mx-auto mb-4">
              <img
                src={generatedMap || "/placeholder.svg"}
                alt="Estampita de mapa generada"
                className="w-full h-auto"
              />
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setGeneratedMap(null)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
              <Button onClick={downloadMap} className="bg-gradient-to-r from-amber-500 to-amber-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


















































































