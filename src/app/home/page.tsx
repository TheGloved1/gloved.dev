import Link from 'next/link'
import React, {
  // useEffect,
  // useState
} from 'react'
import GitUser from '@/components/GitUser'
import StyledSection from '@/components/StyledSection'
import { Button } from '@/components/ui/button'
import FileManager from '@/components/FileManager'

//  TODO: Add more information on how the website is built and things it can do using React.
//  TODO: Fix the "Home" page to be more responsive and have a better layout.

const sections = ['Welcome', 'About', 'Robotics', 'Github', 'FileManager']

export default function Page() {
  console.log('Rendering Home...')

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white snap-mandatory snap-y">
      <Button className='fixed p-2 top-2 left-2'>
        <Link href={"/"}>{"<- Back"}</Link>
      </Button>
      <div className="flex fixed lg:text-5xl font-bold justify-center items-center p-1 text-center md:text-[0.75rem] sm:text-sm animate-pulse top-[10vh]">
        <div>{"gloved"}</div>
        <div className="text-[hsl(280,100%,40%)]">{"."}</div>
        <div>{"dev"}</div>
        <div className="text-[hsl(280,100%,40%)]">{"/"}</div>
        <div className='pr-2'>{"home "}</div>
        <div className="text-slate-900 bg-gray-700 p-2 rounded-xl">{"Work in progress..."}</div>
      </div>
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <StyledSection id={sections[0]} className="snap-always snap-center">
          <h3 className="font-extrabold text-xl">{"Welcome to my website!"}</h3>
          <br />
          <p></p>
          <p>{"I'm Kaden Hood."}</p>
          <p>{"and I'm a software engineer."}</p>
        </StyledSection>
        <StyledSection id={sections[1]} className="snap-always snap-center">
          <h3>{"About Me"}</h3>
          <br />
          <p></p>
          <p>{"I wear gloves, and go by \"Gloves\" online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <StyledSection id={sections[2]} className="snap-always snap-center">
          <h3><strong><Link className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</Link></strong></h3>
          <p><Link className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</Link></p>
          <p>{"Since 2023 - Present"}</p>
          <br />
          <p></p>
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java and Python"}</p>
        </StyledSection>
        <StyledSection id={sections[3]} className="snap-always snap-center">
          <h3>{"My Github Profile"}</h3>
          <br />
          <p></p>
          <GitUser name="TheGloved1" />
        </StyledSection>
        <StyledSection id={sections[4]} className="snap-always snap-center">
          <FileManager />
        </StyledSection>
      </div>
    </main>
  )
}
