import Link from 'next/link'
import React, {
  // useEffect,
  // useState
} from 'react'
import GitUser from '@/components/GitUser'
import StyledSection from '@/components/StyledSection'
import { Button } from '@/components/ui/button'

//  TODO: Add more information on how the website is built and things it can do using React.
//  TODO: Fix the "Home" page to be more responsive and have a better layout.

const sections = ['Welcome', 'About', 'Robotics', 'Github']

export default function Page() {
  console.log('Rendering Home...')

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white snap-mandatory snap-y">
      <Button className='fixed p-4 top-4 left-4'>
        <Link href={"/"}>{"<- Back"}</Link>
      </Button>
      <div className="fixed items-center text-sm sm:text-[5rem] animate-pulse top-4">
        gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev<span className="text-[hsl(280,100%,40%)]">/</span>home <span className="text-gray-700">Work in progress...</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <StyledSection id={sections[0]} className="snap-start">
          <h3 className="font-extrabold text-xl">{"Welcome to my website!"}</h3>
          <br />
          <p>{"I'm Kaden Hood."}</p>
          <p>{"and I'm a young software engineer."}</p>
        </StyledSection>
        <StyledSection id={sections[1]} className="snap-start">
          <h3>{"About Me"}</h3>
          <br />
          <p>{"I wear gloves, and go by \"Gloves\" online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <StyledSection id={sections[2]} className="snap-start">
          <h3><strong><Link className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</Link></strong></h3>
          <p><Link className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</Link></p>
          <p>{"Since 2023 - Present"}</p>
          <br />
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java and Python"}</p>
        </StyledSection>
        <StyledSection id={sections[3]} className="snap-start">
          <h3>{"My Github Profile"}</h3>
          <br />
          <GitUser name="TheGloved1"></GitUser>
        </StyledSection>
      </div>
    </main>
  )
}
