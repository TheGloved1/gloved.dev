import Link from "next/link"
import React, { Suspense } from "react"
import { ChevronLeft } from "lucide-react"

import GitUser from "@/components/git-user"
import StyledSection from "@/components/styled-section"
import FileUploader from "@/components/file-uploader"

import { WIPHeader } from "./_components/WIPHeader"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description: "The home page for my About Me based web project built with the Next.js React Web Framework.",
}

const sections = ["Welcome", "About", "Robotics", "Github", "File Uploader"]

export default function Page() {
  console.log("Rendering Home...")

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-[1000]">
        <div className="navbar bg-base-100">
          <div className="navbar-start">
            <Link href={"/"} className="text-xl btn btn-ghost"><ChevronLeft />Back</Link>
            <div className="dropdown">
              <div tabIndex={0} role="button" className="md:hidden btn btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
              </div>
              <ul tabIndex={0} className="p-2 mt-3 w-52 shadow menu menu-sm dropdown-content z-[1] bg-base-100 rounded-box">
                {sections.map((section) => (
                  <li key={section}><Link href={`#${section}`} replace>{section}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="hidden md:flex navbar-center">
            <ul className="px-1 menu menu-horizontal">
              {sections.map((section) => (
                <li key={section}><Link href={`#${section}`} replace>{section}</Link></li>
              ))}
            </ul>
          </div>
          <div className="navbar-end"></div>
        </div>
      </div>
      <main className="flex min-h-screen flex-col items-center text-white bg-gradient-to-b from-sky-950 to-[#1e210c]">
        <WIPHeader />
        <div className="flex flex-col gap-12 justify-center items-center py-16 px-4">
          <StyledSection id={sections[0]}>
            <p className="text-xl font-extrabold">{"Welcome to my website!"}</p>
            <br />
            <p>{"I'm Kaden Hood."}</p>
            <p>{"a self taught software engineer."}</p>
          </StyledSection>
          <div className="divider w-[75vw] max-w-[1000px]" />
          <StyledSection id={sections[1]}>
            <p className="font-extrabold">{"About Me"}</p>
            <br />
            <p>{"I wear gloves, and go by 'Gloves' online."}</p>
            <p>{"And if you couldn't tell already, I like to code."}</p>
            <br />
            <p>{"I started to learn programming in my 2nd year of high school."}</p>
          </StyledSection>
          <div className="divider w-[75vw] max-w-[1000px]" />
          <StyledSection id={sections[2]}>
            <p><strong><Link className="fancy-link" href="https://meporobotics.com/">{"Mediapolis Robotics Club"}</Link></strong></p>
            <p><Link className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</Link></p>
            <p>{"Since 2023 - Present"}</p>
            <br />
            <p><strong>{"Role: "}</strong>{"Programmer"}</p>
            <p><strong>{"Language: "}</strong>{"Java"}</p>
          </StyledSection>
          <div className="divider w-[75vw] max-w-[1000px]" />
          <StyledSection id={sections[3]}>
            <p className="font-extrabold">{"My Github Profile"}</p>
            <br />
            <Suspense fallback={""}>
              <GitUser name="TheGloved1" />
            </Suspense>
          </StyledSection>
          <div className="divider w-[75vw] max-w-[1000px]" />
          <StyledSection id={sections[4]}>
            <FileUploader />
          </StyledSection>
        </div>
      </main>
    </>
  )
}
