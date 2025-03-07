import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, style, creativity, isPremium } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Se requiere un prompt" }, { status: 400 })
    }

    // Verificación estricta de estado premium
    if (!isPremium) {
      return NextResponse.json(
        {
          error: "Esta característica requiere una suscripción premium",
          premiumRequired: true,
        },
        { status: 403 },
      )
    }

    // Verificar que tenemos la API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("API key de OpenAI no configurada")
    }

    // Configurar modelo y calidad según nivel premium
    const model = "dall-e-3"
    const quality = "hd"
    const size = "1024x1024"

    // Base prompt para el estilo de souvenir de viaje
    const baseStylePrompt = `
      Diseña una estampita de viaje estilo souvenir con estas características:
      - Aspecto de pegatina/sticker para maleta de viajero
      - Estilo gráfico de emblema de parque nacional o señalización turística
      - Colores vibrantes y contornos definidos
      - Incluye elementos icónicos de los destinos mencionados
      - Formato circular u ovalado con borde definido
      - Tipografía vintage o retro apropiada para souvenires de viaje
      - Aspecto ligeramente desgastado o con textura para dar sensación de autenticidad
    `

    // Añadir instrucciones específicas según el estilo seleccionado
    let styleSpecificPrompt = ""
    switch (style) {
      case "watercolor":
        styleSpecificPrompt =
          "Utiliza un estilo de acuarela con colores suaves y bordes difuminados, manteniendo la esencia de una estampita de viaje."
        break
      case "vintage-postcard":
        styleSpecificPrompt =
          "Diseño de postal vintage con tipografías antiguas, colores envejecidos y elementos decorativos de los años 50-60."
        break
      case "pencil-sketch":
        styleSpecificPrompt =
          "Estilo de dibujo a lápiz con trazos definidos y sombreado suave, como un boceto de cuaderno de viaje."
        break
      case "digital-art":
        styleSpecificPrompt =
          "Arte digital moderno con colores vibrantes y efectos visuales contemporáneos, manteniendo la forma de emblema o insignia."
        break
      case "oil-painting":
        styleSpecificPrompt =
          "Apariencia de pintura al óleo con textura y pinceladas visibles, como un souvenir artístico premium."
        break
      case "minimalist":
        styleSpecificPrompt =
          "Diseño minimalista con líneas simples, pocos colores y espacios negativos, estilo emblema moderno."
        break
      case "geometric":
        styleSpecificPrompt =
          "Composición con formas geométricas abstractas y patrones, manteniendo los elementos esenciales de los destinos."
        break
      case "anime":
        styleSpecificPrompt =
          "Estilo anime estilizado con colores brillantes y contornos definidos, como un sticker kawaii de viaje."
        break
      default:
        styleSpecificPrompt = "Estilo de emblema tradicional de viaje con elementos gráficos clásicos."
    }

    // Combinar el prompt del usuario con nuestros prompts de estilo
    const enhancedPrompt = `
      ${baseStylePrompt}
      ${styleSpecificPrompt}
      
      Contenido específico:
      ${prompt}
      
      Nivel de creatividad: ${Math.round(creativity * 100)}%
      
      IMPORTANTE: La imagen debe parecer un auténtico souvenir de viaje que alguien compraría como recuerdo. 
      NO incluyas texto que diga "souvenir" o "estampita". El texto debe ser únicamente el nombre del viaje y los destinos.
    `

    console.log("Generando imagen con prompt:", enhancedPrompt)

    // Generar imagen con DALL-E usando fetch
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: enhancedPrompt,
        n: 1,
        size,
        quality,
        style: "vivid", // Usar "vivid" para colores más intensos en souvenires
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      throw new Error(`Error de OpenAI: ${JSON.stringify(errorData)}`)
    }

    const data = await openaiResponse.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      throw new Error("No se pudo generar la imagen")
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error("Error generando la ilustración:", error)
    return NextResponse.json(
      {
        error: "Error al generar la ilustración",
        details: error.message,
      },
      { status: 500 },
    )
  }
}





