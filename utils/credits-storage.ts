// Claves para almacenamiento local
const CREDITS_KEY = "aiCredits"
const CREDITS_HISTORY_KEY = "aiCreditsHistory"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Función para obtener créditos actuales
export function getCurrentCredits(): number {
  if (typeof window === "undefined") return 0

  try {
    const credits = localStorage.getItem(CREDITS_KEY)
    // Si no hay créditos almacenados, devolver 0
    if (!credits) return 0

    // Convertir a número y asegurarse de que sea un valor válido
    const creditsNum = Number.parseInt(credits, 10)
    return isNaN(creditsNum) ? 0 : creditsNum
  } catch (error) {
    console.error("Error al obtener créditos:", error)
    return 0
  }
}

// Función para usar créditos
export function useCredits(amount: number): boolean {
  if (!isBrowser) return false

  const currentCredits = getCurrentCredits()
  if (currentCredits < amount) return false

  const newBalance = currentCredits - amount
  localStorage.setItem(CREDITS_KEY, newBalance.toString())

  // Registrar en el historial
  addToHistory({
    type: "usage",
    amount,
    description: "Generación de estampita con IA",
    timestamp: Date.now(),
  })

  return true
}

// Función para añadir créditos
export function addCredits(amount: number, description = "Compra de créditos"): boolean {
  if (!isBrowser) return false

  const currentCredits = getCurrentCredits()
  const newBalance = currentCredits + amount
  localStorage.setItem(CREDITS_KEY, newBalance.toString())

  // Registrar en el historial
  addToHistory({
    type: "purchase",
    amount,
    description,
    timestamp: Date.now(),
  })

  return true
}

// Tipo para transacciones de créditos
interface CreditTransaction {
  type: "purchase" | "usage" | "bonus" | "refund"
  amount: number
  description: string
  timestamp: number
}

// Función para añadir al historial
function addToHistory(transaction: CreditTransaction): void {
  if (!isBrowser) return

  try {
    const historyStr = localStorage.getItem(CREDITS_HISTORY_KEY)
    const history: CreditTransaction[] = historyStr ? JSON.parse(historyStr) : []

    history.push(transaction)

    // Limitar el historial a las últimas 100 transacciones
    const limitedHistory = history.slice(-100)

    localStorage.setItem(CREDITS_HISTORY_KEY, JSON.stringify(limitedHistory))
  } catch (error) {
    console.error("Error al actualizar historial:", error)
  }
}

// Función para obtener el historial
export function getCreditsHistory(): CreditTransaction[] {
  if (!isBrowser) return []

  try {
    const historyStr = localStorage.getItem(CREDITS_HISTORY_KEY)
    return historyStr ? JSON.parse(historyStr) : []
  } catch (error) {
    console.error("Error al obtener historial:", error)
    return []
  }
}

// Función para actualizar créditos al activar licencia
export function updateCreditsFromLicense(credits: number): boolean {
  if (!isBrowser) return false

  try {
    // Actualizar créditos
    localStorage.setItem(CREDITS_KEY, credits.toString())

    // Registrar en el historial
    addToHistory({
      type: "purchase",
      amount: credits,
      description: "Activación de licencia",
      timestamp: Date.now(),
    })

    return true
  } catch (error) {
    console.error("Error al actualizar créditos:", error)
    return false
  }
}





