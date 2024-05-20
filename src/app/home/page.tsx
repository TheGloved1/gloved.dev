"use client"
import Link from 'next/link'
import React, {
  // useEffect,
  // useState
} from 'react'
import GitUser from 'src/components/GitUser'
import StyledSection from 'src/components/StyledSection'
import { Button } from 'src/components/ui/button'

//  TODO: Add more information on how the website is built and things it can do using React.

const sections = ['Welcome', 'About', 'Robotics', 'Github']

export default function Page() {
  console.log('Rendering Home...')

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <Button className='fixed p-4 top-4 left-4'>
        <Link href={"/"}>{"<- Back"}</Link>
      </Button>
      <h1 className="fixed items-center font-bold tracking-tight text-white sm:text-[5rem]">
        gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev<span className="text-[hsl(280,100%,40%)]">/</span>home <span className="text-gray-700">Work in progress...</span>
      </h1>
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 snap-y snap-mandatory">
        <StyledSection id={sections[0]}>
          <h3 className="font-extrabold text-xl">{"Welcome to my website!"}</h3>
          <p>{"-----"}</p>
          <p>{"I'm Kaden Hood."}</p>
          <p>{"and I'm a young software engineer."}</p>
        </StyledSection>
        <StyledSection id={sections[1]}>
          <h3>{"About Me"}</h3>
          <p>{"-----"}</p>
          <p>{"I wear gloves, and go by \"Gloves\" online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <StyledSection id={sections[2]}>
          <h3><strong><Link className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</Link></strong></h3>
          <p><Link className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</Link></p>
          <p>{"Since 2023 - Present"}</p>
          <p>{"-----"}</p>
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java and Python"}</p>
        </StyledSection>
        <StyledSection id={sections[3]}>
          <h3>{"My Github Profile"}</h3>
          <GitUser name="TheGloved1"></GitUser>
        </StyledSection>
      </div>
    </main>
  )
}
