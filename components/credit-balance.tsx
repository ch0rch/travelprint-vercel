"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, Plus } from "lucide-react"
import { getCurrentCredits } from "@/utils/credits-storage"

export default function CreditBalance() {
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    // Actualizar créditos al cargar el componente
    setCredits(getCurrentCredits())

    // Actualizar cuando la ventana recibe el foco
    const handleFocus = () => {
      setCredits(getCurrentCredits())
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="h-5 w-5 text-amber-500 mr-2" />
            <div>
              <h3 className="font-medium">Tus Créditos</h3>
              <p className="text-2xl font-bold text-amber-700">{credits}</p>
            </div>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-700">
            <Plus className="h-4 w-4 mr-1" />
            Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

