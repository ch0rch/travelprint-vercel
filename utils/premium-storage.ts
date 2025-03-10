// utils/premium-storage.ts

const LICENSE_KEY = "premium_license"
const EXPIRY_DATE_KEY = "premium_expiry"

export function isPremiumUser(): boolean {
  if (typeof window === "undefined") return false

  try {
    // Verificar si hay una licencia almacenada
    const licenseKey = localStorage.getItem(LICENSE_KEY)
    if (!licenseKey) return false

    // Verificar si hay una fecha de expiración almacenada
    const expiryDateStr = localStorage.getItem(EXPIRY_DATE_KEY)
    if (!expiryDateStr) return false

    // Convertir la fecha de expiración a número
    const expiryDate = Number.parseInt(expiryDateStr, 10)

    // Verificar si la licencia ha expirado
    const now = Date.now()
    return expiryDate > now
  } catch (error) {
    console.error("Error al verificar estado premium:", error)
    return false
  }
}






