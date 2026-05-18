import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Project Catalog",
  description: "Company project portfolio powered by Notion",
  openGraph: {
    title: "Project Catalog",
    description: "Company project portfolio powered by Notion",
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
      <body className="min-h-full font-[var(--font-sans)]">
        {children}
      </body>
    </html>
  )
}
