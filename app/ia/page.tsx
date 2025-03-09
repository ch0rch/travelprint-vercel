"use client"

import { useState, useEffect } from "react"
import { SiteFooter } from "@/components/site-footer"
import AIIllustratedStamp from "@/components/ai-illustrated-stamp"
import PremiumBadge from "@/components/premium-badge"
import { Button } from "@/components/ui/button"
import { Crown, AlertCircle } from "lucide-react"
import { isPremiumUser } from "@/utils/premium-storage"
import DiscoverPremiumModal from "@/components/discover-premium-modal"
import ActivatePremiumModal from "@/components/activate-premium-modal"

// URL directa al producto en LemonSqueezy (mantener el mismo ID)
const LEMONSQUEEZY_PRODUCT_URL = "https://travelprint.lemonsqueezy.com/buy/2002abe5-88e1-4541-95f6-8ca287abaa44"

export default function AIStampPage() {
  const [isPremium, setIsPremium] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)

  useEffect(() => {
    setIsPremium(isPremiumUser())
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
    link.download = `estampita-ilustrada.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            {isPremium && <PremiumBadge onRenew={openLemonSqueezyCheckout} />}
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

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <AIIllustratedStamp
              tripName=""
              destinations={[]}
              onDownload={handleDownload}
              onOpenPremium={() => setShowPremiumModal(true)}
            />
          </div>
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



