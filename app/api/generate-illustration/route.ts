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

    console.log("Simulando generación de imagen para estilo:", style)

    // Simular un tiempo de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Devolver una imagen de ejemplo basada en el estilo
    const imageUrl =
      SAMPLE_IMAGES[style as keyof typeof SAMPLE_IMAGES] ||
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000&auto=format&fit=crop"

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



