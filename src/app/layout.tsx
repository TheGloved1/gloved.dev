import "src/styles/globals.css"

import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "gloved.dev",
  description: "Made by Kaden Hood with NextJS!",
  icons: [{ rel: "icon", url: "https://avatars.githubusercontent.com/u/96776176?v=4" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
