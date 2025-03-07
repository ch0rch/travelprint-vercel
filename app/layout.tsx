import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Recuerdo Viajero",
  description: "Crea estampitas personalizadas de tus aventuras en ruta",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <script
          defer
          data-website-id="67ca4c1b21c9bfa8fbfdad36"
          data-domain="travelprint.me"
          src="https://datafa.st/js/script.js"
        />
      </head>
      <body className={inter.className}>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}


