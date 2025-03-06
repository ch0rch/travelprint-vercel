// Claves para almacenamiento local
const PREMIUM_KEY = "premiumStatus"
const LICENSE_KEY_KEY = "licenseKey"
const EXPIRY_DATE_KEY = "expiryDate"

// Duración de la suscripción premium en milisegundos (3 meses)
const PREMIUM_DURATION = 1000 * 60 * 60 * 24 * 90 // 90 días

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Función para verificar y guardar el estado premium
export async function verifyAndSavePremiumStatus(licenseKey: string): Promise<boolean> {
  try {
    const response = await fetch("/api/verify-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey: licenseKey,
        // Añadir el timestamp actual para evitar problemas de caché
        timestamp: Date.now(),
      }),
    })

    if (!response.ok) {
      console.error("Error response from server:", await response.text())
      return false
    }

    const data = await response.json()

    if (data.success) {
      // Guardar con la fecha de expiración proporcionada por el servidor
      localStorage.setItem(PREMIUM_KEY, "true")
      localStorage.setItem(LICENSE_KEY_KEY, licenseKey)
      localStorage.setItem(EXPIRY_DATE_KEY, data.expiryDate.toString())

      // Forzar una recarga de la página para actualizar la UI
      window.location.reload()
      return true
    }

    return false
  } catch (error) {
    console.error("Error verifying license:", error)
    return false
  }
}

// Función para verificar si el usuario es premium
export function isPremiumUser(): boolean {
  if (!isBrowser) return false

  try {
    const isPremium = localStorage.getItem(PREMIUM_KEY) === "true"

    // Verificar si ha expirado
    if (isPremium) {
      const expiryDate = getExpiryDate()
      if (expiryDate && expiryDate < new Date()) {
        // Ha expirado, limpiar el estado premium
        clearPremiumStatus()
        return false
      }
    }

    return isPremium
  } catch (error) {
    console.error("Error al verificar estado premium:", error)
    return false
  }
}

// Obtener la clave de licencia
export function getLicenseKey(): string | null {
  if (!isBrowser) return null
  return localStorage.getItem(LICENSE_KEY_KEY)
}

// Función para obtener la fecha de expiración
export function getExpiryDate(): Date | null {
  if (!isBrowser) return null

  try {
    const expiryDateStr = localStorage.getItem(EXPIRY_DATE_KEY)
    return expiryDateStr ? new Date(Number.parseInt(expiryDateStr, 10)) : null
  } catch (error) {
    console.error("Error al obtener fecha de expiración:", error)
    return null
  }
}

// Función para calcular los días restantes
export function getRemainingDays(): number | null {
  const expiryDate = getExpiryDate()
  if (!expiryDate) return null

  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

// Limpiar estado premium (por si necesitas una función de logout)
export function clearPremiumStatus(): void {
  if (!isBrowser) return

  localStorage.removeItem(PREMIUM_KEY)
  localStorage.removeItem(LICENSE_KEY_KEY)
  localStorage.removeItem(EXPIRY_DATE_KEY)
}

// Añadir una función para verificar el estado de la compra por URL
export function checkPurchaseFromURL(): void {
  if (!isBrowser) return

  try {
    // Verificar si hay parámetros de compra en la URL
    const urlParams = new URLSearchParams(window.location.search)
    const licenseKey = urlParams.get("license_key")

    if (licenseKey) {
      // Limpiar la URL para evitar verificaciones duplicadas
      window.history.replaceState({}, document.title, window.location.pathname)

      // Verificar la compra
      verifyAndSavePremiumStatus(licenseKey)
    }
  } catch (error) {
    console.error("Error checking purchase from URL:", error)
  }
}



