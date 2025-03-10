import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const { imageUrl, title } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Se requiere una URL de imagen" }, { status: 400 })
    }

    // Subir imagen a Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "travel-stamps",
      public_id: `stamp-${Date.now()}`,
      tags: ["travel-stamp", title || "untitled"],
      transformation: [{ quality: "auto:best" }, { fetch_format: "auto" }],
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error("Error al subir a Cloudinary:", error)
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 })
  }
}

