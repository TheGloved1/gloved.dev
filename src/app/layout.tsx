import "@/styles/globals.css"
import React from 'react'
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { type Metadata } from "next"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "gloved.dev",
  description: "Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.",
  icons: [{ rel: "icon", url: "https://avatars.githubusercontent.com/u/96776176?v=4" }],
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {props.children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
