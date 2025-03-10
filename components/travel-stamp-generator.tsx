"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Download, RefreshCw, Share2, X, Plus, Search } from "lucide-react"
import { checkPurchaseFromURL } from "@/utils/lemonsqueezy-utils"
import { verifyAndSavePremiumStatus, isPremiumUser } from "@/utils/premium-storage"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import html2canvas from "html2canvas"

// Mapbox token
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoicmVjdWVyZG92aWFqZXJvIiwiYSI6ImNscXRxcWNhcjE3ZHEya3BjcXVhb2JlbXQifQ.Aw_a8XBJUwXwJUmMSXgYsw"

// Inicializar Mapbox
mapboxgl.accessToken = MAPBOX_TOKEN

export default function TravelStampGenerator() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v11")
  const [stampStyle, setStampStyle] = useState("classic")
  const [stampColor, setStampColor] = useState("#B45309") // Amber-700
  const [zoom, setZoom] = useState([12])
  const [location, setLocation] = useState("")
  const [locations, setLocations] = useState<{ name: string; coordinates: [number, number] }[]>([])
  const [generatedMap, setGeneratedMap] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [tripTitle, setTripTitle] = useState("Mi Viaje")
  const [showWatermark, setShowWatermark] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.7, 40.4]) // Default: Madrid
  const [mapBounds, setMapBounds] = useState<mapboxgl.LngLatBounds | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState("png")
  const [stampBorderWidth, setStampBorderWidth] = useState([4])
  const [stampBorderStyle, setStampBorderStyle] = useState("solid")
  const [showLabels, setShowLabels] = useState(true)
  const [routeColor, setRouteColor] = useState("#B45309")
  const [markerColor, setMarkerColor] = useState("#B45309")
  const [markerSize, setMarkerSize] = useState([1])
  const [mapPadding, setMapPadding] = useState([60])
  const [stampRotation, setStampRotation] = useState([0])
  const [stampOpacity, setStampOpacity] = useState([0.9])
  const [showCompass, setShowCompass] = useState(true)
  const [showScale, setShowScale] = useState(true)
  const [mapLanguage, setMapLanguage] = useState("es")
  const [mapProjection, setMapProjection] = useState("mercator")
  const [stampText, setStampText] = useState("")
  const [stampFont, setStampFont] = useState("serif")
  const [stampFontSize, setStampFontSize] = useState([16])
  const [stampFontColor, setStampFontColor] = useState("#000000")
  const [stampBackgroundColor, setStampBackgroundColor] = useState("#FFFFFF")
  const [stampBackgroundOpacity, setStampBackgroundOpacity] = useState([0.7])
  const [stampBorderColor, setStampBorderColor] = useState("#B45309")
  const [stampBorderRadius, setStampBorderRadius] = useState([8])
  const [stampPadding, setStampPadding] = useState([20])
  const [stampShadow, setStampShadow] = useState(true)
  const [stampShadowColor, setStampShadowColor] = useState("#000000")
  const [stampShadowOpacity, setStampShadowOpacity] = useState([0.3])
  const [stampShadowBlur, setStampShadowBlur] = useState([10])
  const [stampShadowOffsetX, setStampShadowOffsetX] = useState([5])
  const [stampShadowOffsetY, setStampShadowOffsetY] = useState([5])
  const [mapTerrain, setMapTerrain] = useState(false)
  const [map3D, setMap3D] = useState(false)
  const [mapFog, setMapFog] = useState(false)
  const [mapAtmosphere, setMapAtmosphere] = useState(false)
  const [mapSky, setMapSky] = useState(false)
  const [mapTime, setMapTime] = useState("day")
  const [mapSeason, setMapSeason] = useState("summer")
  const [mapWeather, setMapWeather] = useState("clear")
  const [mapTraffic, setMapTraffic] = useState(false)
  const [mapBuildings, setMapBuildings] = useState(true)
  const [mapLabels, setMapLabels] = useState(true)
  const [mapPOIs, setMapPOIs] = useState(true)
  const [mapRoads, setMapRoads] = useState(true)
  const [mapWater, setMapWater] = useState(true)
  const [mapLanduse, setMapLanduse] = useState(true)
  const [mapBoundaries, setMapBoundaries] = useState(true)
  const [mapTransit, setMapTransit] = useState(true)
  const [mapContours, setMapContours] = useState(false)
  const [mapSatellite, setMapSatellite] = useState(false)
  const [mapHillshade, setMapHillshade] = useState(false)
  const [mapLandcover, setMapLandcover] = useState(true)
  const [mapWoodland, setMapWoodland] = useState(true)
  const [mapGlaciers, setMapGlaciers] = useState(true)
  const [mapParks, setMapParks] = useState(true)
  const [mapUrban, setMapUrban] = useState(true)
  const [mapAgriculture, setMapAgriculture] = useState(true)
  const [mapGrass, setMapGrass] = useState(true)
  const [mapSand, setMapSand] = useState(true)
  const [mapRock, setMapRock] = useState(true)
  const [mapIce, setMapIce] = useState(true)
  const [mapSnow, setMapSnow] = useState(true)
  const [mapMountains, setMapMountains] = useState(true)
  const [mapDesert, setMapDesert] = useState(true)
  const [mapOcean, setMapOcean] = useState(true)
  const [mapRivers, setMapRivers] = useState(true)
  const [mapLakes, setMapLakes] = useState(true)
  const [mapCoastline, setMapCoastline] = useState(true)
  const [mapIslands, setMapIslands] = useState(true)
  const [mapReefs, setMapReefs] = useState(true)
  const [mapBeaches, setMapBeaches] = useState(true)
  const [mapCliffs, setMapCliffs] = useState(true)
  const [mapCaves, setMapCaves] = useState(true)
  const [mapVolcanoes, setMapVolcanoes] = useState(true)
  const [mapCraters, setMapCraters] = useState(true)
  const [mapGeysers, setMapGeysers] = useState(true)
  const [mapHotSprings, setMapHotSprings] = useState(true)
  const [mapWaterfalls, setMapWaterfalls] = useState(true)
  const [mapCanyons, setMapCanyons] = useState(true)
  const [mapValleys, setMapValleys] = useState(true)
  const [mapPlateaus, setMapPlateaus] = useState(true)
  const [mapPlains, setMapPlains] = useState(true)
  const [mapHills, setMapHills] = useState(true)
  const [mapDunes, setMapDunes] = useState(true)
  const [mapOases, setMapOases] = useState(true)
  const [mapForests, setMapForests] = useState(true)
  const [mapJungles, setMapJungles] = useState(true)
  const [mapSwamps, setMapSwamps] = useState(true)
  const [mapMarshes, setMapMarshes] = useState(true)
  const [mapBogs, setMapBogs] = useState(true)
  const [mapFens, setMapFens] = useState(true)
  const [mapTundra, setMapTundra] = useState(true)
  const [mapSteppes, setMapSteppes] = useState(true)
  const [mapSavannas, setMapSavannas] = useState(true)
  const [mapPrairies, setMapPrairies] = useState(true)
  const [mapMeadows, setMapMeadows] = useState(true)
  const [mapFarmland, setMapFarmland] = useState(true)
  const [mapVineyards, setMapVineyards] = useState(true)
  const [mapOrchards, setMapOrchards] = useState(true)
  const [mapGardens, setMapGardens] = useState(true)
  const [mapGreenhouses, setMapGreenhouses] = useState(true)
  const [mapNurseries, setMapNurseries] = useState(true)
  const [mapPastures, setMapPastures] = useState(true)
  const [mapRanches, setMapRanches] = useState(true)
  const [mapFarms, setMapFarms] = useState(true)
  const [mapFields, setMapFields] = useState(true)
  const [mapCrops, setMapCrops] = useState(true)
  const [mapLivestock, setMapLivestock] = useState(true)
  const [mapPoultry, setMapPoultry] = useState(true)
  const [mapAquaculture, setMapAquaculture] = useState(true)
  const [mapFisheries, setMapFisheries] = useState(true)
  const [mapMines, setMapMines] = useState(true)
  const [mapQuarries, setMapQuarries] = useState(true)
  const [mapOilFields, setMapOilFields] = useState(true)
  const [mapGasFields, setMapGasFields] = useState(true)
  const [mapWindFarms, setMapWindFarms] = useState(true)
  const [mapSolarFarms, setMapSolarFarms] = useState(true)
  const [mapHydroelectric, setMapHydroelectric] = useState(true)
  const [mapNuclear, setMapNuclear] = useState(true)
  const [mapGeothermal, setMapGeothermal] = useState(true)
  const [mapThermal, setMapThermal] = useState(true)
  const [mapBiomass, setMapBiomass] = useState(true)
  const [mapWaste, setMapWaste] = useState(true)
  const [mapLandfills, setMapLandfills] = useState(true)
  const [mapRecycling, setMapRecycling] = useState(true)
  const [mapComposting, setMapComposting] = useState(true)
  const [mapIncinerators, setMapIncinerators] = useState(true)
  const [mapSewage, setMapSewage] = useState(true)
  const [mapWastewater, setMapWastewater] = useState(true)
  const [mapWaterTreatment, setMapWaterTreatment] = useState(true)
  const [mapWaterSupply, setMapWaterSupply] = useState(true)
  const [mapAqueducts, setMapAqueducts] = useState(true)
  const [mapReservoirs, setMapReservoirs] = useState(true)
  const [mapDams, setMapDams] = useState(true)
  const [mapLevees, setMapLevees] = useState(true)
  const [mapDikes, setMapDikes] = useState(true)
  const [mapFloodwalls, setMapFloodwalls] = useState(true)
  const [mapSeawalls, setMapSeawalls] = useState(true)
  const [mapBreakwaters, setMapBreakwaters] = useState(true)
  const [mapJetties, setMapJetties] = useState(true)
  const [mapGroins, setMapGroins] = useState(true)
  const [mapPiers, setMapPiers] = useState(true)
  const [mapDocks, setMapDocks] = useState(true)
  const [mapMarinas, setMapMarinas] = useState(true)
  const [mapHarbors, setMapHarbors] = useState(true)
  const [mapPorts, setMapPorts] = useState(true)
  const [mapLighthouses, setMapLighthouses] = useState(true)
  const [mapBuoys, setMapBuoys] = useState(true)
  const [mapBeacons, setMapBeacons] = useState(true)
  const [mapAirports, setMapAirports] = useState(true)
  const [mapAirfields, setMapAirfields] = useState(true)
  const [mapRunways, setMapRunways] = useState(true)
  const [mapTaxiways, setMapTaxiways] = useState(true)
  const [mapAprons, setMapAprons] = useState(true)
  const [mapTerminals, setMapTerminals] = useState(true)
  const [mapHangars, setMapHangars] = useState(true)
  const [mapControlTowers, setMapControlTowers] = useState(true)
  const [mapHelipads, setMapHelipads] = useState(true)
  const [mapHeliports, setMapHeliports] = useState(true)
  const [mapSeaplaneBases, setMapSeaplaneBases] = useState(true)
  const [mapSpaceports, setMapSpaceports] = useState(true)
  const [mapLaunchPads, setMapLaunchPads] = useState(true)
  const [mapRailways, setMapRailways] = useState(true)
  const [mapRailStations, setMapRailStations] = useState(true)
  const [mapRailYards, setMapRailYards] = useState(true)
  const [mapRailDepots, setMapRailDepots] = useState(true)
  const [mapRailBridges, setMapRailBridges] = useState(true)
  const [mapRailTunnels, setMapRailTunnels] = useState(true)
  const [mapRailCrossings, setMapRailCrossings] = useState(true)
  const [mapRailSignals, setMapRailSignals] = useState(true)
  const [mapRailSwitches, setMapRailSwitches] = useState(true)
  const [mapRailTurntables, setMapRailTurntables] = useState(true)
  const [mapRailRoundhouses, setMapRailRoundhouses] = useState(true)
  const [mapSubways, setMapSubways] = useState(true)
  const [mapSubwayStations, setMapSubwayStations] = useState(true)
  const [mapSubwayLines, setMapSubwayLines] = useState(true)
  const [mapSubwayTunnels, setMapSubwayTunnels] = useState(true)
  const [mapSubwayViaducts, setMapSubwayViaducts] = useState(true)
  const [mapSubwayBridges, setMapSubwayBridges] = useState(true)
  const [mapSubwayDepots, setMapSubwayDepots] = useState(true)
  const [mapSubwayYards, setMapSubwayYards] = useState(true)
  const [mapSubwayWorkshops, setMapSubwayWorkshops] = useState(true)
  const [mapSubwayPowerStations, setMapSubwayPowerStations] = useState(true)
  const [mapSubwayVentilationShafts, setMapSubwayVentilationShafts] = useState(true)
  const [mapSubwayEmergencyExits, setMapSubwayEmergencyExits] = useState(true)
  const [mapSubwayEntrances, setMapSubwayEntrances] = useState(true)
  const [mapSubwayExits, setMapSubwayExits] = useState(true)
  const [mapSubwayEscalators, setMapSubwayEscalators] = useState(true)
  const [mapSubwayElevators, setMapSubwayElevators] = useState(true)
  const [mapSubwayStairs, setMapSubwayStairs] = useState(true)
  const [mapSubwayPlatforms, setMapSubwayPlatforms] = useState(true)
  const [mapSubwayTicketMachines, setMapSubwayTicketMachines] = useState(true)
  const [mapSubwayTicketOffices, setMapSubwayTicketOffices] = useState(true)
  const [mapSubwayTicketGates, setMapSubwayTicketGates] = useState(true)
  const [mapSubwayTicketBarriers, setMapSubwayTicketBarriers] = useState(true)
  const [mapSubwayTicketValidators, setMapSubwayTicketValidators] = useState(true)
  const [mapSubwayTicketInspectors, setMapSubwayTicketInspectors] = useState(true)
  const [mapSubwayTicketControllers, setMapSubwayTicketControllers] = useState(true)
  const [mapSubwayTicketCheckers, setMapSubwayTicketCheckers] = useState(true)
  const [mapSubwayTicketCollectors, setMapSubwayTicketCollectors] = useState(true)
  const [mapSubwayTicketSellers, setMapSubwayTicketSellers] = useState(true)
  const [mapSubwayTicketBuyers, setMapSubwayTicketBuyers] = useState(true)
  const [mapSubwayTicketUsers, setMapSubwayTicketUsers] = useState(true)
  const [mapSubwayTicketHolders, setMapSubwayTicketHolders] = useState(true)
  const [mapSubwayTicketOwners, setMapSubwayTicketOwners] = useState(true)
  const [mapSubwayTicketPossessors, setMapSubwayTicketPossessors] = useState(true)
  const [mapSubwayTicketBearers, setMapSubwayTicketBearers] = useState(true)
  const [mapSubwayTicketCarriers, setMapSubwayTicketCarriers] = useState(true)
  const [mapSubwayTicketTransporters, setMapSubwayTicketTransporters] = useState(true)
  const [mapSubwayTicketConveyors, setMapSubwayTicketConveyors] = useState(true)
  const [mapSubwayTicketMovers, setMapSubwayTicketMovers] = useState(true)
  const [mapSubwayTicketShifters, setMapSubwayTicketShifters] = useState(true)
  const [mapSubwayTicketTransferrers, setMapSubwayTicketTransferrers] = useState(true)
  const [mapSubwayTicketPassers, setMapSubwayTicketPassers] = useState(true)
  const [mapSubwayTicketHandlers, setMapSubwayTicketHandlers] = useState(true)
  const [mapSubwayTicketManipulators, setMapSubwayTicketManipulators] = useState(true)
  const [mapSubwayTicketOperators, setMapSubwayTicketOperators] = useState(true)
  const [mapSubwayTicketActuators, setMapSubwayTicketActuators] = useState(true)
  const [mapSubwayTicketActivators, setMapSubwayTicketActivators] = useState(true)
  const [mapSubwayTicketTriggers, setMapSubwayTicketTriggers] = useState(true)
  const [mapSubwayTicketInitiators, setMapSubwayTicketInitiators] = useState(true)
  const [mapSubwayTicketStarters, setMapSubwayTicketStarters] = useState(true)
  const [mapSubwayTicketBeginners, setMapSubwayTicketBeginners] = useState(true)
  const [mapSubwayTicketComm, setMapSubwayTicketComm] = useState(true)

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

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    if (map.current) return // Si el mapa ya está inicializado, no hacer nada
    if (!mapContainer.current) return // Si el contenedor del mapa no existe, no hacer nada

    // Crear el mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: mapCenter,
      zoom: zoom[0],
      attributionControl: false,
    })

    // Añadir controles al mapa
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right")
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false,
      }),
      "top-right",
    )

    // Cuando el mapa se carga, actualizar el estado
    map.current.on("load", () => {
      setMapLoaded(true)
      console.log("Mapa cargado correctamente")
    })

    // Limpiar cuando el componente se desmonta
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Actualizar el estilo del mapa cuando cambia
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(mapStyle)
    }
  }, [mapStyle, mapLoaded])

  // Actualizar el zoom del mapa cuando cambia
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setZoom(zoom[0])
    }
  }, [zoom, mapLoaded])

  // Función para buscar ubicaciones usando la API de Mapbox
  const searchLocation = async () => {
    if (!location.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}&limit=5`,
      )

      if (!response.ok) {
        throw new Error("Error en la búsqueda")
      }

      const data = await response.json()
      setSearchResults(data.features || [])
    } catch (error) {
      console.error("Error buscando ubicación:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar tecla Enter en el campo de búsqueda
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchLocation()
    }
  }

  // Función para añadir una ubicación desde los resultados de búsqueda
  const addLocationFromSearch = (result: any) => {
    const newLocation = {
      name: result.place_name,
      coordinates: result.center as [number, number],
    }

    setLocations([...locations, newLocation])
    setSearchResults([])
    setLocation("")

    // Actualizar el mapa para mostrar la nueva ubicación
    if (map.current && mapLoaded) {
      // Si es la primera ubicación, centrar el mapa en ella
      if (locations.length === 0) {
        map.current.flyTo({
          center: newLocation.coordinates,
          zoom: zoom[0],
          essential: true,
        })
      }

      // Añadir marcador para la nueva ubicación
      const marker = new mapboxgl.Marker({ color: markerColor }).setLngLat(newLocation.coordinates).addTo(map.current)

      // Si hay más de una ubicación, dibujar una línea entre ellas
      if (locations.length > 0) {
        // Crear una línea entre la última ubicación y la nueva
        const lastLocation = locations[locations.length - 1]

        // Verificar si ya existe la fuente y la capa
        if (!map.current.getSource("route")) {
          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [lastLocation.coordinates, newLocation.coordinates],
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
          // Actualizar la fuente existente
          const source = map.current.getSource("route") as mapboxgl.GeoJSONSource
          const allCoordinates = [...locations.map((loc) => loc.coordinates), newLocation.coordinates]

          source.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: allCoordinates,
            },
          })
        }
      }

      // Ajustar el mapa para mostrar todas las ubicaciones
      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()

        // Añadir todas las ubicaciones existentes
        locations.forEach((loc) => {
          bounds.extend(loc.coordinates)
        })

        // Añadir la nueva ubicación
        bounds.extend(newLocation.coordinates)

        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        })

        setMapBounds(bounds)
      }
    }
  }

  // Función para eliminar una ubicación
  const removeLocation = (index: number) => {
    const newLocations = [...locations]
    newLocations.splice(index, 1)
    setLocations(newLocations)

    // Actualizar el mapa
    if (map.current && mapLoaded) {
      // Eliminar todos los marcadores y volver a añadirlos
      map.current
        .getCanvas()
        .querySelectorAll(".mapboxgl-marker")
        .forEach((marker) => {
          marker.remove()
        })

      // Añadir marcadores para las ubicaciones restantes
      newLocations.forEach((loc) => {
        new mapboxgl.Marker({ color: markerColor }).setLngLat(loc.coordinates).addTo(map.current)
      })

      // Actualizar la ruta
      if (newLocations.length > 1) {
        const source = map.current.getSource("route") as mapboxgl.GeoJSONSource
        const allCoordinates = newLocations.map((loc) => loc.coordinates)

        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: allCoordinates,
          },
        })
      } else if (newLocations.length === 1) {
        // Si solo queda una ubicación, eliminar la ruta
        if (map.current.getLayer("route")) {
          map.current.removeLayer("route")
          map.current.removeSource("route")
        }
      } else {
        // Si no quedan ubicaciones, eliminar la ruta
        if (map.current.getLayer("route")) {
          map.current.removeLayer("route")
          map.current.removeSource("route")
        }
      }

      // Ajustar el mapa para mostrar todas las ubicaciones restantes
      if (newLocations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()

        newLocations.forEach((loc) => {
          bounds.extend(loc.coordinates)
        })

        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        })

        setMapBounds(bounds)
      } else {
        // Si no quedan ubicaciones, volver a la vista predeterminada
        map.current.flyTo({
          center: mapCenter,
          zoom: zoom[0],
          essential: true,
        })

        setMapBounds(null)
      }
    }
  }

  // Función para generar la estampita
  const generateMap = async () => {
    if (locations.length === 0) return

    setIsGenerating(true)

    try {
      // Asegurarse de que el mapa está ajustado para mostrar todas las ubicaciones
      if (map.current && mapLoaded && mapBounds) {
        map.current.fitBounds(mapBounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        })

        // Esperar a que el mapa termine de renderizarse
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Capturar el mapa como imagen
        const mapElement = mapContainer.current
        if (mapElement) {
          const canvas = await html2canvas(mapElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          })

          // Convertir el canvas a una URL de datos
          const dataUrl = canvas.toDataURL("image/png")
          setGeneratedMap(dataUrl)
        }
      }
    } catch (error) {
      console.error("Error generando el mapa:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para descargar el mapa
  const downloadMap = () => {
    if (!generatedMap) return

    // Crear un enlace temporal y descargar la imagen
    const link = document.createElement("a")
    link.href = generatedMap
    link.download = `${tripTitle.replace(/\s+/g, "-").toLowerCase() || "mi-viaje"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para compartir el mapa
  const shareMap = () => {
    if (!generatedMap) return
    setShowShareModal(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Añadir Destinos</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="trip-title">Título del viaje</Label>
              <Input
                id="trip-title"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                placeholder="Ej: Ruta por Andalucía"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Buscar ubicación</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Barcelona, España"
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button onClick={searchLocation} disabled={isSearching}>
                  {isSearching ? "Buscando..." : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-3 py-2 text-sm font-medium">Resultados</div>
                <div className="divide-y">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                      onClick={() => addLocationFromSearch(result)}
                    >
                      <div>
                        <div className="font-medium">{result.text}</div>
                        <div className="text-sm text-muted-foreground">{result.place_name}</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                        <X className="h-4 w-4" />
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
          <h2 className="text-xl font-bold mb-4">Vista previa del mapa</h2>
          <div ref={mapContainer} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-amber-200" />
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
                      <SelectItem value="mapbox://styles/mapbox/streets-v11">Calles</SelectItem>
                      <SelectItem value="mapbox://styles/mapbox/outdoors-v11">Exteriores</SelectItem>
                      <SelectItem value="mapbox://styles/mapbox/light-v10">Claro</SelectItem>
                      <SelectItem value="mapbox://styles/mapbox/dark-v10">Oscuro</SelectItem>
                      <SelectItem value="mapbox://styles/mapbox/satellite-v9">Satélite</SelectItem>
                      <SelectItem value="mapbox://styles/mapbox/satellite-streets-v11">Satélite con Calles</SelectItem>
                      <SelectItem value="mapbox://styles/mapbox/navigation-day-v1">Navegación (Día)</SelectItem>
                      <SelectItem value="mapbox://styles/mapbox/navigation-night-v1">Navegación (Noche)</SelectItem>
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

                <div>
                  <Label htmlFor="route-color">Color de Ruta</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="color"
                      id="route-color"
                      value={routeColor}
                      onChange={(e) => setRouteColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium">{routeColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="marker-color">Color de Marcadores</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="color"
                      id="marker-color"
                      value={markerColor}
                      onChange={(e) => setMarkerColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium">{markerColor}</span>
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

                <div>
                  <Label htmlFor="marker-size" className="flex items-center justify-between">
                    <span>Tamaño de Marcadores</span>
                    <span className="text-sm text-muted-foreground">{markerSize[0]}x</span>
                  </Label>
                  <Slider
                    id="marker-size"
                    defaultValue={markerSize}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={setMarkerSize}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="map-padding" className="flex items-center justify-between">
                    <span>Padding del Mapa</span>
                    <span className="text-sm text-muted-foreground">{mapPadding[0]}px</span>
                  </Label>
                  <Slider
                    id="map-padding"
                    defaultValue={mapPadding}
                    min={0}
                    max={200}
                    step={10}
                    onValueChange={setMapPadding}
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
              <Button variant="outline" onClick={shareMap}>
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


















































































