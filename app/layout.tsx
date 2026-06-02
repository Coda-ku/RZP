import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "RZP - Sistem Manajemen Penawaran & Invoice",
  description: "Offline-first Quote & Invoice Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
