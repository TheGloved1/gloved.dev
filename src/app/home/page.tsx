import Link from "next/link"
import React from "react"
import { ChevronLeft } from "lucide-react"

import GitUser from "@/components/GitUser"
import StyledSection from "@/components/StyledSection"
import FileManager from "@/components/FileManager"
import { Button } from "@/components/ui/button"

import { WIPHeader } from "./_components/WIPHeader"


const sections = ["Welcome", "About", "Robotics", "Github", "FileManager"]

export default function Page() {
  console.log("Rendering Home...")

  return (
    <main className="flex min-h-screen snap-y snap-mandatory flex-col items-center text-white bg-gradient-to-b from-sky-950 to-[#1e210c]">
      <Button className="fixed left-2 top-2 flex flex-col p-2">
        <Link href={"/"} className="flex flex-row items-center justify-center">
          <ChevronLeft />
          {"Back"}
        </Link>
      </Button>
      <WIPHeader />
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <StyledSection id={sections[0]} className="snap-center snap-always">
          <h3 className="text-xl font-extrabold">{"Welcome to my website!"}</h3>
          <br />
          <p></p>
          <p>{"I'm Kaden Hood."}</p>
          <p>{"and I'm a software engineer."}</p>
        </StyledSection>
        <StyledSection id={sections[1]} className="snap-center snap-always">
          <h3 className="text-xl font-extrabold">{"About Me"}</h3>
          <br />
          <p></p>
          <p>{"I wear gloves, and go by 'Gloves' online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <StyledSection id={sections[2]} className="snap-center snap-always">
          <h3><strong><Link className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</Link></strong></h3>
          <p><Link className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</Link></p>
          <p>{"Since 2023 - Present"}</p>
          <br />
          <p></p>
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java and Python"}</p>
        </StyledSection>
        <StyledSection id={sections[3]} className="snap-center snap-always">
          <h3>{"My Github Profile"}</h3>
          <br />
          <p></p>
          <GitUser name="TheGloved1" />
        </StyledSection>
        <StyledSection id={sections[4]} className="snap-center snap-always">
          <FileManager />
        </StyledSection>
      </div>
    </main>
  )
}
