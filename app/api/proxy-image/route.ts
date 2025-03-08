import { NextResponse } from "next/server"

export const runtime = "nodejs" // Force Node.js runtime

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

    // Crear una respuesta con los headers correctos para CORS y cookies
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        // Prevenir que se envíen cookies
        "Set-Cookie": "",
      },
    })

    // Eliminar cualquier cookie que pudiera estar presente
    response.headers.delete("Set-Cookie")

    return response
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

// Añadir manejador OPTIONS para CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}



