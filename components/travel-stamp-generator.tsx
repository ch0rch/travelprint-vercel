"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Crown, Download, MapPin, RefreshCw, Plus, X, Search, Share2 } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { isPremiumUser } from "@/utils/premium-storage"
import { getRemainingDays } from "@/utils/premium-storage"

// Mapbox token - IMPORTANT: Must be configured in your .env.local file
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Verificar y configurar el token de Mapbox
if (!MAPBOX_TOKEN) {
  console.error(
    "⚠️ El token de Mapbox no está configurado. Asegúrate de añadir NEXT_PUBLIC_MAPBOX_TOKEN en tu archivo .env.local",
  )
} else {
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

// Formatos disponibles
const stampFormats = [
  { id: "landscape", name: "Horizontal", premium: false },
  { id: "portrait", name: "Vertical", premium: true },
  { id: "square", name: "Cuadrado", premium: true },
  { id: "story", name: "Historia", premium: true },
]

export default function TravelStampGenerator() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapStyle, setMapStyle] = useState("streets-v12")
  const [zoom, setZoom] = useState(3)
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
  const [stampFormat, setStampFormat] = useState("landscape")
  const [tripTitle, setTripTitle] = useState("")
  const [tripDate, setTripDate] = useState("")
  const [tripComment, setTripComment] = useState("")
  const [mapError, setMapError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Verificar estado premium
  useEffect(() => {
    setIsPremium(isPremiumUser())
    setRemainingDays(getRemainingDays())
  }, [])

  // Función para actualizar la ruta
  const updateRoute = useCallback(() => {
    if (!map.current || locations.length < 2) return

    try {
      console.log("🔄 Actualizando ruta con", locations.length, "ubicaciones")

      // Eliminar ruta existente si la hay
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route")
      }
      if (map.current.getSource("route")) {
        map.current.removeSource("route")
      }

      const coordinates = locations.map((loc) => loc.coordinates)

      // Verificar si el estilo está cargado
      if (!map.current.isStyleLoaded()) {
        console.log("⏳ Esperando a que el estilo se cargue completamente...")
        map.current.once("style.load", () => {
          console.log("✅ Estilo cargado, añadiendo ruta ahora")
          addRouteLayer(coordinates)
        })
        return
      }

      addRouteLayer(coordinates)

      // Ajustar la vista para mostrar toda la ruta
      const bounds = new mapboxgl.LngLatBounds()
      coordinates.forEach((coord) => bounds.extend(coord))
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
      })
    } catch (error) {
      console.error("❌ Error al actualizar la ruta:", error)
      setDebugInfo((prev) => prev + "\nError al actualizar ruta: " + (error as Error).message)
    }
  }, [locations])

  // Función para añadir la capa de ruta
  const addRouteLayer = (coordinates: [number, number][]) => {
    if (!map.current) return

    try {
      // Añadir la fuente y la capa de la ruta
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
          "line-width": 4,
          "line-opacity": 0.8,
        },
      })

      console.log("✅ Ruta añadida correctamente")
    } catch (error) {
      console.error("❌ Error al añadir capa de ruta:", error)
      setDebugInfo((prev) => prev + "\nError al añadir capa: " + (error as Error).message)
    }
  }

  // Función para añadir marcadores
  const addMarkers = useCallback(() => {
    if (!map.current) return

    try {
      // Limpiar marcadores existentes
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Añadir nuevos marcadores
      locations.forEach((location) => {
        console.log("📍 Añadiendo marcador en", location.coordinates)
        const marker = new mapboxgl.Marker({
          color: "#F97316",
          draggable: false,
        })
          .setLngLat(location.coordinates)
          .addTo(map.current!)

        markersRef.current.push(marker)
      })

      console.log("✅ Marcadores añadidos:", markersRef.current.length)
    } catch (error) {
      console.error("❌ Error al añadir marcadores:", error)
      setDebugInfo((prev) => prev + "\nError al añadir marcadores: " + (error as Error).message)
    }
  }, [locations])

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) {
      setMapError("No se pudo inicializar el mapa. Verifica que el token de Mapbox esté configurado correctamente.")
      return
    }

    try {
      console.log("🗺️ Inicializando mapa con token:", MAPBOX_TOKEN.substring(0, 5) + "...")

      if (!map.current) {
        const newMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: `mapbox://styles/mapbox/${mapStyle}`,
          center: mapCenter,
          zoom: zoom,
          attributionControl: true,
          preserveDrawingBuffer: true,
        })

        // Manejar eventos del mapa
        newMap.on("load", () => {
          console.log("✅ Mapa cargado correctamente")
          setIsMapLoaded(true)
          setMapError(null)
          map.current = newMap

          // Añadir controles de navegación
          newMap.addControl(new mapboxgl.NavigationControl(), "top-right")

          // Añadir marcadores existentes
          if (locations.length > 0) {
            setTimeout(() => {
              addMarkers()
              if (locations.length > 1) {
                updateRoute()
              }
            }, 500)
          }

          // Añadir manejador de clics
          newMap.on("click", (e) => {
            console.log("🖱️ Clic en el mapa:", e.lngLat)
            addLocationByCoordinates(e.lngLat.lng, e.lngLat.lat)
          })
        })

        newMap.on("error", (e) => {
          console.error("❌ Error en el mapa:", e)
          setMapError(`Error al cargar el mapa: ${e.error?.message || "Error desconocido"}`)
          setDebugInfo((prev) => prev + "\nError del mapa: " + e.error?.message)
        })

        map.current = newMap
      }
    } catch (error) {
      console.error("❌ Error al inicializar el mapa:", error)
      setMapError("Error al inicializar el mapa. Verifica tu conexión a internet y el token de Mapbox.")
      setDebugInfo((prev) => prev + "\nError de inicialización: " + (error as Error).message)
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Actualizar el estilo del mapa cuando cambia
  useEffect(() => {
    if (!map.current) return

    try {
      console.log("🎨 Cambiando estilo del mapa a:", mapStyle)
      map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`)

      // Re-añadir marcadores y ruta después del cambio de estilo
      map.current.once("style.load", () => {
        console.log("✅ Nuevo estilo cargado")

        // Esperar un momento para asegurar que el estilo esté completamente cargado
        setTimeout(() => {
          addMarkers()
          if (locations.length > 1) {
            updateRoute()
          }
        }, 500)
      })
    } catch (error) {
      console.error("❌ Error al cambiar el estilo del mapa:", error)
      setMapError("Error al cambiar el estilo del mapa. Intenta recargar la página.")
      setDebugInfo((prev) => prev + "\nError al cambiar estilo: " + (error as Error).message)
    }
  }, [mapStyle, addMarkers, updateRoute])

  // Añadir ubicación por coordenadas (para clicks en el mapa)
  const addLocationByCoordinates = async (lng: number, lat: number) => {
    if (!map.current || !MAPBOX_TOKEN) return

    try {
      console.log("🔍 Geocoding inverso para:", lng, lat)

      // Hacer geocoding inverso para obtener el nombre del lugar
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`,
      )

      if (!response.ok) throw new Error("Error en geocoding inverso")

      const data = await response.json()
      const placeName = data.features[0]?.place_name || `Punto (${lng.toFixed(4)}, ${lat.toFixed(4)})`
      console.log("📍 Lugar encontrado:", placeName)

      const newLocation = {
        name: placeName,
        coordinates: [lng, lat] as [number, number],
      }

      // Añadir marcador
      if (map.current) {
        const marker = new mapboxgl.Marker({ color: "#F97316" }).setLngLat(newLocation.coordinates).addTo(map.current)

        markersRef.current.push(marker)
        console.log("✅ Marcador añadido, total:", markersRef.current.length)
      }

      // Actualizar estado
      const newLocations = [...locations, newLocation]
      setLocations(newLocations)
      setTotalDistance(calculateTotalDistance(newLocations))

      // Actualizar ruta si hay más de una ubicación
      if (newLocations.length > 1) {
        updateRoute()
      }

      // Centrar el mapa en la nueva ubicación
      if (map.current) {
        map.current.flyTo({
          center: newLocation.coordinates,
          zoom: 10,
        })
      }
    } catch (error) {
      console.error("❌ Error al añadir ubicación:", error)
      setDebugInfo((prev) => prev + "\nError al añadir ubicación: " + (error as Error).message)
    }
  }

  // Calcular distancia total
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radio de la Tierra en km
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

  // Buscar ubicación
  const searchLocation = async () => {
    if (!location.trim() || !MAPBOX_TOKEN) return
    setIsSearching(true)

    try {
      console.log("🔍 Buscando:", location)
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          location,
        )}.json?access_token=${MAPBOX_TOKEN}&limit=5`,
      )

      if (!response.ok) throw new Error("Error en la búsqueda")

      const data = await response.json()
      setSearchResults(data.features || [])
      console.log("✅ Resultados encontrados:", data.features?.length || 0)
    } catch (error) {
      console.error("❌ Error en la búsqueda:", error)
      setDebugInfo((prev) => prev + "\nError en búsqueda: " + (error as Error).message)
    } finally {
      setIsSearching(false)
    }
  }

  // Añadir ubicación desde búsqueda
  const addLocation = (result: any) => {
    if (!map.current) return

    console.log("➕ Añadiendo ubicación desde búsqueda:", result.place_name)
    const newLocation = {
      name: result.place_name,
      coordinates: result.center as [number, number],
    }

    // Add marker
    const marker = new mapboxgl.Marker({ color: "#F97316" }).setLngLat(newLocation.coordinates).addTo(map.current)
    markersRef.current.push(marker)
    console.log("✅ Marcador añadido, total:", markersRef.current.length)

    // Update locations
    const newLocations = [...locations, newLocation]
    setLocations(newLocations)
    setTotalDistance(calculateTotalDistance(newLocations))
    setSearchResults([])
    setLocation("")

    // Update route if there are multiple locations
    if (newLocations.length > 1) {
      updateRoute()
    } else {
      // Center map on single location
      map.current.flyTo({
        center: newLocation.coordinates,
        zoom: 10,
      })
    }
  }

  // Eliminar ubicación
  const removeLocation = (index: number) => {
    console.log("🗑️ Eliminando ubicación:", index)

    if (markersRef.current[index]) {
      markersRef.current[index].remove()
      markersRef.current.splice(index, 1)
    }

    const newLocations = [...locations]
    newLocations.splice(index, 1)
    setLocations(newLocations)
    setTotalDistance(calculateTotalDistance(newLocations))

    if (newLocations.length > 1 && map.current) {
      updateRoute()
    } else if (map.current) {
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route")
      }
      if (map.current.getSource("route")) {
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
    if (!map.current || locations.length < 2) return
    setIsGenerating(true)
    setMapError(null)

    try {
      console.log("🖼️ Generando estampita...")

      // Asegurar que el mapa está en posición
      const bounds = new mapboxgl.LngLatBounds()
      locations.forEach((loc) => bounds.extend(loc.coordinates))
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
      })

      // Esperar a que el mapa se renderice completamente
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Usar la API estática de Mapbox para generar la imagen
      const [west, south, east, north] = bounds.toArray().flat()
      const path = locations.map((loc) => loc.coordinates.join(",")).join(";")

      // Determinar dimensiones según formato
      let width = 1200
      let height = 900

      if (stampFormat === "portrait") {
        width = 900
        height = 1200
      } else if (stampFormat === "square") {
        width = 1200
        height = 1200
      } else if (stampFormat === "story") {
        width = 1080
        height = 1920
      }

      // Construir la URL de la imagen estática
      const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/path-3+f97316(${path})/[${west},${south},${east},${north}]/${width}x${height}@2x?padding=50&access_token=${MAPBOX_TOKEN}`
      console.log("🔗 URL de mapa estático generada")

      // Crear un canvas para componer la imagen final
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("No se pudo obtener el contexto del canvas")

      canvas.width = width
      canvas.height = height

      // Cargar y dibujar el mapa
      const mapImage = new Image()
      mapImage.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        mapImage.onload = resolve
        mapImage.onerror = reject
        mapImage.src = staticMapUrl
      })

      // Dibujar el mapa
      ctx.drawImage(mapImage, 0, 0, width, height)

      // Añadir elementos de texto
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      // Título
      ctx.font = "bold 80px serif"
      ctx.fillText(tripTitle || "Mi Viaje", width / 2, 120)

      // Fecha
      ctx.font = "40px serif"
      ctx.fillText(tripDate || "2025", width / 2, 180)

      // Sección inferior
      const footerHeight = 200
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      ctx.fillStyle = "rgba(255, 251, 235, 0.9)"
      ctx.fillRect(0, height - footerHeight, width, footerHeight)

      // Distancia
      ctx.fillStyle = "#92400E"
      ctx.font = "bold 32px sans-serif"
      ctx.fillText(`${totalDistance} km recorridos`, width / 2, height - footerHeight + 50)

      // Comentario
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

      // Convertir a URL de datos
      const dataUrl = canvas.toDataURL("image/png")
      console.log("✅ Imagen generada correctamente")

      // Subir a Cloudinary
      console.log("☁️ Subiendo a Cloudinary...")
      const response = await fetch("/api/upload-to-cloudinary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: dataUrl,
          title: tripTitle || "Mi Viaje",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen a Cloudinary")
      }

      const { url: cloudinaryUrl } = await response.json()
      console.log("✅ Imagen subida a Cloudinary")

      setGeneratedMap(cloudinaryUrl || dataUrl)
      setShareUrl(cloudinaryUrl)
    } catch (error) {
      console.error("❌ Error al generar la estampita:", error)
      setMapError("Error al generar la estampita. Intenta de nuevo.")
      setDebugInfo((prev) => prev + "\nError al generar estampita: " + (error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  // Descargar estampita
  const downloadStamp = () => {
    if (!generatedMap) return

    const link = document.createElement("a")
    link.href = generatedMap
    link.download = `${tripTitle.toLowerCase().replace(/\s+/g, "-") || "mi-viaje"}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Compartir estampita
  const shareStamp = async () => {
    if (!shareUrl) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: tripTitle || "Mi Viaje",
          text: "Mira mi estampita de viaje",
          url: shareUrl,
        })
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(shareUrl)
        alert("¡Enlace copiado al portapapeles!")
      }
    } catch (error) {
      console.error("Error al compartir:", error)
    }
  }

  // Función para reiniciar el mapa
  const resetMap = () => {
    console.log("🔄 Reiniciando mapa...")

    // Limpiar marcadores
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Eliminar ruta si existe
    if (map.current) {
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route")
      }
      if (map.current.getSource("route")) {
        map.current.removeSource("route")
      }

      // Reiniciar vista
      map.current.flyTo({
        center: mapCenter,
        zoom: zoom,
        duration: 1000,
      })
    }

    // Reiniciar estado
    setLocations([])
    setTotalDistance(0)
    setMapError(null)
    setDebugInfo("")
  }

  return (
    <div className="grid lg:grid-cols-[1fr,400px] gap-6">
      {/* Panel principal */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Generador de Estampitas</h2>
            <Button variant="outline" size="sm" onClick={resetMap} className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Reiniciar mapa
            </Button>
          </div>

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
                <Search className="h-4 w-4 mr-2" />
                Añadir
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

          {/* Destinos seleccionados */}
          {locations.length > 0 && (
            <div className="space-y-2">
              <Label>Destinos seleccionados ({locations.length})</Label>
              <div className="space-y-2">
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
              {locations.length > 1 && (
                <div className="text-sm text-amber-700 font-medium mt-2">Distancia total: {totalDistance} km</div>
              )}
            </div>
          )}

          {/* Mapa */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-80 z-20">
                <div className="text-red-700 text-center p-4">
                  <p className="font-medium">{mapError}</p>
                  <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                    Recargar página
                  </Button>
                </div>
              </div>
            )}
            <div
              ref={mapContainer}
              className="absolute inset-0"
              style={{ visibility: isMapLoaded ? "visible" : "hidden" }}
            />
            {!isMapLoaded && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-amber-500" />
                  <p>Cargando mapa...</p>
                </div>
              </div>
            )}

            {/* Debug info */}
            {debugInfo && (
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded max-h-24 overflow-auto">
                <pre>{debugInfo}</pre>
              </div>
            )}
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
                      <SelectItem key={style.id} value={style.id} disabled={style.premium && !isPremium}>
                        <div className="flex items-center justify-between w-full">
                          <span>{style.name}</span>
                          {style.premium && <Crown className="h-4 w-4 text-amber-500 ml-2" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="stamp" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trip-title">Título del viaje</Label>
                <Input
                  id="trip-title"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="Ej: Ruta del Mar - Chile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trip-date">Fecha</Label>
                <Input
                  id="trip-date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  placeholder="Ej: Marzo 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trip-comment">Comentario (opcional)</Label>
                <Textarea
                  id="trip-comment"
                  value={tripComment}
                  onChange={(e) => setTripComment(e.target.value)}
                  placeholder="Describe tu experiencia..."
                  maxLength={150}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">{tripComment.length}/150</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-4">
              <div className="space-y-2">
                <Label>Formato de estampita</Label>
                <div className="grid grid-cols-2 gap-3">
                  {stampFormats.map((format) => (
                    <div
                      key={format.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted
                        ${stampFormat === format.id ? "bg-muted ring-2 ring-amber-500" : ""}
                        ${format.premium && !isPremium ? "opacity-50" : ""}`}
                      onClick={() => {
                        if (!format.premium || isPremium) {
                          setStampFormat(format.id)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{format.name}</span>
                        {format.premium && <Crown className="h-4 w-4 text-amber-500" />}
                      </div>
                    </div>
                  ))}
                </div>
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
                crossOrigin="anonymous"
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

          {/* Botones de acción */}
          <div className="space-y-2">
            <Button
              className="w-full flex items-center justify-center gap-2"
              disabled={!generatedMap}
              variant="outline"
              onClick={downloadStamp}
            >
              <Download className="h-4 w-4" />
              Descarga tu recuerdo
            </Button>

            {shareUrl && (
              <Button className="w-full flex items-center justify-center gap-2" variant="ghost" onClick={shareStamp}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            )}

            {generatedMap && (
              <Button className="w-full mt-2 text-sm" variant="ghost" onClick={() => setGeneratedMap(null)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar vista previa
              </Button>
            )}
          </div>
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







































































































