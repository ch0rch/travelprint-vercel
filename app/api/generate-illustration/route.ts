import { NextResponse } from "next/server"

// Importar la utilidad de Cloudinary
import { uploadImageFromUrl } from "@/utils/cloudinary"

// Imágenes de ejemplo para diferentes estilos (para pruebas sin API)
const SAMPLE_IMAGES = {
  watercolor: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop",
  "vintage-postcard": "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?q=80&w=1000&auto=format&fit=crop",
  "pencil-sketch": "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop",
  "digital-art": "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop",
  "oil-painting": "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop",
  minimalist: "https://images.unsplash.com/photo-1605106702734-205df224ecce?q=80&w=1000&auto=format&fit=crop",
  geometric: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
  anime: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
}

// Modo de respaldo si la API de OpenAI falla
let USE_FALLBACK = false

// Aumentar el tiempo de espera a 25 segundos (dejando margen para el límite de Vercel)
const TIMEOUT_DURATION = 25000

// Función para verificar si la API key de OpenAI está configurada
function isOpenAIKeyConfigured() {
  const apiKey = process.env.OPENAI_API_KEY

  // Verificar si la API key existe y tiene un formato válido (comienza con "sk-")
  const isValid = apiKey && typeof apiKey === "string" && apiKey.startsWith("sk-")

  if (!isValid) {
    console.error("API key de OpenAI no configurada correctamente:", apiKey ? "Formato incorrecto" : "No existe")
  }

  return isValid
}

// Reemplazar la función para generar un ID único para la imagen
// Eliminar esta función:
// function generateImageId() {
//   return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
// }

export async function POST(request: Request) {
  try {
    console.log("Recibiendo solicitud para generar ilustración")

    // Verificar si la API key está configurada correctamente
    const isApiKeyValid = isOpenAIKeyConfigured()
    console.log("¿API key de OpenAI válida?", isApiKeyValid)

    if (!isApiKeyValid) {
      console.log("Usando modo de respaldo debido a API key inválida")
      USE_FALLBACK = true
    }

    const { prompt, style, creativity, isPremium, tripName, destinationNames } = await request.json()

    console.log("Datos recibidos:", { style, creativity, isPremium })
    console.log("Modo de respaldo activo:", USE_FALLBACK)

    if (!prompt) {
      return NextResponse.json({ error: "Se requiere un prompt" }, { status: 400 })
    }

    // Verificación estricta de estado premium
    if (!isPremium) {
      return NextResponse.json(
        {
          error: "Esta característica requiere una suscripción premium",
          premiumRequired: true,
        },
        { status: 403 },
      )
    }

    // Usar el modo de respaldo inmediatamente si:
    // 1. No hay API key válida
    // 2. El modo de respaldo está activado por errores previos
    // 3. Estamos en un entorno de desarrollo (opcional, para pruebas rápidas)
    const useImmediateFallback = !isApiKeyValid || USE_FALLBACK

    if (useImmediateFallback) {
      console.log("Usando modo de respaldo inmediato con imágenes de ejemplo")

      // Devolver una imagen de ejemplo basada en el estilo
      const imageUrl =
        SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] ||
        "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop"

      return NextResponse.json({
        imageUrl,
        note: "Usando imagen de ejemplo (modo de respaldo)",
        debug: {
          reason: !isApiKeyValid
            ? "API key inválida"
            : USE_FALLBACK
              ? "Modo de respaldo activado por errores previos"
              : "Entorno de desarrollo",
        },
      })
    }

    // Añadir instrucciones específicas según el estilo seleccionado (versión simplificada)
    let styleSpecificPrompt = ""
    switch (style) {
      case "watercolor":
        styleSpecificPrompt = "Estilo de acuarela con colores suaves."
        break
      case "vintage-postcard":
        styleSpecificPrompt = "Diseño de postal vintage años 60."
        break
      case "pencil-sketch":
        styleSpecificPrompt = "Dibujo a lápiz, estilo boceto."
        break
      case "digital-art":
        styleSpecificPrompt = "Arte digital moderno y vibrante."
        break
      case "oil-painting":
        styleSpecificPrompt = "Estilo pintura al óleo."
        break
      case "minimalist":
        styleSpecificPrompt = "Diseño minimalista, líneas simples."
        break
      case "geometric":
        styleSpecificPrompt = "Formas geométricas abstractas."
        break
      case "anime":
        styleSpecificPrompt = "Estilo anime colorido."
        break
      default:
        styleSpecificPrompt = "Estilo de emblema tradicional."
    }

    const baseStylePrompt =
      `Travel souvenir stamp: ${tripName}. Style: ${styleSpecificPrompt}. Show key landmarks from: ${destinationNames}.`.trim()

    // Combinar el prompt del usuario con nuestros prompts de estilo (versión más corta)
    const enhancedPrompt = `${baseStylePrompt} Make it look like an authentic travel sticker or badge.`

    console.log("Configurando solicitud a OpenAI")
    console.log("API Key (primeros 5 caracteres):", process.env.OPENAI_API_KEY?.substring(0, 5) + "...")

    try {
      // Crear un controlador de tiempo de espera
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("TIMEOUT"))
        }, TIMEOUT_DURATION)
      })

      const apiKey = process.env.OPENAI_API_KEY
      const requestBody = {
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }

      // Ejecutar la solicitud a OpenAI con un límite de tiempo
      const openaiPromise = fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      // Usar Promise.race para implementar el timeout
      const openaiResponse = await Promise.race([openaiPromise, timeoutPromise]).catch((error) => {
        if (error.message === "TIMEOUT") {
          console.log("La solicitud excedió el tiempo límite, usando respaldo")
          // Usar imagen de respaldo
          const fallbackImageUrl = SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] || SAMPLE_IMAGES.watercolor
          return new Response(
            JSON.stringify({
              imageUrl: fallbackImageUrl,
              note: "Usando imagen de ejemplo debido a tiempo de espera excedido",
              error: "La solicitud excedió el tiempo límite",
            }),
          )
        }
        throw error
      })

      console.log("Respuesta de OpenAI recibida. Status:", openaiResponse.status)

      // Capturar el texto completo de la respuesta
      const responseText = await openaiResponse.text()
      console.log("Texto de respuesta recibido, longitud:", responseText.length)

      // Intentar parsear como JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Datos parseados correctamente")
      } catch (parseError) {
        console.error("Error al parsear JSON:", parseError)
        throw new Error(`La respuesta no es un JSON válido: ${responseText.substring(0, 200)}`)
      }

      if (!openaiResponse.ok) {
        console.error("Error en respuesta de OpenAI:", data)
        throw new Error(`Error de OpenAI (${openaiResponse.status}): ${JSON.stringify(data)}`)
      }

      const originalImageUrl = data.data?.[0]?.url

      if (!originalImageUrl) {
        console.error("No se encontró URL de imagen en la respuesta:", JSON.stringify(data))
        throw new Error("No se pudo generar la imagen: URL no encontrada en respuesta")
      }

      console.log("URL original de imagen generada:", originalImageUrl.substring(0, 100) + "...")

      // Subir la imagen a Cloudinary
      let cloudinaryUrl
      try {
        // Crear un ID único para la imagen en Cloudinary basado en el viaje
        const safeTrip = tripName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
        const uniqueId = `${safeTrip}_${Date.now()}`

        // Subir la imagen a Cloudinary
        cloudinaryUrl = await uploadImageFromUrl(originalImageUrl, "travel-stamps", uniqueId)
        console.log("Imagen subida a Cloudinary:", cloudinaryUrl)
      } catch (cloudinaryError) {
        console.error("Error al subir imagen a Cloudinary:", cloudinaryError)
        // Si falla la subida a Cloudinary, devolver la URL original como respaldo
        return NextResponse.json({
          imageUrl: originalImageUrl,
          originalImageUrl,
          error: "Error al subir a Cloudinary, usando URL original",
          debug: {
            errorType: cloudinaryError instanceof Error ? cloudinaryError.name : "Unknown",
            message: cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError),
          },
        })
      }

      // Devolver la URL de Cloudinary
      return NextResponse.json({
        imageUrl: cloudinaryUrl,
        originalImageUrl,
      })
    } catch (error: any) {
      console.error("Error en la llamada a OpenAI:", error)

      // Si hay un error con la API de OpenAI, usar el modo de respaldo
      console.log("Usando modo de respaldo por error en OpenAI")
      USE_FALLBACK = true

      // Devolver una imagen de ejemplo basada en el estilo
      const fallbackImageUrl =
        SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] ||
        "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop"

      // Intentar subir la imagen de respaldo a Cloudinary
      try {
        const safeTrip = tripName ? tripName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() : "fallback"
        const uniqueId = `${safeTrip}_fallback_${Date.now()}`
        const cloudinaryFallbackUrl = await uploadImageFromUrl(fallbackImageUrl, "travel-stamps-fallback", uniqueId)

        return NextResponse.json({
          imageUrl: cloudinaryFallbackUrl,
          note: "Usando imagen de ejemplo debido a un error con OpenAI",
          error: error instanceof Error ? error.message : String(error),
        })
      } catch (cloudinaryError) {
        console.error("Error al subir imagen de respaldo a Cloudinary:", cloudinaryError)

        // Si falla la subida a Cloudinary, devolver la URL de respaldo directa
        return NextResponse.json({
          imageUrl: fallbackImageUrl,
          note: "Usando imagen de ejemplo debido a un error con OpenAI",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  } catch (error: any) {
    console.error("Error general en la generación de ilustración:", error)

    // Activar el modo de respaldo para futuras solicitudes
    USE_FALLBACK = true

    // Determinar si es un error de tiempo de espera
    const isTimeoutError =
      error.message?.includes("timeout") ||
      error.message?.includes("FUNCTION_INVOCATION_TIMEOUT") ||
      error.message?.includes("exceeded")

    // Si es un error de tiempo de espera, usar el respaldo inmediatamente
    if (isTimeoutError) {
      console.log("Error de tiempo de espera detectado, usando respaldo")

      // Determinar el estilo desde el error o usar un valor predeterminado
      let style = "watercolor"
      try {
        // Intentar extraer el estilo de la solicitud original
        const requestBody = await request.clone().json()
        style = requestBody.style || "watercolor"
      } catch (e) {
        console.error("No se pudo extraer el estilo de la solicitud:", e)
      }

      const fallbackImageUrl =
        SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] ||
        "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop"

      return NextResponse.json({
        imageUrl: fallbackImageUrl,
        note: "Usando imagen de ejemplo debido a un tiempo de espera",
        error: "La solicitud a OpenAI ha excedido el tiempo de espera",
        debug: {
          errorType: "TimeoutError",
          originalError: error.message,
        },
      })
    }

    // Para otros errores, devolver un mensaje de error normal
    return NextResponse.json(
      {
        error: "Error al generar la ilustración",
        details: error.message || String(error),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        debug: {
          errorType: error.name,
          message: error.message,
        },
      },
      { status: 500 },
    )
  }
}
























