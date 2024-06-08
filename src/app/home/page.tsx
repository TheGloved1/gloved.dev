import Link from "next/link"
import React, { Suspense } from "react"
import { ChevronLeft } from "lucide-react"

import GitUser from "@/components/git-user"
import StyledSection from "@/components/styled-section"
import FileManager from "@/components/file-manager"

import { WIPHeader } from "./_components/WIPHeader"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description: "The home page for my About Me based web project built with the Next.js React Web Framework.",
}

const sections = ["Welcome", "About", "Robotics", "Github", "FileManager"]

export default function Page() {
  console.log("Rendering Home...")

  return (
    <main className="flex min-h-screen snap-y snap-mandatory flex-col items-center text-white bg-gradient-to-b from-sky-950 to-[#1e210c]">
      <Link href={"/"} className="fixed pl-0 left-2 top-2 flex flex-row items-center justify-center">
        <button className="btn flex flex-row items-center justify-center">
          <ChevronLeft />
          {"Back"}
        </button>
      </Link>
      <WIPHeader />
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <StyledSection id={sections[0]} className="snap-center snap-always">
          <h3 className="text-xl font-extrabold">{"Welcome to my website!"}</h3>
          <br />
          <p></p>
          <p>{"I'm Kaden Hood."}</p>
          <p>{"a self taught software engineer."}</p>
        </StyledSection>
        <div className="divider w-[75vw] max-w-[1000px]" />
        <StyledSection id={sections[1]} className="snap-center snap-always">
          <h3 className="font-extrabold">{"About Me"}</h3>
          <br />
          <p></p>
          <p>{"I wear gloves, and go by 'Gloves' online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <div className="divider w-[75vw] max-w-[1000px]" />
        <StyledSection id={sections[2]} className="snap-center snap-always">
          <h3><strong><Link className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</Link></strong></h3>
          <p><Link className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</Link></p>
          <p>{"Since 2023 - Present"}</p>
          <br />
          <p></p>
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java"}</p>
        </StyledSection>
        <div className="divider w-[75vw] max-w-[1000px]" />
        <StyledSection id={sections[3]} className="snap-center snap-always">
          <h3 className="font-extrabold">{"My Github Profile"}</h3>
          <br />
          <p></p>
          <Suspense fallback={<p>{"Loading..."}</p>}>
            <GitUser name="TheGloved1" />
          </Suspense>
        </StyledSection>
        <div className="divider w-[75vw] max-w-[1000px]" />
        <StyledSection id={sections[4]} className="snap-center snap-always">
          <FileManager />
          <p className="m-2 opacity-25">{"(NOTE: I am not responsible for any files uploaded)"}</p>
        </StyledSection>
      </div>
    </main>
  )
}
