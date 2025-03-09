"use client"

import { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react"
import { verifyAndSavePremiumStatus } from "@/utils/premium-storage"
import { updateCreditsFromLicense } from "@/utils/credits-storage"

export default function ActivatePremiumModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
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
    <>
      <Button onPress={onOpen} color="primary">
        Activar Premium
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Activar Cuenta Premium</ModalHeader>
              <ModalBody>
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                {success && (
                  <div className="text-green-500 text-sm mb-4">Licencia activada con éxito! Recargando...</div>
                )}
                <Input
                  isDisabled={isVerifying || success}
                  type="text"
                  label="Clave de Licencia"
                  placeholder="Ingresa tu clave de licencia"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleActivate} isLoading={isVerifying} isDisabled={success}>
                  Activar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}






