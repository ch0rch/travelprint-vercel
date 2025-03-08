export const runtime = "nodejs"
export const dynamic = "force-dynamic" // No cachear esta ruta

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Obtener el ID de la imagen de los parámetros de ruta
    const { id } = params

    // Obtener la URL original de la imagen de los parámetros de consulta
    const { searchParams } = new URL(request.url)
    const originalUrl = searchParams.get("url")

    if (!originalUrl) {
      return new Response("URL de imagen no proporcionada", { status: 400 })
    }

    console.log(`Sirviendo imagen ${id} desde ${originalUrl.substring(0, 50)}...`)

    // Descargar la imagen desde la URL original
    const imageResponse = await fetch(originalUrl, {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
      cache: "no-store",
    })

    if (!imageResponse.ok) {
      console.error(`Error al obtener la imagen: ${imageResponse.status} ${imageResponse.statusText}`)
      return new Response(`Error al obtener la imagen: ${imageResponse.status}`, { status: 502 })
    }

    // Obtener el tipo de contenido y los bytes de la imagen
    const contentType = imageResponse.headers.get("content-type") || "image/png"
    const imageBuffer = await imageResponse.arrayBuffer()

    // Crear una respuesta con los headers correctos
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cachear por 1 año
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error al servir la imagen:", error)
    return new Response(`Error al servir la imagen: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}

