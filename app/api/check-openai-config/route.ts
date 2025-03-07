import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar si la API key de OpenAI está configurada
    const apiKey = process.env.OPENAI_API_KEY
    const isKeyConfigured = apiKey && typeof apiKey === "string" && apiKey.startsWith("sk-")

    // Verificar si podemos hacer una solicitud simple a la API de OpenAI
    let apiAccessible = false
    let apiResponse = null

    if (isKeyConfigured) {
      try {
        // Intentar hacer una solicitud simple a la API de OpenAI (listar modelos)
        const response = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        apiAccessible = response.ok

        if (response.ok) {
          const data = await response.json()
          apiResponse = {
            status: response.status,
            models: data.data?.slice(0, 3).map((model: any) => model.id) || [],
          }
        } else {
          const errorText = await response.text()
          apiResponse = {
            status: response.status,
            error: errorText,
          }
        }
      } catch (error) {
        apiResponse = {
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV || "unknown",
      openai: {
        keyConfigured: isKeyConfigured,
        keyFormat: isKeyConfigured ? "valid" : apiKey ? "invalid" : "missing",
        keyPrefix: apiKey ? apiKey.substring(0, 5) + "..." : null,
        apiAccessible,
        apiResponse,
      },
      serverInfo: {
        timestamp: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error al verificar la configuración",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

