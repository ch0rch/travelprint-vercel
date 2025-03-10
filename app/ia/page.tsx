"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SiteFooter } from "@/components/site-footer"
import AIIllustratedStamp from "@/components/ai-illustrated-stamp"
import PremiumBadge from "@/components/premium-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, AlertCircle, Plus, Coins, X } from "lucide-react"
import { isPremiumUser } from "@/utils/premium-storage"
import DiscoverPremiumModal from "@/components/discover-premium-modal"
import ActivatePremiumModal from "@/components/activate-premium-modal"
import { getCurrentCredits } from "@/utils/credits-storage"

// URL directa al producto en LemonSqueezy (mantener el mismo ID)
const LEMONSQUEEZY_PRODUCT_URL = "https://travelprint.lemonsqueezy.com/buy/2002abe5-88e1-4541-95f6-8ca287abaa44"

export default function AIStampPage() {
  const [isPremium, setIsPremium] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [currentCredits, setCurrentCredits] = useState(0)

  // Estados para los nuevos campos
  const [tripTitle, setTripTitle] = useState("")
  const [destinations, setDestinations] = useState<string[]>([])
  const [newDestination, setNewDestination] = useState("")
  const [userPrompt, setUserPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  useEffect(() => {
    setIsPremium(isPremiumUser())
    setCurrentCredits(getCurrentCredits())

    // Actualizar créditos cuando la ventana recibe el foco
    const handleFocus = () => {
      setCurrentCredits(getCurrentCredits())
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const openLemonSqueezyCheckout = () => {
    const returnUrl = typeof window !== "undefined" ? `${window.location.origin}?license_key={license_key}` : ""
    const customParams = new URLSearchParams({
      "checkout[custom][purchase_id]": Date.now().toString(),
      "checkout[custom][is_renewal]": isPremium ? "true" : "false",
      "checkout[redirect_url]": returnUrl,
    })
    const lemonSqueezyUrl = `${LEMONSQUEEZY_PRODUCT_URL}?${customParams.toString()}`
    window.open(lemonSqueezyUrl, "_blank")
  }

  const handleDownload = (imageUrl: string) => {
    // Crear un enlace temporal y descargar la imagen
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `estampita-ilustrada-${tripTitle.replace(/\s+/g, "-").toLowerCase() || "viaje"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para añadir un destino
  const addDestination = () => {
    if (newDestination.trim() && !destinations.includes(newDestination.trim())) {
      setDestinations([...destinations, newDestination.trim()])
      setNewDestination("")
    }
  }

  // Función para eliminar un destino
  const removeDestination = (index: number) => {
    const newDestinations = [...destinations]
    newDestinations.splice(index, 1)
    setDestinations(newDestinations)
  }

  // Manejar tecla Enter en el campo de destino
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addDestination()
    }
  }

  // Función para manejar la generación de imagen
  const handleGenerate = (imageUrl: string) => {
    setGeneratedImage(imageUrl)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">Estampitas Ilustradas con IA</h1>
              <p className="text-amber-700">
                Transforma tus viajes en obras de arte únicas generadas con inteligencia artificial.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isPremium && <PremiumBadge onRenew={openLemonSqueezyCheckout} />}
              <Card className="shadow-sm border border-amber-100">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-sm font-medium text-amber-800">Créditos</p>
                    <p className="text-2xl font-bold text-amber-600">{currentCredits}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={openLemonSqueezyCheckout}
                      className="bg-gradient-to-r from-amber-500 to-amber-700"
                    >
                      <Coins className="h-4 w-4 mr-1" />
                      Comprar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowActivateModal(true)}>
                      Activar licencia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {!isPremium && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-2">Característica Premium</h3>
                  <p className="text-amber-700 mb-4">
                    Las estampitas ilustradas con IA son una característica premium. Obtén 10 créditos por solo $10 y
                    crea recuerdos únicos de tus viajes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => setShowPremiumModal(true)}
                      className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Obtener 10 créditos por $10
                    </Button>
                    <Button variant="outline" onClick={() => setShowActivateModal(true)}>
                      Activar código de licencia
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isPremium && currentCredits < 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-2">Créditos insuficientes</h3>
                  <p className="text-amber-700 mb-4">
                    Te has quedado sin créditos para generar estampitas con IA. Obtén 10 créditos adicionales por solo
                    $10.
                  </p>
                  <Button
                    onClick={openLemonSqueezyCheckout}
                    className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Comprar 10 créditos por $10
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="space-y-6">
              {/* Título del viaje */}
              <div>
                <Label htmlFor="trip-title">Título del viaje</Label>
                <Input
                  id="trip-title"
                  placeholder="Ej: Ruta de los Lagos"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Destinos */}
              <div>
                <Label htmlFor="destination">Destinos</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="destination"
                    placeholder="Ej: Barcelona, España"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={addDestination} type="button">
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                </div>

                {destinations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {destinations.map((dest, index) => (
                      <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1.5 flex items-center gap-1">
                        {dest}
                        <button
                          onClick={() => removeDestination(index)}
                          className="ml-1 rounded-full hover:bg-amber-200 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {destinations.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Añade al menos dos destinos para generar una estampita.
                  </p>
                )}
              </div>

              {/* Prompt personalizado */}
              <div>
                <Label htmlFor="user-prompt">Describe tu viaje (opcional)</Label>
                <Textarea
                  id="user-prompt"
                  placeholder="Describe los paisajes, experiencias o elementos que quieres incluir en tu estampita..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cuantos más detalles proporciones, más personalizada será tu estampita.
                </p>
              </div>

              {/* Componente de generación de estampitas */}
              <div className="pt-4 border-t border-amber-100">
                <AIIllustratedStamp
                  tripName={tripTitle}
                  destinations={destinations}
                  tripComment={userPrompt}
                  onDownload={handleDownload}
                  onOpenPremium={() => setShowPremiumModal(true)}
                />
              </div>
            </div>
          </div>

          {/* Sección de ejemplos o instrucciones */}
          {!generatedImage && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-amber-900 mb-4">Consejos para crear estampitas increíbles</h3>
              <ul className="space-y-2 text-amber-700">
                <li>• Añade al menos dos destinos para obtener mejores resultados.</li>
                <li>
                  • Incluye detalles específicos en la descripción, como "montañas nevadas", "playas tropicales", etc.
                </li>
                <li>• Prueba diferentes estilos artísticos para encontrar el que mejor se adapte a tu viaje.</li>
                <li>• Si no te gusta el resultado, puedes regenerar la imagen (consume 1 crédito adicional).</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showPremiumModal && (
        <DiscoverPremiumModal
          onClose={() => setShowPremiumModal(false)}
          onPurchase={() => {
            openLemonSqueezyCheckout()
            setShowPremiumModal(false)
          }}
        />
      )}

      {showActivateModal && <ActivatePremiumModal onClose={() => setShowActivateModal(false)} />}

      <SiteFooter />
    </main>
  )
}







