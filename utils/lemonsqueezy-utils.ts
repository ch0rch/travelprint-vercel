// utils/lemonsqueezy-utils.ts

/**
 * Verifica si hay un parámetro de licencia en la URL y lo procesa
 * @returns Un objeto con el resultado de la verificación
 */
export function checkPurchaseFromURL(): { licenseKey: string | null; isValid: boolean } {
    if (typeof window === "undefined") {
      return { licenseKey: null, isValid: false }
    }
  
    try {
      // Obtener parámetros de la URL
      const urlParams = new URLSearchParams(window.location.search)
      const licenseKey = urlParams.get("license_key")
  
      // Si no hay licenseKey, retornar null
      if (!licenseKey) {
        return { licenseKey: null, isValid: false }
      }
  
      // Limpiar la URL para no mostrar la licencia
      if (window.history && window.history.replaceState) {
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
  
      return { licenseKey, isValid: true }
    } catch (error) {
      console.error("Error al verificar licencia en URL:", error)
      return { licenseKey: null, isValid: false }
    }
  }
  
  /**
   * Construye una URL para el checkout de LemonSqueezy
   * @param productId ID del producto en LemonSqueezy
   * @param isRenewal Indica si es una renovación
   * @returns URL completa para el checkout
   */
  export function buildLemonSqueezyCheckoutURL(productId: string, isRenewal = false): string {
    const baseURL = `https://travelprint.lemonsqueezy.com/buy/${productId}`
  
    // Añadir parámetros personalizados
    const returnUrl = typeof window !== "undefined" ? `${window.location.origin}?license_key={license_key}` : ""
  
    const customParams = new URLSearchParams({
      "checkout[custom][purchase_id]": Date.now().toString(),
      "checkout[custom][is_renewal]": isRenewal ? "true" : "false",
      "checkout[redirect_url]": returnUrl,
    })
  
    return `${baseURL}?${customParams.toString()}`
  }
  
  