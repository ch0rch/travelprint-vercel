"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Download, X, Plus, Search, Square, Maximize, AlignJustify } from "lucide-react"
import { checkPurchaseFromURL } from "@/utils/lemonsqueezy-utils"
import { verifyAndSavePremiumStatus, isPremiumUser } from "@/utils/premium-storage"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import html2canvas from "html2canvas"
import * as turf from "@turf/turf"

// Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Inicializar Mapbox
mapboxgl.accessToken = MAPBOX_TOKEN || ""

interface Location {
  name: string
  coordinates: [number, number]
}

// Formatos disponibles
type StampFormat = "square" | "rectangle" | "story"

export default function TravelStampGenerator() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12")
  const [zoom, setZoom] = useState([12])
  const [location, setLocation] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [generatedMap, setGeneratedMap] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [tripTitle, setTripTitle] = useState("")
  const [tripDate, setTripDate] = useState("")
  const [tripComment, setTripComment] = useState("")
  const [totalDistance, setTotalDistance] = useState(0)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-70.6483, -33.4569]) // Santiago
  const [mapBounds, setMapBounds] = useState<mapboxgl.LngLatBounds | null>(null)
  const [stampFormat, setStampFormat] = useState<StampFormat>("rectangle")
  const stampRef = useRef<HTMLDivElement>(null)
  const [markerColor, setMarkerColor] = useState("#F97316") // Color naranja para los marcadores
  const [routeColor, setRouteColor] = useState("#F97316") // Color naranja para la ruta

  // Verificar licencia en la URL
  useEffect(() => {
    const result = checkPurchaseFromURL()
    if (result.isValid && result.licenseKey) {
      verifyAndSavePremiumStatus(result.licenseKey).then((success) => {
        if (success) setIsPremium(isPremiumUser())
      })
    }
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (map.current) return
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: mapCenter,
      zoom: zoom[0],
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")

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
  const calculateTotalDistance = (locationList: Location[]) => {
    if (locationList.length < 2) return 0

    let total = 0
    for (let i = 1; i < locationList.length; i++) {
      const from = turf.point(locationList[i - 1].coordinates)
      const to = turf.point(locationList[i].coordinates)
      total += turf.distance(from, to, { units: "kilometers" })
    }
    return Math.round(total)
  }

  // Buscar ubicación
  const searchLocation = async () => {
    if (!location.trim()) return
    setIsSearching(true)

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}&limit=5`,
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
    const newLocation = {
      name: result.place_name,
      coordinates: result.center as [number, number],
    }

    const newLocations = [...locations, newLocation]
    setLocations(newLocations)
    setTotalDistance(calculateTotalDistance(newLocations))
    setSearchResults([])
    setLocation("")

    if (map.current) {
      // Añadir marcador
      new mapboxgl.Marker({ color: markerColor }).setLngLat(newLocation.coordinates).addTo(map.current)

      // Actualizar ruta
      if (locations.length > 0) {
        const coordinates = newLocations.map((loc) => loc.coordinates)

        if (!map.current.getSource("route")) {
          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates,
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
        } else {
          const source = map.current.getSource("route") as mapboxgl.GeoJSONSource
          source.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          })
        }
      }

      // Ajustar vista
      const bounds = new mapboxgl.LngLatBounds()
      newLocations.forEach((loc) => bounds.extend(loc.coordinates))
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
      })
      setMapBounds(bounds)
    }
  }

  // Eliminar ubicación
  const removeLocation = (index: number) => {
    const newLocations = [...locations]
    newLocations.splice(index, 1)
    setLocations(newLocations)
    setTotalDistance(calculateTotalDistance(newLocations))

    // Actualizar el mapa
    if (map.current) {
      // Eliminar todos los marcadores
      const markers = document.querySelectorAll(".mapboxgl-marker")
      markers.forEach((marker) => marker.remove())

      // Añadir marcadores para las ubicaciones restantes
      newLocations.forEach((loc) => {
        new mapboxgl.Marker({ color: markerColor }).setLngLat(loc.coordinates).addTo(map.current!)
      })

      // Actualizar la ruta
      if (newLocations.length > 1) {
        const coordinates = newLocations.map((loc) => loc.coordinates)
        const source = map.current.getSource("route") as mapboxgl.GeoJSONSource

        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        })
      } else if (map.current.getLayer("route")) {
        // Si solo queda una ubicación o ninguna, eliminar la ruta
        map.current.removeLayer("route")
        map.current.removeSource("route")
      }

      // Ajustar la vista
      if (newLocations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        newLocations.forEach((loc) => bounds.extend(loc.coordinates))
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        })
        setMapBounds(bounds)
      } else {
        // Si no hay ubicaciones, volver a la vista predeterminada
        map.current.flyTo({
          center: mapCenter,
          zoom: zoom[0],
        })
        setMapBounds(null)
      }
    }
  }

  // Generar estampita
  const generateStamp = async () => {
    if (!stampRef.current) return
    setIsGenerating(true)

    try {
      // Asegurar que el mapa está en posición
      if (map.current && mapBounds) {
        map.current.fitBounds(mapBounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        })

        // Esperar a que el mapa se renderice
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const canvas = await html2canvas(stampRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: 2, // Mayor calidad
        })

        setGeneratedMap(canvas.toDataURL("image/png"))
      }
    } catch (error) {
      console.error("Error:", error)
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
                // Limitar a 150 caracteres
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
        ref={stampRef}
        className={`relative ${getAspectRatioClass()} rounded-3xl overflow-hidden bg-amber-50 mx-auto max-w-2xl`}
      >
        {/* Contenedor del mapa */}
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Overlay con título y fecha */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-8 text-white">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold mb-2 drop-shadow-lg">{tripTitle || "Mi Viaje"}</h1>
            <p className="text-2xl font-serif drop-shadow-lg">{tripDate || "2025"}</p>
          </div>
        </div>

        {/* Sección inferior con distancia y comentario */}
        <div className="absolute bottom-0 inset-x-0 bg-[rgba(255,251,235,0.9)] p-6 space-y-4">
          <div className="text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
              {totalDistance} km recorridos
            </span>
          </div>

          {tripComment && (
            <div className="relative text-center px-8">
              <span className="absolute left-0 top-0 text-4xl text-amber-800">"</span>
              <p className="text-lg text-amber-900 font-serif italic">{tripComment}</p>
              <span className="absolute right-0 bottom-0 text-4xl text-amber-800">"</span>
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






















































































