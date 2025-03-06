"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, AlertCircle } from "lucide-react"
import { getRemainingDays, getExpiryDate } from "@/utils/premium-storage"

interface ExpiryReminderModalProps {
  onRenew: () => void
  onClose: () => void
}

export default function ExpiryReminderModal({ onRenew, onClose }: ExpiryReminderModalProps) {
  const [remainingDays, setRemainingDays] = useState<number | null>(null)
  const [expiryDate, setExpiryDate] = useState<Date | null>(null)

  useEffect(() => {
    setRemainingDays(getRemainingDays())
    setExpiryDate(getExpiryDate())
  }, [])

  if (!remainingDays || !expiryDate || remainingDays > 7) return null

  const formattedDate = expiryDate.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-xl font-bold">Tu suscripción premium está por expirar</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              &times;
            </button>
          </div>

          <div className="space-y-4">
            <p>
              Tu suscripción premium expirará el <strong>{formattedDate}</strong> ({remainingDays} días restantes).
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium flex items-center text-amber-800 mb-2">
                <Crown className="h-4 w-4 text-amber-500 mr-2" />
                Beneficios premium que perderás:
              </h4>
              <ul className="text-sm space-y-1 text-amber-700">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Formatos adicionales (vertical, horizontal, historia)
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Estilos de mapa premium (satélite, nocturno)
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Comentarios personalizados
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Descarga sin marca de agua
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Alta resolución (4x)
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Recordarme después
              </Button>
              <Button onClick={onRenew} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-700">
                <Crown className="h-4 w-4 mr-2" />
                Renovar ahora ($5)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


