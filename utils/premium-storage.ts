// Claves para almacenamiento local
const PREMIUM_KEY = "premiumStatus"
const ORDER_ID_KEY = "orderId"
const EXPIRY_DATE_KEY = "expiryDate"

// Modificar la función verifyAndSavePremiumStatus para que acepte un orderId o un código de licencia
export async function verifyAndSavePremiumStatus(orderIdOrLicense: string): Promise<boolean> {
    try {
      const response = await fetch("/api/verify-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderIdOrLicense,
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
        localStorage.setItem(ORDER_ID_KEY, orderIdOrLicense)
        localStorage.setItem(EXPIRY_DATE_KEY, data.expiryDate.toString())
  
        // Forzar una recarga de la página para actualizar la UI
        window.location.reload()
        return true
      }
  
      return false
    } catch (error) {
      console.error("Error verifying purchase:", error)
      return false
    }
  }

// Duración de la suscripción premium en milisegundos (3 meses)
const PREMIUM_DURATION = 1000 * 60 * 60 * 24 * 90 // 90 días

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Guardar estado premium con fecha de expiración
export function savePremiumStatus(orderId: string): void {
  if (!isBrowser) return

  // Calcular fecha de expiración (3 meses desde ahora)
  const expiryDate = Date.now() + PREMIUM_DURATION

  localStorage.setItem(PREMIUM_KEY, "true")
  localStorage.setItem(ORDER_ID_KEY, orderId)
  localStorage.setItem(EXPIRY_DATE_KEY, expiryDate.toString())
}

// Función para verificar si el usuario es premium
export function isPremiumUser(): boolean {
    if (typeof window === "undefined") return false
  
    try {
      const isPremium = localStorage.getItem(PREMIUM_KEY) === "true"
  
      // Verificar si ha expirado
      if (isPremium) {
        const expiryDate = getExpiryDate()
        if (expiryDate && expiryDate < new Date()) {
          // Ha expirado, limpiar el estado premium
          localStorage.removeItem(PREMIUM_KEY)
          localStorage.removeItem(ORDER_ID_KEY)
          localStorage.removeItem(EXPIRY_DATE_KEY)
          return false
        }
      }
  
      return isPremium
    } catch (error) {
      console.error("Error al verificar estado premium:", error)
      return false
    }
  }

// Obtener el ID de orden
export function getOrderId(): string | null {
  if (!isBrowser) return null
  return localStorage.getItem(ORDER_ID_KEY)
}

// Función para obtener la fecha de expiración
export function getExpiryDate(): Date | null {
    if (typeof window === "undefined") return null
  
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
  localStorage.removeItem(ORDER_ID_KEY)
  localStorage.removeItem(EXPIRY_DATE_KEY)
}

// Función para verificar y guardar el estado premium
export async function verifyAndSavePremiumStatus(orderId: string): Promise<boolean> {
    try {
      const response = await fetch("/api/verify-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })
  
      const data = await response.json()
  
      if (data.success) {
        // Guardar con la fecha de expiración proporcionada por el servidor
        localStorage.setItem(PREMIUM_KEY, "true")
        localStorage.setItem(ORDER_ID_KEY, orderId)
        localStorage.setItem(EXPIRY_DATE_KEY, data.expiryDate.toString())
        return true
      }
  
      return false
    } catch (error) {
      console.error("Error verifying purchase:", error)
      return false
    }
  }

  // Añadir una función para verificar el estado de la compra por URL
export function checkPurchaseFromURL(): void {
    if (typeof window === "undefined") return
  
    try {
      // Verificar si hay parámetros de compra en la URL
      const urlParams = new URLSearchParams(window.location.search)
      const orderId = urlParams.get("order_id")
      const licenseKey = urlParams.get("license_key")
  
      if (orderId || licenseKey) {
        // Limpiar la URL para evitar verificaciones duplicadas
        window.history.replaceState({}, document.title, window.location.pathname)
  
        // Verificar la compra
        verifyAndSavePremiumStatus(orderId || licenseKey || "")
      }
    } catch (error) {
      console.error("Error checking purchase from URL:", error)
    }
  }
  
  

