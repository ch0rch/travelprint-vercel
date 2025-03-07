import TravelStampGenerator from "@/components/travel-stamp-generator"
import { HeroSection } from "@/components/hero-section"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <HeroSection />

      <div className="container mx-auto px-4 py-12" id="generator">
        <TravelStampGenerator />
      </div>
      <SiteFooter />
    </main>
  )
}






