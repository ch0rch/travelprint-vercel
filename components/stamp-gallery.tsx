"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Stamp, Globe, Clock, Sparkles } from "lucide-react"

// Categorías de diseño con descripciones mejoradas
const designCategories = [
  {
    id: "vintage-emblem",
    name: "Emblema Vintage",
    description: "Estilo retro con bordes ornamentados y colores tierra",
    examples: [
      {
        title: "Ruta del Vino",
        locations: "Mendoza, Argentina",
        imageUrl: "https://example.com/vintage1.jpg",
        style: "watercolor",
      },
      // Más ejemplos...
    ],
  },
  {
    id: "official-stamp",
    name: "Sello Oficial",
    description: "Diseño inspirado en sellos de pasaporte y visas",
    examples: [
      {
        title: "Tour Europeo",
        locations: "París - Roma - Londres",
        imageUrl: "https://example.com/stamp1.jpg",
        style: "vintage-postcard",
      },
      // Más ejemplos...
    ],
  },
  {
    id: "modern-postal",
    name: "Postal Moderna",
    description: "Diseño minimalista con colores vibrantes",
    examples: [
      {
        title: "Aventura Asiática",
        locations: "Tokyo - Seoul - Bangkok",
        imageUrl: "https://example.com/postal1.jpg",
        style: "minimalist",
      },
      // Más ejemplos...
    ],
  },
  {
    id: "national-park",
    name: "Parque Nacional",
    description: "Inspirado en los emblemas de parques nacionales",
    examples: [
      {
        title: "Yellowstone",
        locations: "Wyoming, USA",
        imageUrl: "https://example.com/park1.jpg",
        style: "oil-painting",
      },
      // Más ejemplos...
    ],
  },
  {
    id: "art-deco",
    name: "Art Déco",
    description: "Elegante estilo con patrones geométricos",
    examples: [
      {
        title: "Nueva York Nocturna",
        locations: "Manhattan, USA",
        imageUrl: "https://example.com/artdeco1.jpg",
        style: "geometric",
      },
      // Más ejemplos...
    ],
  },
  {
    id: "japanese",
    name: "Estilo Japonés",
    description: "Inspirado en sellos tradicionales japoneses",
    examples: [
      {
        title: "Ruta del Monte Fuji",
        locations: "Hakone, Japón",
        imageUrl: "https://example.com/japan1.jpg",
        style: "anime",
      },
      // Más ejemplos...
    ],
  },
]

// Ejemplos recientes (simulados)
const recentExamples = [
  {
    id: 1,
    title: "Ruta de los Volcanes",
    locations: "Chile",
    style: "vintage-emblem",
    imageUrl: "https://example.com/recent1.jpg",
    createdAt: "2024-03-08T15:30:00Z",
    likes: 24,
  },
  // Más ejemplos...
]

export default function StampGallery() {
  const [selectedCategory, setSelectedCategory] = useState("recent")

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center">
            <Stamp className="h-5 w-5 mr-2 text-amber-500" />
            Galería de Inspiración
          </h3>
          <Badge variant="outline" className="bg-amber-50 text-amber-800">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>

        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="recent" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Recientes
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Globe className="h-4 w-4 mr-2" />
              Categorías
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentExamples.map((example) => (
                <div key={example.id} className="relative group overflow-hidden rounded-lg border border-amber-200">
                  {/* Placeholder para la imagen */}
                  <div className="aspect-square bg-amber-50 flex items-center justify-center">
                    <Stamp className="h-8 w-8 text-amber-300" />
                  </div>
                  {/* Overlay con información */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <h4 className="text-white font-medium text-sm">{example.title}</h4>
                    <p className="text-white/80 text-xs">{example.locations}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {designCategories.map((category) => (
                <div
                  key={category.id}
                  className="border border-amber-200 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                >
                  <h4 className="font-medium text-amber-800 mb-1">{category.name}</h4>
                  <p className="text-sm text-amber-600 mb-3">{category.description}</p>
                  {/* Grid de ejemplos miniatura */}
                  <div className="grid grid-cols-3 gap-2">
                    {category.examples.slice(0, 3).map((example, idx) => (
                      <div
                        key={idx}
                        className="aspect-square bg-white rounded border border-amber-100 flex items-center justify-center"
                      >
                        <Stamp className="h-6 w-6 text-amber-200" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Sección de estadísticas */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-amber-200 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">1,234</div>
            <div className="text-xs text-amber-700">Estampitas Creadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">6</div>
            <div className="text-xs text-amber-700">Estilos Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">89%</div>
            <div className="text-xs text-amber-700">Satisfacción</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

