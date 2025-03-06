"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, AlertCircle } from "lucide-react"
import { getExpiryDate, getRemainingDays } from "@/utils/premium-storage"

interface PremiumBadgeProps {
  onRenew: () => void
}

export default function PremiumBadge({ onRenew }: PremiumBadgeProps) {
  const [remainingDays, setRemainingDays] = useState<number | null>(null)
  const [expiryDate, setExpiryDate] = useState<Date | null>(null)

  useEffect(() => {
    // Actualizar los datos de expiración
    setRemainingDays(getRemainingDays())
    setExpiryDate(getExpiryDate())

    // Actualizar cada día
    const interval = setInterval(
      () => {
        setRemainingDays(getRemainingDays())
      },
      1000 * 60 * 60,
    ) // Cada hora

    return () => clearInterval(interval)
  }, [])

  if (!remainingDays || !expiryDate) return null

  const formattedDate = expiryDate.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const isExpiringSoon = remainingDays <= 7

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1 px-2 py-1"
        >
          <Crown className="h-3 w-3 text-amber-500" />
          <span>Premium</span>
        </Badge>

        {isExpiringSoon && (
          <Badge
            variant="outline"
            className="ml-2 bg-red-50 text-red-800 border-red-200 flex items-center gap-1 px-2 py-1"
          >
            <AlertCircle className="h-3 w-3 text-red-500" />
            <span>Expira pronto</span>
          </Badge>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {isExpiringSoon ? (
          <div className="flex flex-col space-y-2">
            <p className="text-red-600 font-medium">¡Tu suscripción premium expira en {remainingDays} días!</p>
            <Button
              size="sm"
              onClick={onRenew}
              className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-xs"
            >
              <Crown className="h-3 w-3 mr-1" />
              Renovar Premium
            </Button>
          </div>
        ) : (
          <p>
            Tu suscripción premium expira el {formattedDate} ({remainingDays} días restantes)
          </p>
        )}
      </div>
    </div>
  )
}


