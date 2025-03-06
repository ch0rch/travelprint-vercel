import { NextResponse } from "next/server"

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY

export async function POST(request: Request) {
  try {
    const { licenseKey } = await request.json()

    if (!licenseKey) {
      return NextResponse.json({ success: false, message: "License key is required" }, { status: 400 })
    }

    // Para pruebas
    if (licenseKey === "test123") {
      return NextResponse.json({
        success: true,
        expiryDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 días desde ahora
        licenseKey: "test123",
      })
    }

    if (!LEMONSQUEEZY_API_KEY) {
      console.error("LEMONSQUEEZY_API_KEY is not defined")
      return NextResponse.json({ success: false, message: "API key not configured" }, { status: 500 })
    }

    console.log(`Verifying license: ${licenseKey}`)

    // Verificar la licencia con la API de LemonSqueezy
    const response = await fetch(`https://api.lemonsqueezy.com/v1/licenses/validate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        license_key: licenseKey,
      }),
    })

    if (!response.ok) {
      console.error(`LemonSqueezy API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`Error response: ${errorText}`)

      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify license",
          error: `${response.status} ${response.statusText}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("LemonSqueezy license validation response:", JSON.stringify(data, null, 2))

    // Verificar que la licencia sea válida
    if (!data.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid license key",
        },
        { status: 403 },
      )
    }

    // Calcular la fecha de expiración (3 meses desde la activación o usar la fecha proporcionada por LemonSqueezy)
    // Si LemonSqueezy proporciona una fecha de expiración, usarla
    let expiryDate = Date.now() + 90 * 24 * 60 * 60 * 1000
    if (data.expires_at) {
      expiryDate = new Date(data.expires_at).getTime()
    }

    // Si todo está bien, devolver éxito
    return NextResponse.json({
      success: true,
      expiryDate: expiryDate,
      licenseKey: licenseKey,
    })
  } catch (error) {
    console.error("Error verifying license:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export function verifyToken(token: string): boolean {
  // This is a placeholder. Actual token verification logic would go here.
  try {
    const timestamp = Number.parseInt(token, 10)
    return timestamp > Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days
  } catch (error) {
    return false
  }
}







