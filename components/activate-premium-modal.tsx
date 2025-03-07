"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, CheckCircle, AlertCircle } from "lucide-react"
import { verifyAndSavePremiumStatus } from "@/utils/premium-storage"

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
      const result = await verifyAndSavePremiumStatus(licenseKey.trim())

      if (result) {
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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Crown className="h-6 w-6 text-amber-500 mr-2" />
              <h3 className="text-xl font-bold">Activar Premium</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
              &times;
            </button>
          </div>

          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700 mb-2">¡Premium Activado!</h3>
              <p className="mb-4">Tu cuenta premium ha sido activada correctamente.</p>
              <p className="text-sm text-muted-foreground">La página se recargará automáticamente...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                Para activar tu cuenta premium, ingresa la clave de licencia que recibiste en tu correo electrónico
                después de completar la compra.
              </p>

              <div>
                <label htmlFor="license-key" className="block text-sm font-medium mb-1">
                  Clave de Licencia
                </label>
                <Input
                  id="license-key"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="Ej: LS-XXXX-XXXX-XXXX-XXXX"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  La clave de licencia se encuentra en el correo de confirmación de compra.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleActivate}
                  disabled={isVerifying || !licenseKey.trim()}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-700"
                >
                  {isVerifying ? "Verificando..." : "Activar Premium"}
                </Button>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-2">¿No encuentras tu clave de licencia?</h4>
                <p className="text-xs text-muted-foreground">
                  Revisa tu correo electrónico (incluyendo la carpeta de spam) o contacta a soporte en{" "}
                  <a href="mailto:soporte@travelprint.me" className="text-amber-600 hover:underline">
                    soporte@travelprint.me
                  </a>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




