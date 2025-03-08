import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Obtener la URL de la imagen de los parámetros de consulta
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "URL de imagen no proporcionada" }, { status: 400 })
    }

    console.log("Proxy de imagen solicitado para:", imageUrl.substring(0, 100) + "...")

    // Descargar la imagen desde la URL proporcionada
    const imageResponse = await fetch(imageUrl, {
      headers: {
        // Algunos headers que pueden ayudar con CORS y caché
        Accept: "image/*",
        "Cache-Control": "no-cache",
      },
    })

    if (!imageResponse.ok) {
      console.error("Error al obtener la imagen:", imageResponse.status, imageResponse.statusText)
      return NextResponse.json(
        {
          error: "No se pudo obtener la imagen",
          status: imageResponse.status,
          statusText: imageResponse.statusText,
        },
        { status: 502 },
      )
    }

    // Obtener el tipo de contenido y los bytes de la imagen
    const contentType = imageResponse.headers.get("content-type") || "image/png"
    const imageBuffer = await imageResponse.arrayBuffer()

    // Devolver la imagen con el tipo de contenido correcto
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cachear por 24 horas
      },
    })
  } catch (error) {
    console.error("Error en proxy de imagen:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la imagen",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

