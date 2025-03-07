"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, X, MessageCircle, Twitter, Facebook, Linkedin, Send, Copy } from "lucide-react"
import { useState } from "react"

interface ShareModalProps {
  onClose: () => void
}

export default function ShareModal({ onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://travelprint.me"
  const shareText =
    "¡Descubrí TravelPrint.me! 🗺️ Una forma hermosa de convertir tus viajes en recuerdos tangibles. Creá estampitas personalizadas de tus rutas y guardá tus aventuras para siempre. ¡Probalo gratis! 🌎✨"

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366] hover:bg-[#128C7E]",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2] hover:bg-[#004182]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#0088cc] hover:bg-[#006699]",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          {/* Encabezado */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-amber-100 rounded-lg p-2 mr-3">
                <Share2 className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Compartir TravelPrint</h3>
                <p className="text-sm text-muted-foreground">Invita a otros viajeros a crear sus recuerdos</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensaje de compartir */}
          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-amber-800 text-sm">{shareText}</p>
          </div>

          {/* Botones de redes sociales */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {shareLinks.map((link) => (
              <Button
                key={link.name}
                className={`w-full text-white ${link.color}`}
                onClick={() => window.open(link.url, "_blank")}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.name}
              </Button>
            ))}
          </div>

          {/* Copiar enlace */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-gray-50 text-sm border focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Button
                variant="outline"
                className={copied ? "bg-green-50 text-green-600" : ""}
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "¡Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

