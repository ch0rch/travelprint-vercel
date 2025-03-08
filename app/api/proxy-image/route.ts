export const runtime = "nodejs"
export const dynamic = "force-dynamic" // No cachear esta ruta

// Función para verificar si una URL es válida
function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    // Obtener la URL de la imagen de los parámetros de consulta
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      console.error("URL de imagen no proporcionada")
      return new Response(JSON.stringify({ error: "URL de imagen no proporcionada" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      })
    }

    if (!isValidUrl(imageUrl)) {
      console.error("URL de imagen inválida:", imageUrl)
      return new Response(JSON.stringify({ error: "URL de imagen inválida" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      })
    }

    console.log("Proxy de imagen solicitado para:", imageUrl.substring(0, 100) + "...")

    // Configurar opciones de fetch para evitar problemas de CORS y cookies
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        Accept: "image/*",
        "User-Agent": "Mozilla/5.0 (compatible; ProxyService/1.0)",
      },
      redirect: "follow",
      credentials: "omit", // No enviar cookies
      cache: "no-store", // No usar caché
    }

    // Descargar la imagen desde la URL proporcionada
    const imageResponse = await fetch(imageUrl, fetchOptions)

    if (!imageResponse.ok) {
      console.error("Error al obtener la imagen:", {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
      })

      return new Response(
        JSON.stringify({
          error: "No se pudo obtener la imagen",
          status: imageResponse.status,
          statusText: imageResponse.statusText,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        },
      )
    }

    // Obtener el tipo de contenido y los bytes de la imagen
    const contentType = imageResponse.headers.get("content-type") || "image/png"
    const imageBuffer = await imageResponse.arrayBuffer()

    // Crear una respuesta con los headers correctos
    const responseHeaders = {
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    }

    // Crear la respuesta directamente con Response en lugar de NextResponse
    return new Response(imageBuffer, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("Error en proxy de imagen:", error)

    // Asegurarnos de que los headers CORS estén presentes incluso en caso de error
    return new Response(
      JSON.stringify({
        error: "Error al procesar la imagen",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      },
    )
  }
}

// Manejador OPTIONS para CORS preflight
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  })
}







