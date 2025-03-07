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
    console.log("Prompt:", prompt)

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

    // Si estamos en modo de respaldo o no hay API key, usar imágenes de ejemplo
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || USE_FALLBACK) {
      console.log("Usando modo de respaldo con imágenes de ejemplo")

      // Simular un tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Devolver una imagen de ejemplo basada en el estilo
      const imageUrl =
        SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] ||
        "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop"

      return NextResponse.json({
        imageUrl,
        note: "Usando imagen de ejemplo (modo de respaldo)",
      })
    }

    // Base prompt para el estilo de souvenir de viaje
    const baseStylePrompt = `
      Diseña una estampita de viaje estilo souvenir con estas características:
      - Aspecto de pegatina/sticker para maleta de viajero
      - Estilo gráfico de emblema de parque nacional o señalización turística
      - Colores vibrantes y contornos definidos
      - Incluye elementos icónicos de los destinos mencionados
      - Formato circular u ovalado con borde definido
      - Tipografía vintage o retro apropiada para souvenires de viaje
      - Aspecto ligeramente desgastado o con textura para dar sensación de autenticidad
    `

    // Añadir instrucciones específicas según el estilo seleccionado
    let styleSpecificPrompt = ""
    switch (style) {
      case "watercolor":
        styleSpecificPrompt =
          "Utiliza un estilo de acuarela con colores suaves y bordes difuminados, manteniendo la esencia de una estampita de viaje."
        break
      case "vintage-postcard":
        styleSpecificPrompt =
          "Diseño de postal vintage con tipografías antiguas, colores envejecidos y elementos decorativos de los años 50-60."
        break
      case "pencil-sketch":
        styleSpecificPrompt =
          "Estilo de dibujo a lápiz con trazos definidos y sombreado suave, como un boceto de cuaderno de viaje."
        break
      case "digital-art":
        styleSpecificPrompt =
          "Arte digital moderno con colores vibrantes y efectos visuales contemporáneos, manteniendo la forma de emblema o insignia."
        break
      case "oil-painting":
        styleSpecificPrompt =
          "Apariencia de pintura al óleo con textura y pinceladas visibles, como un souvenir artístico premium."
        break
      case "minimalist":
        styleSpecificPrompt =
          "Diseño minimalista con líneas simples, pocos colores y espacios negativos, estilo emblema moderno."
        break
      case "geometric":
        styleSpecificPrompt =
          "Composición con formas geométricas abstractas y patrones, manteniendo los elementos esenciales de los destinos."
        break
      case "anime":
        styleSpecificPrompt =
          "Estilo anime estilizado con colores brillantes y contornos definidos, como un sticker kawaii de viaje."
        break
      default:
        styleSpecificPrompt = "Estilo de emblema tradicional de viaje con elementos gráficos clásicos."
    }

    // Combinar el prompt del usuario con nuestros prompts de estilo
    const enhancedPrompt = `
      ${baseStylePrompt}
      ${styleSpecificPrompt}
      
      Contenido específico:
      ${prompt}
      
      Nivel de creatividad: ${Math.round(creativity * 100)}%
      
      IMPORTANTE: La imagen debe parecer un auténtico souvenir de viaje que alguien compraría como recuerdo. 
      NO incluyas texto que diga "souvenir" o "estampita". El texto debe ser únicamente el nombre del viaje y los destinos.
    `

    console.log("Configurando solicitud a OpenAI")

    try {
      // Generar imagen con DALL-E usando fetch
      console.log("Enviando solicitud a la API de OpenAI")

      const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
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
          quality: "hd",
          style: "vivid", // Usar "vivid" para colores más intensos en souvenires
        }),
      })

      console.log("Respuesta de OpenAI recibida. Status:", openaiResponse.status)

      // Verificar el tipo de contenido de la respuesta
      const contentType = openaiResponse.headers.get("content-type") || ""
      console.log("Tipo de contenido de la respuesta:", contentType)

      if (!openaiResponse.ok) {
        // Intentar obtener el texto de error primero
        const errorText = await openaiResponse.text()
        console.error("Texto de error de OpenAI:", errorText)

        // Intentar parsear como JSON si parece ser JSON
        let errorData
        if (errorText.trim().startsWith("{")) {
          try {
            errorData = JSON.parse(errorText)
          } catch (e) {
            errorData = { error: "Error al parsear respuesta", text: errorText }
          }
        } else {
          errorData = { error: "Respuesta no JSON", text: errorText }
        }

        console.error("Error de OpenAI:", JSON.stringify(errorData))

        // Activar modo de respaldo para futuras solicitudes si hay un error persistente
        USE_FALLBACK = true

        throw new Error(`Error de OpenAI (${openaiResponse.status}): ${errorText.substring(0, 200)}`)
      }

      // Verificar si la respuesta es JSON
      if (!contentType.includes("application/json")) {
        console.error("La respuesta no es JSON:", contentType)
        const textResponse = await openaiResponse.text()
        console.error("Contenido de respuesta no-JSON:", textResponse.substring(0, 200))
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









