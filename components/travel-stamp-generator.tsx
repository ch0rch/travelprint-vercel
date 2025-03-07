"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Plus,
  Download,
  Trash2,
  Smartphone,
  Square,
  ImageIcon,
  Crown,
  Lock,
  Sparkles,
  Palette,
  Share2,
} from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import html2canvas from "html2canvas"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { isPremiumUser, getExpiryDate, getRemainingDays, checkPurchaseFromURL } from "@/utils/premium-storage"
import PremiumBadge from "@/components/premium-badge"
import ExpiryReminderModal from "@/components/expiry-reminder-modal"
import ActivatePremiumModal from "@/components/activate-premium-modal"
import ShareModal from "@/components/share-modal"

// Normalmente usaríamos una variable de entorno, pero para el prototipo usamos un token público
mapboxgl.accessToken = "pk.eyJ1Ijoiam9yamVyb2phcyIsImEiOiJjbTd2eG42bXYwMTNlMm1vcWRycWpicmRhIn0.hDwomrUtCTWGe0gtLHil2Q"

// URL directa al producto en LemonSqueezy
const LEMONSQUEEZY_PRODUCT_URL = "https://travelprint.lemonsqueezy.com/buy/2002abe5-88e1-4541-95f6-8ca287abaa44"

// Colores pastel predefinidos con colores de texto y borde
const pastelColors = [
  { name: "Crema", value: "#FFF9E6", textColor: "text-amber-900", borderColor: "border-amber-800" },
  { name: "Rosa", value: "#FFE6E6", textColor: "text-rose-900", borderColor: "border-rose-800" },
  { name: "Menta", value: "#E6FFF2", textColor: "text-emerald-900", borderColor: "border-emerald-800" },
  { name: "Lavanda", value: "#F2E6FF", textColor: "text-purple-900", borderColor: "border-purple-800" },
  { name: "Celeste", value: "#E6F2FF", textColor: "text-blue-900", borderColor: "border-blue-800" },
  { name: "Durazno", value: "#FFE9D6", textColor: "text-orange-900", borderColor: "border-orange-800" },
  { name: "Limón", value: "#FFFDE6", textColor: "text-yellow-900", borderColor: "border-yellow-800" },
  { name: "Menta Agua", value: "#E6FFFD", textColor: "text-teal-900", borderColor: "border-teal-800" },
  { name: "Blanco", value: "#FFFFFF", textColor: "text-gray-900", borderColor: "border-gray-800" },
]

interface Destination {
  id: string
  name: string
  coordinates: [number, number]
}

const mapStyles = [
  { id: "streets-v12", name: "Calles", premium: false },
  { id: "outdoors-v12", name: "Aventura", premium: false },
  { id: "light-v11", name: "Claro", premium: false },
  { id: "dark-v11", name: "Oscuro", premium: true },
  { id: "satellite-v9", name: "Satélite", premium: true },
  { id: "satellite-streets-v12", name: "Satélite con calles", premium: true },
]

const stampFormats = [
  {
    id: "square",
    name: "Cuadrado (1:1)",
    icon: Square,
    containerClass: "w-full aspect-square",
    mapClass: "w-full h-[70%]",
    previewClass: "max-w-[350px] mx-auto",
    premium: false,
  },
  {
    id: "portrait",
    name: "Vertical (4:5)",
    icon: ImageIcon,
    containerClass: "w-full aspect-[4/5]",
    mapClass: "w-full h-[75%]",
    previewClass: "max-w-[280px] mx-auto",
    premium: true,
  },
  {
    id: "story",
    name: "Historia (9:16)",
    icon: Smartphone,
    containerClass: "w-full aspect-[9/16]",
    mapClass: "w-full h-[80%]",
    previewClass: "max-w-[220px] mx-auto",
    premium: true,
  },
]

// Valores predeterminados para la ruta
const ROUTE_COLOR = "#E05D37"
const ROUTE_WIDTH = 4

export default function TravelStampGenerator() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [newDestination, setNewDestination] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [mapStyle, setMapStyle] = useState("outdoors-v12")
  const [tripName, setTripName] = useState("Mi Aventura")
  const [tripDate, setTripDate] = useState("")
  const [tripComment, setTripComment] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [tempMarker, setTempMarker] = useState<mapboxgl.Marker | null>(null)
  const [isPremium, setIsPremium] = useState<boolean>(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [expiryDate, setExpiryDate] = useState<Date | null>(null)
  const [remainingDays, setRemainingDays] = useState<number | null>(null)
  const [showExpiryReminder, setShowExpiryReminder] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState(pastelColors[0].value)
  const [borderColor, setBorderColor] = useState(pastelColors[0].borderColor)
  const [textColor, setTextColor] = useState(pastelColors[0].textColor)
  const [stampFormat, setStampFormat] = useState("square")
  const [showShareModal, setShowShareModal] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const previewMapRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const previewMapRef2 = useRef<mapboxgl.Map | null>(null)

  // Verificar el estado premium en el cliente
  useEffect(() => {
    setIsPremium(isPremiumUser())
  }, [])

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

    // Add click handler
    mapRef.current.on("click", handleMapClick)

    return () => {
      mapRef.current?.off("click", handleMapClick)
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
      preserveDrawingBuffer: true,
      antialias: true,
      crossSourceCollisions: false,
      pixelRatio: 2, // Aumentar la densidad de píxeles
      maxZoom: 20, // Permitir más zoom para mejor detalle
    })

    // Manejar el evento de carga
    previewMapRef2.current.on("load", () => {
      updatePreviewRoute()

      // Ajustar la vista para mostrar todos los destinos
      if (destinations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        destinations.forEach((dest) => {
          bounds.extend(dest.coordinates as mapboxgl.LngLatLike)
        })
        previewMapRef2.current?.fitBounds(bounds, { padding: 40, duration: 0 })
      }
    })

    return () => {
      previewMapRef2.current?.remove()
    }
  }, [destinations, mapStyle])

  // Inicializar LemonSqueezy
  useEffect(() => {
    // Verificar si el script ya está cargado
    if (document.querySelector('script[src="https://app.lemonsqueezy.com/js/checkout.js"]')) {
      return
    }

    // Cargar el script de LemonSqueezy
    const script = document.createElement("script")
    script.src = "https://app.lemonsqueezy.com/js/checkout.js"
    script.async = true
    script.defer = true

    // Añadir un evento para saber cuando el script está cargado
    script.onload = () => {
      console.log("LemonSqueezy script loaded successfully")
    }

    script.onerror = () => {
      console.error("Failed to load LemonSqueezy script")
    }

    document.body.appendChild(script)

    return () => {
      // Solo eliminar si existe
      const scriptElement = document.querySelector('script[src="https://app.lemonsqueezy.com/js/checkout.js"]')
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement)
      }
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
        previewMapRef2.current?.fitBounds(bounds, { padding: 40, duration: 0 })
      }
    })
  }, [destinations])

  // Actualizar el mapa cuando cambia el formato
  useEffect(() => {
    if (!previewMapRef2.current || destinations.length < 2) return

    // Pequeño delay para asegurar que el contenedor tenga las nuevas dimensiones
    const timer = setTimeout(() => {
      previewMapRef2.current?.resize()

      // Ajustar la vista para mostrar todos los destinos
      const bounds = new mapboxgl.LngLatBounds()
      destinations.forEach((dest) => {
        bounds.extend(dest.coordinates as mapboxgl.LngLatLike)
      })
      previewMapRef2.current?.fitBounds(bounds, { padding: 40, duration: 0 })
    }, 300)

    return () => clearTimeout(timer)
  }, [stampFormat, destinations])

  useEffect(() => {
    if (isPremium) {
      setExpiryDate(getExpiryDate())
      setRemainingDays(getRemainingDays())
    }
  }, [isPremium])

  useEffect(() => {
    if (isPremium && remainingDays !== null && remainingDays <= 7) {
      // Verificar si ya se mostró el recordatorio hoy
      const isBrowser = typeof window !== "undefined"
      if (isBrowser) {
        const lastReminder = localStorage.getItem("rv_last_reminder")
        const today = new Date().toDateString()

        if (lastReminder !== today) {
          // Mostrar el recordatorio después de un breve retraso
          const timer = setTimeout(() => {
            setShowExpiryReminder(true)
            // Guardar que ya se mostró hoy
            localStorage.setItem("rv_last_reminder", today)
          }, 2000)

          return () => clearTimeout(timer)
        }
      }
    }
  }, [isPremium, remainingDays])

  // Verificar si hay parámetros de compra en la URL
  useEffect(() => {
    checkPurchaseFromURL()
  }, [])

  // Verificar si un estilo de mapa es premium
  const isMapStylePremium = (styleId: string) => {
    return mapStyles.find((style) => style.id === styleId)?.premium || false
  }

  // Verificar si un formato es premium
  const isFormatPremium = (formatId: string) => {
    return stampFormats.find((format) => format.id === formatId)?.premium || false
  }

  // Verificar si se está usando alguna característica premium
  const isUsingPremiumFeature = () => {
    return isMapStylePremium(mapStyle) || isFormatPremium(stampFormat) || tripComment.length > 0
  }

  const updateRoute = () => {
    if (!mapRef.current || destinations.length < 2) return

    // Preparar las coordenadas para la ruta
    const coordinates = destinations.map((dest) => dest.coordinates)

    // Añadir o actualizar la fuente de datos
    if (!mapRef.current.getSource("route")) {
      mapRef.current.on("load", () => {
        mapRef.current?.addSource("route", {
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
        mapRef.current?.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": ROUTE_COLOR,
            "line-width": ROUTE_WIDTH,
            "line-opacity": 0.8,
          },
        })

        // Añadir marcadores para cada destino
        destinations.forEach((dest) => {
          new mapboxgl.Marker({ color: ROUTE_COLOR, scale: 0.7 })
            .setLngLat(dest.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${dest.name}</h3>`))
            .addTo(mapRef.current!)
        })
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
      mapRef.current.setPaintProperty("route", "line-color", ROUTE_COLOR)
      mapRef.current.setPaintProperty("route", "line-width", ROUTE_WIDTH)
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

      previewMapRef2.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ROUTE_COLOR,
          "line-width": ROUTE_WIDTH,
          "line-opacity": 0.8,
        },
      })

      // Marcadores más pequeños
      destinations.forEach((dest) => {
        new mapboxgl.Marker({
          color: ROUTE_COLOR,
          scale: 0.5, // Reducir el tamaño del marcador
        })
          .setLngLat(dest.coordinates)
          .addTo(previewMapRef2.current!)
      })
    } else {
      previewMapRef2.current.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      })

      previewMapRef2.current.setPaintProperty("route", "line-color", ROUTE_COLOR)
      previewMapRef2.current.setPaintProperty("route", "line-width", ROUTE_WIDTH)
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
    // Si está usando características premium, mostrar modal de actualización
    if (isUsingPremiumFeature() && !isPremium) {
      setShowPremiumModal(true)
      return
    }

    setIsDownloading(true)

    try {
      if (!previewContainerRef.current || !previewMapRef2.current) return

      // Asegurarse de que el mapa esté completamente cargado
      if (!previewMapRef2.current.loaded()) {
        await new Promise((resolve) => {
          previewMapRef2.current?.once("load", resolve)
        })
      }

      // Esperar a que los tiles se carguen
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Configuración de html2canvas
      const canvas = await html2canvas(previewContainerRef.current, {
        scale: 4, // Aumentar de 2 a 4 para mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (document, element) => {
          // Asegurarse de que los estilos se apliquen correctamente en el clon
          const mapContainer = element.querySelector(`[class*="${getMapClasses()}"]`)
          if (mapContainer) {
            mapContainer.style.height = `${mapContainer.offsetHeight}px`
            mapContainer.style.width = `${mapContainer.offsetWidth}px`
          }
        },
      })

      // Añadir marca de agua si no es premium
      if (!isPremium) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.font = "bold 16px Arial"
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
          ctx.textAlign = "center"
          ctx.fillText("Creado gratis con TravelPrint.me", canvas.width / 2, canvas.height - 20)
        }
      }

      // Convertir a imagen y descargar
      const image = canvas.toDataURL("image/png", 1.0)
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

  const generatePremiumStamp = async () => {
    try {
      if (!previewContainerRef.current || !previewMapRef2.current) return

      // Asegurarse de que el mapa esté completamente cargado
      if (!previewMapRef2.current.loaded()) {
        await new Promise((resolve) => {
          previewMapRef2.current?.once("load", resolve)
        })
      }

      // Esperar a que los tiles se carguen
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Configuración de html2canvas
      const canvas = await html2canvas(previewContainerRef.current, {
        scale: 4, // Mayor resolución para premium
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
        onclone: (document, element) => {
          const mapContainer = element.querySelector(`[class*="${getMapClasses()}"]`)
          if (mapContainer) {
            mapContainer.style.height = `${mapContainer.offsetHeight}px`
            mapContainer.style.width = `${mapContainer.offsetWidth}px`
          }
        },
      })

      // Convertir a imagen y descargar
      const image = canvas.toDataURL("image/png", 1.0)
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
    return borderColor
  }

  const getTemplateTextColor = () => {
    return textColor
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

  // Añadimos un botón de actualización
  const refreshPreview = () => {
    if (!previewMapRef2.current) return
    previewMapRef2.current.resize()

    if (destinations.length >= 2) {
      const bounds = new mapboxgl.LngLatBounds()
      destinations.forEach((dest) => {
        bounds.extend(dest.coordinates as mapboxgl.LngLatLike)
      })
      previewMapRef2.current.fitBounds(bounds, { padding: 40, duration: 0 })
    }
  }

  // Handle map clicks
  const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
    if (!mapRef.current) return

    // Remove previous temporary marker if it exists
    if (tempMarker) {
      tempMarker.remove()
    }

    // Add a temporary marker
    const marker = new mapboxgl.Marker({
      color: ROUTE_COLOR,
      draggable: true, // Allow fine-tuning of position
    })
      .setLngLat(e.lngLat)
      .addTo(mapRef.current)

    setTempMarker(marker)

    try {
      // Reverse geocoding using Mapbox API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat.lng},${e.lngLat.lat}.json?access_token=${mapboxgl.accessToken}&language=es`,
      )
      const data = await response.json()

      // Get the most relevant place name
      const placeName = data.features[0]?.place_name || "Ubicación desconocida"

      // Add the new destination
      const newDest: Destination = {
        id: Date.now().toString(),
        name: placeName.split(",")[0], // Take just the first part of the place name
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      }

      setDestinations((prev) => [...prev, newDest])
      setTempMarker(null) // Clear temporary marker
    } catch (error) {
      console.error("Error en geocodificación inversa:", error)
      alert("Error al obtener el nombre del lugar. Por favor, intenta de nuevo.")
    }
  }

  // Renderizar el modal de premium
  const renderPremiumModal = () => {
    if (!showPremiumModal) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <Crown className="h-6 w-6 text-amber-500 mr-2" />
              <h3 className="text-xl font-bold">Actualiza a Premium</h3>
            </div>
            <button onClick={() => setShowPremiumModal(false)} className="text-gray-500 hover:text-gray-700">
              &times;
            </button>
          </div>

          <p className="mb-4">Estás utilizando características premium:</p>

          <ul className="mb-4 space-y-2">
            {isMapStylePremium(mapStyle) && (
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                Estilo de mapa premium
              </li>
            )}
            {isFormatPremium(stampFormat) && (
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                Formato premium
              </li>
            )}
            {tripComment.length > 0 && (
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                Comentarios personalizados
              </li>
            )}
          </ul>

          <p className="mb-6">
            Actualiza a Premium por solo $5 para desbloquear todas las características y descargar sin marca de agua.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowPremiumModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowPremiumModal(false)
                openLemonSqueezyCheckout()
              }}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Función para abrir el checkout de LemonSqueezy
  const openLemonSqueezyCheckout = () => {
    // Generar un ID único para esta compra
    const purchaseId = Date.now().toString()

    // Construir la URL de retorno a la aplicación
    const returnUrl = typeof window !== "undefined" ? `${window.location.origin}?license_key={license_key}` : ""

    // Construir la URL con los parámetros personalizados
    const customParams = new URLSearchParams({
      "checkout[custom][purchase_id]": purchaseId,
      "checkout[custom][trip_name]": tripName,
      "checkout[custom][is_renewal]": isPremium ? "true" : "false",
      "checkout[redirect_url]": returnUrl,
    })

    // URL completa
    const lemonSqueezyUrl = `${LEMONSQUEEZY_PRODUCT_URL}?${customParams.toString()}`

    // Abrir en una nueva pestaña
    window.open(lemonSqueezyUrl, "_blank")

    // Mostrar instrucciones al usuario
    alert(
      "Se ha abierto la página de pago en una nueva pestaña. Después de completar tu compra, serás redirigido automáticamente a esta página. Si no eres redirigido, puedes activar tu licencia manualmente con el botón 'Activar Premium'.",
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Generador de Estampitas</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="destination">Añadir destino</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="destination"
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      placeholder="Ej: Talca, Constitución, Concepción..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          searchDestination()
                        }
                      }}
                    />
                    <Button onClick={searchDestination} disabled={isSearching || !newDestination.trim()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Añadir
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    También puedes hacer clic en el mapa para añadir destinos de forma precisa
                  </p>
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
            <Card className="mt-4">
              <CardContent className="p-6">
                <Tabs defaultValue="map">
                  <TabsList className="mb-4 w-full overflow-x-auto flex whitespace-nowrap scrollbar-none">
                    <TabsTrigger value="map" className="flex-none px-3">
                      Mapa
                    </TabsTrigger>
                    <TabsTrigger value="stamp" className="flex-none px-3">
                      Estampita
                    </TabsTrigger>
                    <TabsTrigger value="format" className="flex-none px-3">
                      Formato
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="map">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="map-style">Estilo de mapa</Label>
                        <Select
                          value={mapStyle}
                          onValueChange={(value) => {
                            if (isMapStylePremium(value) && !isPremium) {
                              setShowPremiumModal(true)
                            } else {
                              setMapStyle(value)
                            }
                          }}
                        >
                          <SelectTrigger id="map-style">
                            <SelectValue placeholder="Selecciona un estilo" />
                          </SelectTrigger>
                          <SelectContent>
                            {mapStyles.map((style) => (
                              <SelectItem key={style.id} value={style.id} disabled={style.premium && !isPremium}>
                                <div className="flex items-center">
                                  {style.name}
                                  {style.premium && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Crown className="h-3 w-3 ml-2 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Característica premium</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="stamp">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="background-color" className="flex items-center">
                          <Palette className="h-4 w-4 mr-2" />
                          Color de fondo
                        </Label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                          {pastelColors.map((color) => (
                            <div
                              key={color.value}
                              className={`h-8 rounded-md cursor-pointer border-2 ${
                                backgroundColor === color.value ? "border-amber-600" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => {
                                setBackgroundColor(color.value)
                                setTextColor(color.textColor)
                                setBorderColor(color.borderColor)
                              }}
                              title={color.name}
                            />
                          ))}
                        </div>
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
                        <div className="flex items-center justify-between">
                          <Label htmlFor="trip-comment">
                            Comentario
                            <span className="text-xs text-muted-foreground ml-2">
                              ({tripComment.length}/150 caracteres)
                            </span>
                          </Label>
                          {!isPremium && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center text-amber-500 text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Premium
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Los comentarios son una característica premium</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <Textarea
                          id="trip-comment"
                          value={tripComment}
                          onChange={(e) => {
                            if (!isPremium) {
                              setShowPremiumModal(true)
                              return
                            }
                            // Limitar a 150 caracteres
                            if (e.target.value.length <= 150) {
                              setTripComment(e.target.value)
                            }
                          }}
                          placeholder={
                            isPremium
                              ? "Escribe un comentario sobre tu viaje..."
                              : "Actualiza a premium para añadir comentarios"
                          }
                          className="resize-none"
                          rows={3}
                          disabled={!isPremium}
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
                            } ${format.premium && !isPremium ? "opacity-50" : ""}`}
                            onClick={() => {
                              if (format.premium && !isPremium) {
                                setShowPremiumModal(true)
                              } else {
                                setStampFormat(format.id)
                              }
                            }}
                          >
                            <div className="flex flex-col items-center gap-2 text-center">
                              <format.icon className="h-8 w-8 text-amber-600" />
                              <div className="flex items-center">
                                <span className="text-sm font-medium">{format.name}</span>
                                {format.premium && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Crown className="h-3 w-3 ml-2 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Formato premium</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            {/* Botón de compartir */}
            <div className="mt-6">
              <Button className="w-full" variant="outline" onClick={() => setShowShareModal(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir con amigos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <h2>Vista Previa</h2>
            {isPremium && <PremiumBadge onRenew={openLemonSqueezyCheckout} />}
            {destinations.length < 2 ? (
              <div className="border-2 border-dashed border-amber-200 rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-amber-300 mb-2" />
                <p className="text-amber-800">Añade al menos dos destinos para generar tu estampita</p>
              </div>
            ) : (
              <div className={getPreviewClasses()} ref={previewContainerRef}>
                <div
                  className={`border-2 rounded-lg overflow-hidden ${borderColor} ${getFormatClasses()} relative shadow-xl`}
                  style={{ backgroundColor: backgroundColor }}
                >
                  {/* Esquinas decorativas */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-800/20 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-800/20 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-800/20 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-800/20 rounded-br-lg" />

                  {/* Contenido */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Contenedor del mapa sin margin/padding bottom */}
                    <div ref={previewMapRef} className={`${getMapClasses()} relative`} />

                    {/* Contenedor inferior con altura fija y mejor distribución */}
                    <div className="flex-grow flex flex-col justify-between bg-transparent">
                      <div className="space-y-3 p-4">
                        <div className="text-center">
                          <h3 className={`font-serif font-bold text-lg tracking-wide ${textColor}`}>{tripName}</h3>
                          {tripDate && <p className={`text-sm ${textColor} font-medium opacity-75 mt-1`}>{tripDate}</p>}
                        </div>

                        {tripComment && isPremium && (
                          <div className="px-2">
                            <div className="relative">
                              <span className={`absolute left-0 top-0 ${textColor} opacity-30 text-lg`}>"</span>
                              <p
                                className={`italic text-[10px] ${textColor} leading-relaxed px-4 break-words max-w-full`}
                              >
                                {tripComment}
                              </p>
                              <span className={`absolute right-0 bottom-0 ${textColor} opacity-30 text-lg`}>"</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto border-t border-amber-800/10 p-2 flex justify-between items-center">
                        <span className="text-[8px] opacity-70">travelprint.me</span>
                        <span className="text-[8px] font-medium opacity-70">Mi recuerdo de viaje</span>
                      </div>
                    </div>
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
                {isDownloading
                  ? "Descargando..."
                  : isPremium
                    ? "Descarga tu recuerdo"
                    : "Descarga gratuita con marca de agua"}
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                disabled={destinations.length < 2}
                onClick={openLemonSqueezyCheckout}
              >
                <Crown className="h-4 w-4 mr-2" />
                {isPremium ? "Renovar premium ($5)" : "Descarga premium ($5)"}
              </Button>
              {!isPremium && (
                <Button className="w-full" variant="outline" onClick={() => setShowActivateModal(true)}>
                  <Crown className="h-4 w-4 mr-2" />
                  Activar tu Licencia
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Botón de compartir */}
        <div className="mt-6">
          <Button className="w-full" variant="outline" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir con amigos
          </Button>
        </div>
      </div>

      {renderPremiumModal()}
      {isPremium && showExpiryReminder && (
        <ExpiryReminderModal onRenew={openLemonSqueezyCheckout} onClose={() => setShowExpiryReminder(false)} />
      )}
      {showActivateModal && <ActivatePremiumModal onClose={() => setShowActivateModal(false)} />}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </div>
  )
}










































































