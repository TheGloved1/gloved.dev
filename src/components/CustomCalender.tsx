"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export function CustomCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-xl border bg-white/10 p-4 text-white hover:bg-white/20 hover:border-white/20"
    />
  )
}

