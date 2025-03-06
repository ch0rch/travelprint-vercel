"use client"

import { Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isPremiumUser } from "@/utils/premium-storage"
import { useState, useEffect } from "react"
import ActivatePremiumModal from "./activate-premium-modal"
import Link from "next/link"

// URL directa al producto en LemonSqueezy
const LEMONSQUEEZY_PRODUCT_URL = "https://travelprint.lemonsqueezy.com/buy/2002abe5-88e1-4541-95f6-8ca287abaa44"

export function SiteHeader() {
  const [isPremium, setIsPremium] = useState(false)
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-amber-50/80 backdrop-blur supports-[backdrop-filter]:bg-amber-50/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-amber-900">Recuerdo Viajero</h1>
            {isPremium && (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {!isPremium && (
            <>
              <Button variant="ghost" onClick={() => setShowActivateModal(true)}>
                Activar Licencia
              </Button>
              <Button
                onClick={openLemonSqueezyCheckout}
                className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
              >
                <Crown className="h-4 w-4 mr-2" />
                Volverte Premium
              </Button>
            </>
          )}
        </nav>
      </div>
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <ActivatePremiumModal onClose={() => setShowActivateModal(false)} />
        </div>
      )}
    </header>
  )
}





