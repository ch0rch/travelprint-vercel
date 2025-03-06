import TravelStampGenerator from "@/components/travel-stamp-generator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2">Recuerdo Viajero</h1>
          <p className="text-lg text-amber-700">Crea estampitas personalizadas de tus aventuras en ruta</p>
        </header>

        <TravelStampGenerator />
      </div>
    </main>
  )
}

