// Claves para almacenamiento local
const CREDITS_KEY = "userCredits"
const LICENSE_KEY_KEY = "licenseKey"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Función para obtener créditos actuales
export function getCurrentCredits(): number {
  if (!isBrowser) return 0

  const credits = localStorage.getItem(CREDITS_KEY)
  return credits ? Number.parseInt(credits, 10) : 0
}

// Función para usar créditos
export function useCredits(amount: number): boolean {
  if (!isBrowser) return false

  const currentCredits = getCurrentCredits()
  if (currentCredits < amount) return false

  const newBalance = currentCredits - amount
  localStorage.setItem(CREDITS_KEY, newBalance.toString())
  return true
}

// Función para añadir créditos
export function addCredits(amount: number): boolean {
  if (!isBrowser) return false

  const currentCredits = getCurrentCredits()
  const newBalance = currentCredits + amount
  localStorage.setItem(CREDITS_KEY, newBalance.toString())
  return true
}

// Función para verificar y guardar créditos al activar licencia
export async function verifyAndSaveCredits(licenseKey: string): Promise<boolean> {
  try {
    if (!isBrowser) return false

    const response = await fetch("/api/verify-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey: licenseKey,
        timestamp: Date.now(),
      }),
    })

    if (!response.ok) return false

    const data = await response.json()

    if (data.success) {
      // Guardar licencia
      localStorage.setItem(LICENSE_KEY_KEY, licenseKey)

      // Asignar créditos según el producto
      // Por defecto, asignar 10 créditos
      const credits = data.credits || 10
      localStorage.setItem(CREDITS_KEY, credits.toString())

      return true
    }

    return false
  } catch (error) {
    console.error("Error verificando licencia:", error)
    return false
  }
}

