"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { verifyAndSavePremiumStatus } from "@/utils/premium-storage"
import { updateCreditsFromLicense } from "@/utils/credits-storage"

interface ActivatePremiumModalProps {
  onClose: () => void
}

export default function ActivatePremiumModal({ onClose }: ActivatePremiumModalProps) {
  const [licenseKey, setLicenseKey] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError("Por favor ingresa tu clave de licencia")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch("/api/verify-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response from server:", errorText)
        throw new Error("Error al verificar la licencia")
      }

      const data = await response.json()

      if (data.success) {
        // Guardar estado premium
        const result = await verifyAndSavePremiumStatus(licenseKey.trim())

        // Actualizar créditos
        if (data.credits) {
          updateCreditsFromLicense(data.credits)
        }

        setSuccess(true)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError("No pudimos verificar tu licencia. Por favor verifica la clave e intenta nuevamente.")
      }
    } catch (err) {
      setError("Ocurrió un error al verificar tu licencia. Por favor intenta nuevamente.")
      console.error("Error activating premium:", err)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Activar Cuenta Premium</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          {success && <div className="text-green-500 text-sm mb-4">Licencia activada con éxito! Recargando...</div>}
          <Input
            disabled={isVerifying || success}
            type="text"
            placeholder="Ingresa tu clave de licencia"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="mb-4"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancelar
          </Button>
          <Button
            onClick={handleActivate}
            disabled={isVerifying || success}
            className={isVerifying ? "opacity-70" : ""}
          >
            {isVerifying ? "Verificando..." : "Activar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}








