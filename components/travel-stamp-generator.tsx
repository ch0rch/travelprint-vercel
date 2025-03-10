"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crown, Download, MapPin, RefreshCw, Plus } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { isPremiumUser } from "@/utils/premium-storage"
import { getRemainingDays } from "@/utils/premium-storage"

// Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Inicializar Mapbox
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

interface Location {
  name: string
  coordinates: [number, number]
}

// Estilos de mapa disponibles
const mapStyles = [
  { id: "streets-v12", name: "Aventura", premium: false },
  { id: "outdoors-v12", name: "Naturaleza", premium: false },
  { id: "satellite-v9", name: "Satélite", premium: true },
  { id: "navigation-night-v1", name: "Nocturno", premium: true },
  { id: "light-v11", name: "Claro", premium: false },
  { id: "dark-v11", name: "Oscuro", premium: true },
]

export default function TravelStampGenerator() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mapStyle, setMapStyle] = useState("streets-v12")
  const [zoom, setZoom] = useState(4)
  const [location, setLocation] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [generatedMap, setGeneratedMap] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [mapCenter] = useState<[number, number]>([-70.6483, -33.4569])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [remainingDays, setRemainingDays] = useState(0)
  const [totalDistance, setTotalDistance] = useState(0)

  // Verificar estado premium
  useEffect(() => {
    setIsPremium(isPremiumUser())
    setRemainingDays(getRemainingDays())
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: mapCenter,
        zoom: zoom,
        attributionControl: false,
        preserveDrawingBuffer: true,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      map.current.on("load", () => {
        setIsMapLoaded(true)
        if (locations.length > 1) {
          updateRoute()
        }
      })
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Actualizar el estilo del mapa cuando cambia
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`)
    }
  }, [mapStyle])

  // Calcular distancia total
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateTotalDistance = (locationList: Location[]) => {
    if (locationList.length < 2) return 0
    let total = 0
    for (let i = 1; i < locationList.length; i++) {
      total += calculateDistance(
        locationList[i - 1].coordinates[1],
        locationList[i - 1].coordinates[0],
        locationList[i].coordinates[1],
        locationList[i].coordinates[0],
      )
    }
    return Math.round(total)
  }

  // Actualizar la ruta en el mapa
  const updateRoute = () => {
    if (!map.current || locations.length < 2) return

    const coordinates = locations.map((loc) => loc.coordinates)

    if (map.current.getLayer("route")) {
      map.current.removeLayer("route")
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route")
    }

    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      },
    })

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#F97316",
        "line-width": 3,
      },
    })

    const bounds = new mapboxgl.LngLatBounds()
    coordinates.forEach((coord) => bounds.extend(coord))
    map.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 15,
    })
  }

  // Buscar ubicación
  const searchLocation = async () => {
    if (!location.trim() || !MAPBOX_TOKEN) return
    setIsSearching(true)

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          location,
        )}.json?access_token=${MAPBOX_TOKEN}&limit=5`,
      )

      if (!response.ok) throw new Error("Error en la búsqueda")

      const data = await response.json()
      setSearchResults(data.features || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Añadir ubicación
  const addLocation = (result: any) => {
    if (!map.current) return

    const newLocation = {
      name: result.place_name,
      coordinates: result.center as [number, number],
    }

    const marker = new mapboxgl.Marker({ color: "#F97316" }).setLngLat(newLocation.coordinates).addTo(map.current)
    markersRef.current.push(marker)

    const newLocations = [...locations, newLocation]
    setLocations(newLocations)
    setTotalDistance(calculateTotalDistance(newLocations))
    setSearchResults([])
    setLocation("")

    if (newLocations.length > 1) {
      updateRoute()
    } else {
      map.current.flyTo({
        center: newLocation.coordinates,
        zoom: 10,
      })
    }
  }

  // Generar estampita
  const generateStamp = async () => {
    if (!map.current || !canvasRef.current) return
    setIsGenerating(true)

    try {
      const mapCanvas = map.current.getCanvas()
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const width = 1200
      const height = Math.round((width * 3) / 4)

      canvas.width = width
      canvas.height = height

      ctx.fillStyle = "#FFF7ED"
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(mapCanvas, 0, 0, width, height)

      setGeneratedMap(canvas.toDataURL("image/png"))
    } catch (error) {
      console.error("Error generating stamp:", error)

      // Fallback a API estática
      try {
        if (!locations.length || !MAPBOX_TOKEN) return

        const bounds = new mapboxgl.LngLatBounds()
        locations.forEach((loc) => bounds.extend(loc.coordinates))
        const [west, south, east, north] = bounds.toArray().flat()
        const path = locations.map((loc) => loc.coordinates.join(",")).join(";")

        const url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/path-3+f97316(${path})/[${west},${south},${east},${north}]/1200x900@2x?padding=50&access_token=${MAPBOX_TOKEN}`

        setGeneratedMap(url)
      } catch (fallbackError) {
        console.error("Error with static map fallback:", fallbackError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr,400px] gap-6">
      {/* Panel principal */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Generador de Estampitas</h2>

          {/* Buscador de destinos */}
          <div className="space-y-2">
            <Label>Añadir destino</Label>
            <div className="flex gap-2">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchLocation()}
                placeholder="Ej: Talca, Constitución, Concepción..."
              />
              <Button onClick={searchLocation} disabled={isSearching}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              También puedes hacer clic en el mapa para añadir destinos de forma precisa
            </p>
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg divide-y">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                  onClick={() => addLocation(result)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{result.text}</div>
                    <div className="text-sm text-muted-foreground">{result.place_name}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Mapa */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
            <div
              ref={mapContainer}
              className="absolute inset-0"
              style={{ visibility: isMapLoaded ? "visible" : "hidden" }}
            />
          </div>

          {/* Controles */}
          <Tabs defaultValue="style">
            <TabsList className="w-full">
              <TabsTrigger value="style">Estilo de Mapa</TabsTrigger>
              <TabsTrigger value="stamp">Estilo de Estampita</TabsTrigger>
              <TabsTrigger value="format">Formato</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4">
              <div className="space-y-2">
                <Label>Estilo de mapa</Label>
                <Select value={mapStyle} onValueChange={setMapStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    {mapStyles.map((style) => (
                      <SelectItem
                        key={style.id}
                        value={style.id}
                        disabled={style.premium && !isPremium}
                        className="flex items-center justify-between"
                      >
                        <span>{style.name}</span>
                        {style.premium && <Crown className="h-4 w-4 text-amber-500" />}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Panel lateral */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Vista Previa</h3>

          {/* Badge Premium */}
          {isPremium && (
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-sm font-medium border border-amber-200 flex items-center gap-1">
                <Crown className="h-4 w-4 text-amber-500" />
                Premium
              </div>
              <span className="text-sm text-muted-foreground">
                Tu suscripción premium expira el {new Date().toLocaleDateString()} ({remainingDays} días restantes)
              </span>
            </div>
          )}

          {/* Vista previa del mapa */}
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-4 flex items-center justify-center">
            {locations.length < 2 ? (
              <div className="text-center p-8">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <p className="text-amber-800 font-medium">Añade al menos dos destinos para generar tu estampita</p>
              </div>
            ) : generatedMap ? (
              <img
                src={generatedMap || "/placeholder.svg"}
                alt="Vista previa de la estampita"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Button
                  onClick={generateStamp}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-amber-500 to-amber-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar vista previa"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Botón de descarga */}
          <Button className="w-full flex items-center justify-center gap-2" disabled={!generatedMap} variant="outline">
            <Download className="h-4 w-4" />
            Descarga tu recuerdo
          </Button>
        </div>

        {/* Características Premium */}
        {!isPremium && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Características Premium
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-amber-500">✓</span>
                Formatos adicionales (vertical, horizontal, historia)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">✓</span>
                Estilos de mapa premium (satélite, nocturno)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">✓</span>
                Comentarios personalizados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">✓</span>
                Descarga sin marca de agua
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">✓</span>
                Alta resolución (4x)
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-700">
              <Crown className="h-4 w-4 mr-2" />
              Renovar premium ($5)
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}






























































































