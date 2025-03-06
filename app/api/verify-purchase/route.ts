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

    // Verificar la compra con la API de LemonSqueezy
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify purchase",
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    // Verificar que la orden pertenece a tu tienda y está pagada
    const order = data.data
    if (order.attributes.store_id.toString() !== LEMONSQUEEZY_STORE_ID || order.attributes.status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or unpaid order",
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
      },
      { status: 500 },
    )
  }
}

