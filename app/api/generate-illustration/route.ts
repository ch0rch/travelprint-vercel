import { NextResponse } from "next/server"
import OpenAI from "openai"

// Inicializar OpenAI con la clave de API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, style, creativity, isPremium } = await request.json()

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

    // Configurar modelo y calidad según nivel premium
    const model = isPremium ? "dall-e-3" : "dall-e-2"
    const quality = isPremium ? "hd" : "standard"
    const size = isPremium ? "1024x1024" : "512x512"

    // Añadir instrucciones específicas según el estilo
    let enhancedPrompt = `${prompt} Estilo: ${style}.`

    if (isPremium) {
      enhancedPrompt += " Alta calidad, detalles finos, colores vibrantes."
    }

    console.log("Generando imagen con prompt:", enhancedPrompt)

    // Generar imagen con DALL-E
    const response = await openai.images.generate({
      model,
      prompt: enhancedPrompt,
      n: 1,
      size: size as any,
      quality: quality as any,
    })

    // Obtener la URL de la imagen generada
    const imageUrl = response.data[0].url

    if (!imageUrl) {
      throw new Error("No se pudo generar la imagen")
    }

    // Opcionalmente, aquí podrías guardar la imagen en tu propio almacenamiento
    // y devolver esa URL en lugar de la URL temporal de OpenAI

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error("Error generando la ilustración:", error)
    return NextResponse.json(
      {
        error: "Error al generar la ilustración",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

