import { SiteFooter } from "@/components/site-footer"
import AIStampGenerator from "@/components/ai-stamp-generator"
import CreditBalance from "@/components/credit-balance"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import Link from "next/link"

export default function AIStampPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">Estampitas Ilustradas con IA</h1>
              <p className="text-amber-700">
                Transforma tus viajes en obras de arte únicas generadas con inteligencia artificial.
              </p>
            </div>
            <div className="flex-shrink-0">
              <CreditBalance />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <AIStampGenerator />
          </div>

          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Paquete de Créditos</h2>
            <p className="text-amber-700 mb-4">
              Cada estampita generada con IA consume 1 crédito. Obtén 10 créditos por solo $10 y crea recuerdos únicos
              de tus viajes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/comprar" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800">
                  <Crown className="h-4 w-4 mr-2" />
                  Comprar 10 créditos por $10
                </Button>
              </Link>
              <Link href="/activar" className="flex-1">
                <Button variant="outline" className="w-full">
                  Activar código de licencia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}

