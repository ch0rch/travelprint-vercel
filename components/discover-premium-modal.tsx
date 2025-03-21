"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, X, Check, Sparkles, MapPin, Image, MessageSquare, Download, Zap } from "lucide-react"

interface DiscoverPremiumModalProps {
  onClose: () => void
  onPurchase: () => void
}

export default function DiscoverPremiumModal({ onClose, onPurchase }: DiscoverPremiumModalProps) {
  const benefits = [
    {
      icon: Sparkles,
      title: "Ilustraciones con IA",
      description: "Genera versiones artísticas ilustradas únicas de tus estampitas",
    },
    {
      icon: Image,
      title: "Formatos adicionales",
      description: "Vertical, horizontal y formato historia para redes sociales",
    },
    {
      icon: MapPin,
      title: "Estilos de mapa premium",
      description: "Satélite, nocturno y más estilos exclusivos",
    },
    {
      icon: MessageSquare,
      title: "Comentarios personalizados",
      description: "Añade tus historias y anécdotas a cada estampita",
    },
    {
      icon: Download,
      title: "Sin marca de agua",
      description: "Descarga tus estampitas limpias y profesionales",
    },
    {
      icon: Zap,
      title: "Alta resolución",
      description: "Calidad 4x perfecta para imprimir",
    },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card className="max-w-2xl w-full mx-4">
        <CardContent className="p-4 md:p-6">
          {/* Encabezado */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex items-start md:items-center">
              <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-lg p-2 mr-2 md:mr-3">
                <Crown className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold">Descubre TravelPrint Premium</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Desbloquea todas las características por solo $5
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>

          {/* Lista de beneficios */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-amber-50">
                <div className="mt-1">
                  <benefit.icon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-900">{benefit.title}</h4>
                  {/* Solo mostrar descripción en desktop */}
                  <p className="hidden md:block text-sm text-amber-700">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Añade esto después de la lista de beneficios */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-amber-900 flex items-center mb-2">
              <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
              ¡NUEVO! Estampitas Ilustradas con IA
            </h4>
            <p className="text-sm text-amber-700 mb-2">
              Transforma tus rutas en hermosas ilustraciones artísticas en diferentes estilos: acuarela, vintage,
              minimalista, anime y más. Una forma única de preservar tus recuerdos de viaje.
            </p>
          </div>

          {/* Sección de precio */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-2xl md:text-3xl font-bold text-amber-900">$5</span>
              <span className="text-amber-700 ml-2">por 3 meses</span>
            </div>
            <p className="text-center text-xs md:text-sm text-amber-700 mb-4">
              Menos de $2 al mes para crear recuerdos inolvidables
            </p>
            <ul className="space-y-2 mb-4 md:mb-6 text-sm">
              {[
                "Acceso inmediato a todas las características premium",
                "Sin límites en la cantidad de estampitas",
                "Actualizaciones gratuitas durante tu suscripción",
                "Soporte prioritario por email",
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-amber-800">
                  <Check className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={onPurchase}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
            >
              <Crown className="h-4 w-4 mr-2" />
              Obtener Premium Ahora
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm text-amber-900 flex items-center justify-center">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-amber-500 mr-1" />
              ¡Mejora tu experiencia hoy mismo!
            </p>
            <p className="text-xs text-muted-foreground">
              Pago único. Sin renovación automática. Satisfacción garantizada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





