"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Download, X, Plus, Search, Square, Maximize, AlignJustify } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

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

type StampFormat = "square" | "rectangle" | "story"

export default function TravelStampGenerator() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-v9")
  const [zoom, setZoom] = useState(4)
  const [location, setLocation] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [generatedMap, setGeneratedMap] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [tripTitle, setTripTitle] = useState("")
  const [tripDate, setTripDate] = useState("")
  const [tripComment, setTripComment] = useState("")
  const [totalDistance, setTotalDistance] = useState(0)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-70.6483, -33.4569])
  const [stampFormat, setStampFormat] = useState<StampFormat>("rectangle")
  const [markerColor] = useState("#F97316")
  const [routeColor] = useState("#F97316")
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
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
      map.current.setStyle(mapStyle)
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
        "line-color": routeColor,
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

    const marker = new mapboxgl.Marker({ color: markerColor }).setLngLat(newLocation.coordinates).addTo(map.current)
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

  // Eliminar ubicación
  const removeLocation = (index: number) => {
    if (markersRef.current[index]) {
      markersRef.current[index].remove()
      markersRef.current.splice(index, 1)
    }

    const newLocations = [...locations]
    newLocations.splice(index, 1)
    setLocations(newLocations)
    setTotalDistance(calculateTotalDistance(newLocations))

    if (newLocations.length > 1) {
      updateRoute()
    } else if (map.current) {
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route")
        map.current.removeSource("route")
      }

      if (newLocations.length === 1) {
        map.current.flyTo({
          center: newLocations[0].coordinates,
          zoom: 10,
        })
      } else {
        map.current.flyTo({
          center: mapCenter,
          zoom: zoom,
        })
      }
    }
  }

  // Generar estampita
  const generateStamp = async () => {
    if (!map.current || !canvasRef.current) return
    setIsGenerating(true)

    try {
      // Obtener el canvas del mapa
      const mapCanvas = map.current.getCanvas()
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Configurar tamaño del canvas según el formato
      const width = 1200
      const height =
        stampFormat === "square"
          ? width
          : stampFormat === "story"
            ? Math.round((width * 16) / 9)
            : Math.round((width * 3) / 4)

      canvas.width = width
      canvas.height = height

      // Dibujar fondo
      ctx.fillStyle = "#FFF7ED"
      ctx.fillRect(0, 0, width, height)

      // Dibujar el mapa
      ctx.drawImage(mapCanvas, 0, 0, width, height)

      // Configurar estilos de texto
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      // Dibujar título
      ctx.font = "bold 80px serif"
      ctx.fillText(tripTitle || "Mi Viaje", width / 2, 120)

      // Dibujar fecha
      ctx.font = "40px serif"
      ctx.fillText(tripDate || "2025", width / 2, 180)

      // Dibujar sección inferior
      const footerHeight = 200
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Fondo semi-transparente
      ctx.fillStyle = "rgba(255, 251, 235, 0.9)"
      ctx.fillRect(0, height - footerHeight, width, footerHeight)

      // Distancia recorrida
      ctx.fillStyle = "#92400E"
      ctx.font = "bold 32px sans-serif"
      ctx.fillText(`${totalDistance} km recorridos`, width / 2, height - footerHeight + 50)

      // Comentario del viaje
      if (tripComment) {
        ctx.font = "italic 28px serif"
        ctx.fillStyle = "#78350F"
        ctx.fillText(`"${tripComment}"`, width / 2, height - footerHeight + 100)
      }

      // Footer
      ctx.font = "16px sans-serif"
      ctx.fillStyle = "#B45309"
      ctx.textAlign = "left"
      ctx.fillText("travelprint.me", 40, height - 30)
      ctx.textAlign = "right"
      ctx.fillText("Mi recuerdo de viaje", width - 40, height - 30)

      // Guardar la imagen generada
      setGeneratedMap(canvas.toDataURL("image/png"))
    } catch (error) {
      console.error("Error generating stamp:", error)

      // Intentar con la API estática de Mapbox como respaldo
      try {
        if (!locations.length || !MAPBOX_TOKEN) return

        const bounds = new mapboxgl.LngLatBounds()
        locations.forEach((loc) => bounds.extend(loc.coordinates))
        const [west, south, east, north] = bounds.toArray().flat()

        const width = 1200
        const height =
          stampFormat === "square"
            ? width
            : stampFormat === "story"
              ? Math.round((width * 16) / 9)
              : Math.round((width * 3) / 4)

        const path = locations.map((loc) => loc.coordinates.join(",")).join(";")

        const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/path-3+f97316(${path})/[${west},${south},${east},${north}]/${width}x${height}@2x?padding=50&access_token=${MAPBOX_TOKEN}`

        setGeneratedMap(url)
      } catch (fallbackError) {
        console.error("Error with static map fallback:", fallbackError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Descargar estampita
  const downloadStamp = () => {
    if (!generatedMap) return

    const link = document.createElement("a")
    link.href = generatedMap
    link.download = `${tripTitle.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Obtener la clase de aspecto según el formato
  const getAspectRatioClass = () => {
    switch (stampFormat) {
      case "square":
        return "aspect-square"
      case "rectangle":
        return "aspect-[4/3]"
      case "story":
        return "aspect-[9/16]"
      default:
        return "aspect-[4/3]"
    }
  }

  return (
    <div className="space-y-6">
      {/* Panel de control */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="trip-title">Título del viaje</Label>
            <Input
              id="trip-title"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              placeholder="Ej: Ruta del Mar - Chile"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="trip-date">Fecha</Label>
            <Input
              id="trip-date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              placeholder="Ej: Marzo 2025"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="trip-comment">Descripción del viaje (máx. 150 caracteres)</Label>
            <Textarea
              id="trip-comment"
              value={tripComment}
              onChange={(e) => {
                if (e.target.value.length <= 150) {
                  setTripComment(e.target.value)
                }
              }}
              placeholder="Describe tu experiencia..."
              className="mt-1 min-h-[100px]"
              maxLength={150}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">{tripComment.length}/150</span>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Buscar ubicación</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchLocation()}
                placeholder="Ej: Valparaíso, Chile"
              />
              <Button onClick={searchLocation} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

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

          {locations.length > 0 && (
            <div>
              <Label>Destinos ({locations.length})</Label>
              <div className="mt-1 space-y-2">
                {locations.map((loc, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-lg">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 text-amber-500 mr-2" />
                      {loc.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeLocation(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Formato de estampita</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted flex flex-col items-center
                  ${stampFormat === "square" ? "bg-muted ring-2 ring-amber-500" : ""}`}
                onClick={() => setStampFormat("square")}
              >
                <Square className="h-6 w-6 mb-1" />
                <span className="text-sm font-medium">Cuadrado</span>
              </div>
              <div
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted flex flex-col items-center
                  ${stampFormat === "rectangle" ? "bg-muted ring-2 ring-amber-500" : ""}`}
                onClick={() => setStampFormat("rectangle")}
              >
                <Maximize className="h-6 w-6 mb-1" />
                <span className="text-sm font-medium">Rectangular</span>
              </div>
              <div
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted flex flex-col items-center
                  ${stampFormat === "story" ? "bg-muted ring-2 ring-amber-500" : ""}`}
                onClick={() => setStampFormat("story")}
              >
                <AlignJustify className="h-6 w-6 mb-1" />
                <span className="text-sm font-medium">Historia</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa de la estampita */}
      <div
        className={`relative ${getAspectRatioClass()} rounded-3xl overflow-hidden bg-amber-50 mx-auto max-w-2xl shadow-xl`}
      >
        {/* Canvas para la generación de la imagen */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Contenedor del mapa */}
        <div
          ref={mapContainer}
          className="absolute inset-0"
          style={{ visibility: isMapLoaded ? "visible" : "hidden" }}
        />

        {/* Overlay con título y fecha */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-10">
          <div className="text-center">
            <h1
              className="text-4xl md:text-5xl font-serif font-bold mb-2"
              style={{
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {tripTitle || "Mi Viaje"}
            </h1>
            <p
              className="text-2xl md:text-3xl font-serif"
              style={{
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {tripDate || "2025"}
            </p>
          </div>
        </div>

        {/* Sección inferior con distancia y comentario */}
        <div className="absolute bottom-0 inset-x-0 bg-[rgba(255,251,235,0.9)] p-6 space-y-4 z-10">
          <div className="text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-800 font-medium text-lg">
              {totalDistance} km recorridos
            </span>
          </div>

          {tripComment && (
            <div className="relative text-center px-8">
              <span className="absolute left-0 top-0 text-4xl text-amber-800 font-serif">"</span>
              <p className="text-lg md:text-xl text-amber-900 font-serif italic leading-relaxed">{tripComment}</p>
              <span className="absolute right-0 bottom-0 text-4xl text-amber-800 font-serif">"</span>
            </div>
          )}

          <div className="flex justify-between text-sm text-amber-700">
            <span>travelprint.me</span>
            <span>Mi recuerdo de viaje</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={generateStamp}
          disabled={locations.length < 2 || isGenerating}
          className="bg-gradient-to-r from-amber-500 to-amber-700"
        >
          {isGenerating ? "Generando..." : "Generar Estampita"}
        </Button>

        {generatedMap && (
          <Button onClick={downloadStamp} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        )}
      </div>
    </div>
  )
}




























































































