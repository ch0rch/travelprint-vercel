"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Plus, Download, Trash2, Smartphone, Square, ImageIcon, MonitorSmartphone, Crown } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import html2canvas from "html2canvas"

// Normalmente usaríamos una variable de entorno, pero para el prototipo usamos un token público
mapboxgl.accessToken = "pk.eyJ1Ijoiam9yamVyb2phcyIsImEiOiJjbTd2eG42bXYwMTNlMm1vcWRycWpicmRhIn0.hDwomrUtCTWGe0gtLHil2Q"

// ID del producto en LemonSqueezy
const LEMONSQUEEZY_PRODUCT_ID = "462437"

interface Destination {
  id: string
  name: string
  coordinates: [number, number]
}

const mapStyles = [
  { id: "streets-v12", name: "Calles" },
  { id: "outdoors-v12", name: "Aventura" },
  { id: "light-v11", name: "Claro" },
  { id: "dark-v11", name: "Oscuro" },
  { id: "satellite-v9", name: "Satélite" },
]

const stampTemplates = [
  { id: "vintage", name: "Vintage", borderColor: "border-amber-800", bgColor: "bg-amber-100" },
  { id: "modern", name: "Moderno", borderColor: "border-slate-800", bgColor: "bg-white" },
  { id: "adventure", name: "Aventura", borderColor: "border-emerald-800", bgColor: "bg-emerald-50" },
]

const stampFormats = [
  {
    id: "square",
    name: "Cuadrado (1:1)",
    icon: Square,
    containerClass: "w-full aspect-square",
    mapClass: "w-full h-[250px]",
    previewClass: "max-w-[350px] mx-auto",
  },
  {
    id: "portrait",
    name: "Vertical (4:5)",
    icon: ImageIcon,
    containerClass: "w-full aspect-[4/5]",
    mapClass: "w-full h-[300px]",
    previewClass: "max-w-[280px] mx-auto",
  },
  {
    id: "story",
    name: "Historia (9:16)",
    icon: Smartphone,
    containerClass: "w-full aspect-[9/16]",
    mapClass: "w-full h-[350px]",
    previewClass: "max-w-[220px] mx-auto",
  },
  {
    id: "landscape",
    name: "Horizontal (16:9)",
    icon: MonitorSmartphone,
    containerClass: "w-full aspect-[16/9]",
    mapClass: "w-full h-[200px]",
    previewClass: "max-w-[350px] mx-auto",
  },
]

export default function TravelStampGenerator() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [newDestination, setNewDestination] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [mapStyle, setMapStyle] = useState("outdoors-v12")
  const [routeColor, setRouteColor] = useState("#E05D37")
  const [routeWidth, setRouteWidth] = useState([4])
  const [stampTemplate, setStampTemplate] = useState("vintage")
  const [stampFormat, setStampFormat] = useState("square")
  const [tripName, setTripName] = useState("Mi Aventura")
  const [tripDate, setTripDate] = useState("")
  const [tripComment, setTripComment] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const previewMapRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const previewMapRef2 = useRef<mapboxgl.Map | null>(null)

  // Inicializar el mapa principal
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [-70.6506, -33.4378], // Santiago, Chile como punto inicial
      zoom: 5,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    return () => {
      mapRef.current?.remove()
    }
  }, [mapStyle])

  // Inicializar el mapa de vista previa
  useEffect(() => {
    if (!previewMapRef.current || destinations.length < 2) return

    previewMapRef2.current = new mapboxgl.Map({
      container: previewMapRef.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      interactive: false,
      preserveDrawingBuffer: true, // Añade esta línea
    })

    return () => {
      previewMapRef2.current?.remove()
    }
  }, [destinations, mapStyle])

  // Inicializar LemonSqueezy
  useEffect(() => {
    // Cargar el script de LemonSqueezy
    const script = document.createElement("script")
    script.src = "https://app.lemonsqueezy.com/js/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Actualizar la ruta en el mapa cuando cambian los destinos
  useEffect(() => {
    if (!mapRef.current || destinations.length < 2) return

    // Crear una fuente de datos para la ruta
    if (!mapRef.current.getSource("route")) {
      mapRef.current.on("load", () => {
        updateRoute()
      })
    } else {
      updateRoute()
    }

    // Ajustar la vista para mostrar todos los destinos
    if (destinations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      destinations.forEach((dest) => {
        bounds.extend(dest.coordinates as mapboxgl.LngLatLike)
      })
      mapRef.current.fitBounds(bounds, { padding: 50 })
    }
  }, [destinations])

  // Actualizar la vista previa cuando cambian los destinos o el estilo
  useEffect(() => {
    if (!previewMapRef2.current || destinations.length < 2) return

    previewMapRef2.current.on("load", () => {
      // Crear una fuente de datos para la ruta en la vista previa
      if (!previewMapRef2.current?.getSource("route")) {
        updatePreviewRoute()
      } else {
        updatePreviewRoute()
      }

      // Ajustar la vista para mostrar todos los destinos
      if (destinations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        destinations.forEach((dest) => {
          bounds.extend(dest.coordinates as mapboxgl.LngLatLike)
        })
        previewMapRef2.current?.fitBounds(bounds, { padding: 30 })
      }
    })
  }, [destinations])

  const updateRoute = () => {
    if (!mapRef.current || destinations.length < 2) return

    // Preparar las coordenadas para la ruta
    const coordinates = destinations.map((dest) => dest.coordinates)

    // Añadir o actualizar la fuente de datos
    if (!mapRef.current.getSource("route")) {
      mapRef.current.addSource("route", {
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

      // Añadir la capa de la ruta
      mapRef.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": routeColor,
          "line-width": routeWidth[0],
          "line-opacity": 0.8,
        },
      })

      // Añadir marcadores para cada destino
      destinations.forEach((dest) => {
        new mapboxgl.Marker({ color: routeColor })
          .setLngLat(dest.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${dest.name}</h3>`))
          .addTo(mapRef.current!)
      })
    } else {
      // Actualizar la ruta existente
      mapRef.current.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      })

      // Actualizar el estilo de la ruta
      mapRef.current.setPaintProperty("route", "line-color", routeColor)
      mapRef.current.setPaintProperty("route", "line-width", routeWidth[0])
    }
  }

  const updatePreviewRoute = () => {
    if (!previewMapRef2.current || destinations.length < 2) return

    // Preparar las coordenadas para la ruta
    const coordinates = destinations.map((dest) => dest.coordinates)

    // Añadir o actualizar la fuente de datos
    if (!previewMapRef2.current.getSource("route")) {
      previewMapRef2.current.addSource("route", {
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

      // Añadir la capa de la ruta
      previewMapRef2.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": routeColor,
          "line-width": routeWidth[0],
          "line-opacity": 0.8,
        },
      })

      // Añadir marcadores para cada destino
      destinations.forEach((dest) => {
        new mapboxgl.Marker({ color: routeColor }).setLngLat(dest.coordinates).addTo(previewMapRef2.current!)
      })
    } else {
      // Actualizar la ruta existente
      previewMapRef2.current.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      })

      // Actualizar el estilo de la ruta
      previewMapRef2.current.setPaintProperty("route", "line-color", routeColor)
      previewMapRef2.current.setPaintProperty("route", "line-width", routeWidth[0])
    }
  }

  const searchDestination = async () => {
    if (!newDestination.trim()) return

    setIsSearching(true)

    try {
      // Simulamos una búsqueda de geocodificación
      // En una implementación real, usaríamos la API de geocodificación de Mapbox
      const mockCoordinates: [number, number] = newDestination.toLowerCase().includes("talca")
        ? [-71.6663, -35.4264]
        : newDestination.toLowerCase().includes("constitución")
          ? [-72.4058, -35.3332]
          : newDestination.toLowerCase().includes("concepción")
            ? [-73.0498, -36.8201]
            : newDestination.toLowerCase().includes("temuco")
              ? [-72.5986, -38.7359]
              : newDestination.toLowerCase().includes("pino hachado")
                ? [-71.0731, -38.6614]
                : newDestination.toLowerCase().includes("chos malal")
                  ? [-70.2705, -37.3782]
                  : newDestination.toLowerCase().includes("san rafael")
                    ? [-68.3336, -34.6177]
                    : // Coordenadas aleatorias para otros lugares
                      [-70 - Math.random() * 3, -35 - Math.random() * 3]

      const newDest: Destination = {
        id: Date.now().toString(),
        name: newDestination,
        coordinates: mockCoordinates,
      }

      setDestinations((prev) => [...prev, newDest])
      setNewDestination("")
    } catch (error) {
      console.error("Error al buscar destino:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const removeDestination = (id: string) => {
    setDestinations((prev) => prev.filter((dest) => dest.id !== id))
  }

  const calculateTotalDistance = () => {
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

  const downloadFreeStamp = async () => {
    setIsDownloading(true)

    try {
      if (!previewContainerRef.current) return

      // Esperar a que el mapa termine de renderizarse completamente
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Capturar la vista previa como imagen
      const canvas = await html2canvas(previewContainerRef.current, {
        scale: 2, // Mayor calidad
        useCORS: true, // Permitir imágenes de otros dominios
        logging: false,
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true,
      })

      // Añadir marca de agua
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.font = "14px Arial"
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.textAlign = "center"
        ctx.fillText("Creado gratis con TravelPrint.me", canvas.width / 2, canvas.height - 20)
      }

      // Convertir a imagen y descargar
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `${tripName.replace(/\s+/g, "-").toLowerCase()}-estampita.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error al generar la estampita:", error)
      alert("Hubo un error al generar la estampita. Por favor, intenta de nuevo.")
    } finally {
      setIsDownloading(false)
    }
  }

  const openLemonSqueezyCheckout = () => {
    // Generar un ID único para esta compra
    const purchaseId = Date.now().toString()

    // @ts-ignore - LemonSqueezy se carga mediante script externo
    if (window.createLemonSqueezy) {
      // @ts-ignore
      window
        .createLemonSqueezy()
        .Setup({
          eventCallback: (event: any) => {
            if (event.event === "Checkout.Success") {
              // Generar y descargar la imagen premium
              generatePremiumStamp()
            }
          },
        })
        .Checkout.open({
          product: {
            id: LEMONSQUEEZY_PRODUCT_ID,
          },
          custom: {
            purchase_id: purchaseId,
            trip_name: tripName,
            destinations: destinations.map((d) => d.name).join(", "),
          },
        })
    } else {
      alert("Error al cargar el checkout. Por favor, intenta de nuevo más tarde.")
    }
  }

  const generatePremiumStamp = async () => {
    try {
      if (!previewContainerRef.current) return

      // Esperar a que el mapa termine de renderizarse completamente
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Capturar la vista previa como imagen en alta calidad
      const canvas = await html2canvas(previewContainerRef.current, {
        scale: 4, // Calidad superior para versión premium
        useCORS: true,
        logging: false,
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true,
      })

      // Convertir a imagen y descargar
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `${tripName.replace(/\s+/g, "-").toLowerCase()}-premium.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert("¡Gracias por tu compra! Tu estampita premium ha sido descargada.")
    } catch (error) {
      console.error("Error al generar la estampita premium:", error)
      alert("Hubo un error al generar la estampita premium. Por favor, contacta a soporte.")
    }
  }

  const getTemplateClasses = () => {
    const template = stampTemplates.find((t) => t.id === stampTemplate)
    return `${template?.borderColor} ${template?.bgColor}`
  }

  const getFormatClasses = () => {
    const format = stampFormats.find((f) => f.id === stampFormat)
    return format?.containerClass || ""
  }

  const getMapClasses = () => {
    const format = stampFormats.find((f) => f.id === stampFormat)
    return format?.mapClass || "w-full h-[250px]"
  }

  const getPreviewClasses = () => {
    const format = stampFormats.find((f) => f.id === stampFormat)
    return format?.previewClass || ""
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="destination">Añadir destino</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="destination"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="Ej: Talca, Constitución, Concepción..."
                    onKeyDown={(e) => e.key === "Enter" && searchDestination()}
                  />
                  <Button onClick={searchDestination} disabled={isSearching || !newDestination.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                </div>
              </div>
            </div>

            {destinations.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Destinos ({destinations.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {destinations.map((dest, index) => (
                    <div key={dest.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                      <div className="flex items-center">
                        <div className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{dest.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeDestination(dest.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              ref={mapContainerRef}
              className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-amber-200"
            />

            {destinations.length > 0 && (
              <div className="mt-4 text-sm text-amber-800">
                <p>
                  Distancia total aproximada: <strong>{calculateTotalDistance()} km</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="map">
              <TabsList className="mb-4">
                <TabsTrigger value="map">Estilo de Mapa</TabsTrigger>
                <TabsTrigger value="route">Estilo de Ruta</TabsTrigger>
                <TabsTrigger value="stamp">Estilo de Estampita</TabsTrigger>
                <TabsTrigger value="format">Formato</TabsTrigger>
              </TabsList>

              <TabsContent value="map">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="map-style">Estilo de mapa</Label>
                    <Select value={mapStyle} onValueChange={setMapStyle}>
                      <SelectTrigger id="map-style">
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        {mapStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="route">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="route-color">Color de ruta</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="color"
                        id="route-color"
                        value={routeColor}
                        onChange={(e) => setRouteColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <span className="text-sm">{routeColor}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="route-width">Grosor de ruta: {routeWidth[0]}px</Label>
                    <Slider
                      id="route-width"
                      value={routeWidth}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={setRouteWidth}
                      className="mt-2"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stamp">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stamp-template">Plantilla</Label>
                    <Select value={stampTemplate} onValueChange={setStampTemplate}>
                      <SelectTrigger id="stamp-template">
                        <SelectValue placeholder="Selecciona una plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {stampTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="trip-name">Nombre del viaje</Label>
                    <Input
                      id="trip-name"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      placeholder="Mi Aventura"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trip-date">Fecha del viaje</Label>
                    <Input
                      id="trip-date"
                      type="text"
                      value={tripDate}
                      onChange={(e) => setTripDate(e.target.value)}
                      placeholder="Marzo 2025"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trip-comment">Comentario</Label>
                    <Textarea
                      id="trip-comment"
                      value={tripComment}
                      onChange={(e) => setTripComment(e.target.value)}
                      placeholder="Escribe un comentario sobre tu viaje..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="format">
                <div className="space-y-4">
                  <Label>Formato de estampita</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stampFormats.map((format) => (
                      <div
                        key={format.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-muted ${
                          stampFormat === format.id ? "bg-muted ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setStampFormat(format.id)}
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <format.icon className="h-8 w-8 text-amber-600" />
                          <span className="text-sm font-medium">{format.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-center">Vista Previa</h2>
            {destinations.length < 2 ? (
              <div className="border-2 border-dashed border-amber-200 rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-amber-300 mb-2" />
                <p className="text-amber-800">Añade al menos dos destinos para generar tu estampita</p>
              </div>
            ) : (
              <div className={getPreviewClasses()} ref={previewContainerRef}>
                <div className={`border-8 rounded-lg overflow-hidden ${getTemplateClasses()} ${getFormatClasses()}`}>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-xl">{tripName}</h3>
                    {tripDate && <p className="text-sm opacity-75">{tripDate}</p>}
                  </div>

                  <div ref={previewMapRef} className={getMapClasses()} />

                  <div className="p-4 text-center text-sm">
                    <p>
                      <strong>{calculateTotalDistance()} km</strong> recorridos
                    </p>
                    <p className="text-xs opacity-75 mt-1">{destinations.map((d) => d.name).join(" • ")}</p>
                    {tripComment && <p className="mt-2 italic text-xs border-t border-current pt-2">"{tripComment}"</p>}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <Button
                className="w-full"
                variant="outline"
                disabled={destinations.length < 2 || isDownloading}
                onClick={downloadFreeStamp}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Descargando..." : "Descarga gratuita con marca de agua"}
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                disabled={destinations.length < 2}
                onClick={openLemonSqueezyCheckout}
              >
                <Crown className="h-4 w-4 mr-2" />
                Descarga premium ($5)
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-2">
                La versión premium incluye alta resolución y sin marca de agua
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

