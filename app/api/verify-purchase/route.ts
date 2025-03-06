import { NextResponse } from "next/server"

// Asegúrate de tener estas variables en tu archivo .env.local
const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 })
    }

    if (!LEMONSQUEEZY_API_KEY) {
      console.error("LEMONSQUEEZY_API_KEY is not defined")
      return NextResponse.json(
        {
          success: false,
          message: "API key not configured",
        },
        { status: 500 },
      )
    }

    console.log(`Verifying order: ${orderId}`)

    // Verificar la compra con la API de LemonSqueezy
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error(`LemonSqueezy API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`Error response: ${errorText}`)

      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify purchase",
          error: `${response.status} ${response.statusText}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("LemonSqueezy response:", JSON.stringify(data, null, 2))

    // Verificar que la orden pertenece a tu tienda y está pagada
    const order = data.data
    if (
      !order ||
      (LEMONSQUEEZY_STORE_ID && order.attributes.store_id.toString() !== LEMONSQUEEZY_STORE_ID) ||
      order.attributes.status !== "paid"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or unpaid order",
          details: {
            storeMatch: !LEMONSQUEEZY_STORE_ID || order.attributes.store_id.toString() === LEMONSQUEEZY_STORE_ID,
            status: order.attributes.status,
          },
        },
        { status: 403 },
      )
    }

    // Si todo está bien, devolver éxito
    return NextResponse.json({
      success: true,
      expiryDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 días desde ahora
      orderId: order.id,
    })
  } catch (error) {
    console.error("Error verifying purchase:", error)
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
  // This example assumes the token is a simple string representation of a timestamp.
  try {
    const timestamp = Number.parseInt(token, 10)
    return timestamp > Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days
  } catch (error) {
    return false
  }
}





