import { NextResponse } from "next/server"

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

export async function POST(request: Request) {
  try {
    console.log("Recibiendo solicitud para generar ilustración")

    const { prompt, style, creativity, isPremium } = await request.json()

    console.log("Datos recibidos:", { style, creativity, isPremium })

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
    // 1. No hay API key
    // 2. El modo de respaldo está activado por errores previos
    // 3. Estamos en un entorno de desarrollo (opcional, para pruebas rápidas)
    const apiKey = process.env.OPENAI_API_KEY
    const useImmediateFallback = !apiKey || USE_FALLBACK || process.env.NODE_ENV === "development"

    if (useImmediateFallback) {
      console.log("Usando modo de respaldo inmediato con imágenes de ejemplo")

      // Devolver una imagen de ejemplo basada en el estilo
      const imageUrl =
        SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] ||
        "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop"

      return NextResponse.json({
        imageUrl,
        note: "Usando imagen de ejemplo (modo de respaldo)",
      })
    }

    // Crear un controlador de tiempo de espera para evitar que la función serverless agote su tiempo
    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("La solicitud a OpenAI ha excedido el tiempo de espera"))
      }, 8000) // 8 segundos de tiempo de espera, ajustar según sea necesario

      // Limpiar el timeout si la promesa se resuelve antes
      return () => clearTimeout(timeoutId)
    })

    // Base prompt para el estilo de souvenir de viaje (reducido para procesar más rápido)
    const baseStylePrompt = `
      Diseña una estampita de viaje estilo souvenir con:
      - Aspecto de pegatina/sticker para maleta
      - Estilo de emblema de parque nacional
      - Colores vibrantes y contornos definidos
      - Elementos icónicos de los destinos
      - Formato circular u ovalado
    `

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

    // Combinar el prompt del usuario con nuestros prompts de estilo (versión más corta)
    const enhancedPrompt = `
      ${baseStylePrompt}
      ${styleSpecificPrompt}
      
      Contenido: ${prompt}
      
      Creatividad: ${Math.round(creativity * 100)}%
      
      IMPORTANTE: Debe parecer un auténtico souvenir de viaje. El texto debe ser únicamente el nombre del viaje y los destinos.
    `.trim()

    console.log("Configurando solicitud a OpenAI con timeout")

    try {
      // Ejecutar la solicitud a OpenAI con un límite de tiempo
      const openaiPromise = fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard", // Cambiar a "standard" en lugar de "hd" para respuestas más rápidas
          style: "vivid",
        }),
      })

      // Usar Promise.race para implementar el timeout
      const openaiResponse = await Promise.race([openaiPromise, timeoutPromise])

      console.log("Respuesta de OpenAI recibida. Status:", openaiResponse.status)

      if (!openaiResponse.ok) {
        // Intentar obtener el texto de error
        const errorText = await openaiResponse.text()
        console.error("Texto de error de OpenAI:", errorText)

        // Activar modo de respaldo para futuras solicitudes
        USE_FALLBACK = true

        throw new Error(`Error de OpenAI (${openaiResponse.status}): ${errorText.substring(0, 200)}`)
      }

      // Verificar si la respuesta es JSON
      const contentType = openaiResponse.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        console.error("La respuesta no es JSON:", contentType)
        USE_FALLBACK = true
        throw new Error("La API de OpenAI devolvió un formato inesperado")
      }

      // Ahora podemos estar más seguros de que es JSON
      const data = await openaiResponse.json()
      console.log("Datos de OpenAI procesados correctamente")

      const imageUrl = data.data?.[0]?.url

      if (!imageUrl) {
        console.error("No se encontró URL de imagen en la respuesta:", JSON.stringify(data))
        throw new Error("No se pudo generar la imagen: URL no encontrada en respuesta")
      }

      return NextResponse.json({ imageUrl })
    } catch (openaiError) {
      console.error("Error en la llamada a OpenAI:", openaiError)

      // Si hay un error con la API de OpenAI, usar el modo de respaldo
      console.log("Usando modo de respaldo por error en OpenAI")
      USE_FALLBACK = true

      // Devolver una imagen de ejemplo basada en el estilo
      const fallbackImageUrl =
        SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] ||
        "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop"

      return NextResponse.json({
        imageUrl: fallbackImageUrl,
        note: "Usando imagen de ejemplo debido a un error con OpenAI",
        error: openaiError instanceof Error ? openaiError.message : String(openaiError),
      })
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
      })
    }

    // Para otros errores, devolver un mensaje de error normal
    return NextResponse.json(
      {
        error: "Error al generar la ilustración",
        details: error.message || String(error),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}











