// Claves para almacenamiento local
const PREMIUM_KEY = "rv_premium_status"
const ORDER_ID_KEY = "rv_order_id"
const EXPIRY_DATE_KEY = "rv_expiry_date"

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

// Verificar si el usuario es premium y si no ha expirado
export function isPremiumUser(): boolean {
  if (!isBrowser) return false

  const isPremium = localStorage.getItem(PREMIUM_KEY) === "true"
  if (!isPremium) return false

  // Verificar si ha expirado
  const expiryDateStr = localStorage.getItem(EXPIRY_DATE_KEY)
  if (!expiryDateStr) return false

  const expiryDate = Number.parseInt(expiryDateStr, 10)
  const now = Date.now()

  return now < expiryDate
}

// Obtener el ID de orden
export function getOrderId(): string | null {
  if (!isBrowser) return null
  return localStorage.getItem(ORDER_ID_KEY)
}

// Obtener la fecha de expiración
export function getExpiryDate(): Date | null {
  if (!isBrowser) return null

  const expiryDateStr = localStorage.getItem(EXPIRY_DATE_KEY)
  if (!expiryDateStr) return null

  return new Date(Number.parseInt(expiryDateStr, 10))
}

// Obtener días restantes de la suscripción
export function getRemainingDays(): number | null {
  if (!isBrowser) return null

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



