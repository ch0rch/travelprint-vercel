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

// Función para guardar el estado premium
export async function verifyAndSavePremiumStatus(licenseKey: string): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    // Verificar la licencia con el servidor
    const response = await fetch("/api/verify-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey,
        timestamp: Date.now(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Error al verificar licencia: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      return false
    }

    // Guardar la licencia y la fecha de expiración
    localStorage.setItem(LICENSE_KEY, licenseKey)
    localStorage.setItem(EXPIRY_DATE_KEY, data.expiryDate.toString())

    return true
  } catch (error) {
    console.error("Error al verificar y guardar estado premium:", error)
    return false
  }
}

// Función para limpiar el estado premium
export function clearPremiumStatus(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(LICENSE_KEY)
    localStorage.removeItem(EXPIRY_DATE_KEY)
  } catch (error) {
    console.error("Error al limpiar estado premium:", error)
  }
}








