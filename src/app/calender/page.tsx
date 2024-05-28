import { CustomCalendar } from "@/components/CustomCalender"

export default function Page() {

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <CustomCalendar />
      </div>
    </main>
  )
}
