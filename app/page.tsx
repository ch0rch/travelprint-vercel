import TravelStampGenerator from "@/components/travel-stamp-generator"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <HeroSection />

      <div className="container mx-auto px-4 py-12" id="generator">
        <TravelStampGenerator />
      </div>
    </main>
  )
}



