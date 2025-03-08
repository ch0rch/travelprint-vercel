import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary con las credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

/**
 * Sube una imagen a Cloudinary desde una URL
 * @param imageUrl URL de la imagen a subir
 * @param folder Carpeta en Cloudinary donde guardar la imagen
 * @param publicId ID público opcional para la imagen
 * @returns URL de la imagen en Cloudinary
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  folder = "travel-stamps",
  publicId?: string,
): Promise<string> {
  try {
    // Generar un ID único si no se proporciona uno
    const uniqueId = publicId || `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Subir la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      public_id: uniqueId,
      overwrite: true,
      resource_type: "image",
      // Opciones adicionales para optimización
      quality: "auto",
      fetch_format: "auto",
    })

    console.log(`Imagen subida a Cloudinary: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error)
    throw error
  }
}

/**
 * Genera una URL firmada de Cloudinary con transformaciones
 * @param publicId ID público de la imagen en Cloudinary
 * @param transformations Transformaciones a aplicar
 * @returns URL firmada de Cloudinary
 */
export function generateSignedUrl(publicId: string, transformations: Record<string, any> = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    ...transformations,
  })
}

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param cloudinaryUrl URL completa de Cloudinary
 * @returns public_id de la imagen
 */
export function extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
  try {
    // Ejemplo de URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image-id.jpg
    const urlObj = new URL(cloudinaryUrl)
    const pathParts = urlObj.pathname.split("/")

    // Encontrar la parte después de 'upload' y antes de la extensión
    const uploadIndex = pathParts.findIndex((part) => part === "upload")
    if (uploadIndex === -1) return null

    // Unir todas las partes después de 'upload', excluyendo la extensión del último elemento
    const lastPart = pathParts[pathParts.length - 1]
    pathParts[pathParts.length - 1] = lastPart.split(".")[0]

    return pathParts.slice(uploadIndex + 1).join("/")
  } catch (error) {
    console.error("Error al extraer public_id de URL de Cloudinary:", error)
    return null
  }
}

