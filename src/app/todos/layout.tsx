import '@/styles/globals.css'
// import { Analytics } from "@vercel/analytics/react"
// import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'Todo App',
  description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`h-dvh w-dvw bg-[#333] font-sans`}>
        {children}
        {/* <Analytics />
        <SpeedInsights /> */}
      </body>
    </html>
  )
}
