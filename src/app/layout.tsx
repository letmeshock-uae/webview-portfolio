import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Project Catalog — Datum",
  description: "Company demo portfolio",
  openGraph: {
    title: "Project Catalog — Datum",
    description: "Company demo portfolio",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
