import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "gloved.dev",
  description: "Made by Kaden Hood. A personal website for my projects and interests. Built using React and hosted with Vercel.",
  icons: [{ rel: "icon", url: "https://avatars.githubusercontent.com/u/96776176?v=4" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
