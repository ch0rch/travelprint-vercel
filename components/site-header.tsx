"use client"

import { Crown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isPremiumUser } from "@/utils/premium-storage"
import { useState, useEffect } from "react"
import ActivatePremiumModal from "./activate-premium-modal"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
            <h1 className="text-xl font-bold text-amber-900 font-serif tracking-tight">
              <span className="text-amber-700">Travel</span>
              <span className="text-amber-900">Print</span>
              <span className="text-amber-500 text-sm">.me</span>
            </h1>
            {isPremium && (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </Link>
        </div>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/carta-del-creador" className="text-amber-800 hover:text-amber-600 text-sm mr-2">
            Nuestra historia
          </Link>

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

        {/* Menú hamburguesa para móvil */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <Link
                  href="/carta-del-creador"
                  className="text-amber-800 hover:text-amber-600 text-sm font-medium px-2 py-2 rounded-md hover:bg-amber-50"
                >
                  Nuestra historia
                </Link>

                {!isPremium ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowActivateModal(true)
                        document.querySelector("[data-radix-collection-item]")?.click() // Cierra el Sheet
                      }}
                      className="justify-start"
                    >
                      Activar Licencia
                    </Button>
                    <Button
                      onClick={() => {
                        openLemonSqueezyCheckout()
                        document.querySelector("[data-radix-collection-item]")?.click() // Cierra el Sheet
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 justify-start"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Volverte Premium
                    </Button>
                  </>
                ) : (
                  <div className="px-2 py-2 text-sm text-amber-700">
                    <Crown className="h-4 w-4 inline mr-2 text-amber-500" />
                    Usuario Premium
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <ActivatePremiumModal onClose={() => setShowActivateModal(false)} />
        </div>
      )}
    </header>
  )
}











