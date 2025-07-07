import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "nextweardz",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="https://res.cloudinary.com/deh3ejeph/image/upload/v1751478390/Screenshot_2025-07-02_at_18.44.53_dukow7.png" />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton expand={false} visibleToasts={5} />
      </body>
    </html>
  )
}
