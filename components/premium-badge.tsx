"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { getRemainingDays } from "@/utils/premium-storage"

interface PremiumBadgeProps {
  onRenew?: () => void
}

export default function PremiumBadge({ onRenew }: PremiumBadgeProps) {
  const [remainingDays, setRemainingDays] = useState<number>(0)

  useEffect(() => {
    // Asegurarse de que getRemainingDays existe antes de llamarla
    if (typeof getRemainingDays === "function") {
      setRemainingDays(getRemainingDays())
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="bg-amber-50 text-amber-700 border-amber-200 px-2 py-1 flex items-center gap-1"
      >
        <Crown className="h-3 w-3 text-amber-500" />
        <span className="font-medium">Premium</span>
      </Badge>

      {remainingDays < 30 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRenew}
          className="text-xs h-7 px-2 border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          {remainingDays <= 0 ? "Renovar" : `${remainingDays} días`}
        </Button>
      )}
    </div>
  )
}




