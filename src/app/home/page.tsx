import React, {
  // useEffect,
  // useState
} from 'react'
import GitUser from 'src/components/GitUser'
import StyledSection from "src/components/StyledSection"
import Counter from "src/components/counter"

const sections = ['Welcome', 'About', 'Robotics', 'Github']

export default function Page() {
  console.log('Rendering Home...')

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <h1 className="fixed text-5xl items-center font-extrabold tracking-tight text-white sm:text-[5rem] top-4 left-4">
        gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev<span className="text-[hsl(280,100%,40%)]">/</span>home <span className="text-gray-700">Work in progress...</span>
      </h1>
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 snap-y snap-mandatory">
        <StyledSection id={sections[0]}>
          <h3 className="font-extrabold text-xl">{"Welcome to my website!"}</h3>
          <p>{"-----"}</p>
          <p>{"I'm Kaden Hood."}</p>
          <p>{"I'm a young software engineer."}</p>
        </StyledSection>
        <StyledSection id={sections[1]}>
          <h3>{"About Me"}</h3>
          <p>{"-----"}</p>
          <p>{"I wear gloves, and go by \"Gloves\" online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <StyledSection id={sections[2]}>
          <h3><strong><a className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</a></strong></h3>
          <p><a className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</a></p>
          <p>{"Since 2023 - Present"}</p>
          <p>{"-----"}</p>
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java and Python"}</p>
        </StyledSection>
        <StyledSection>
          <p>Here a counter button thing...</p>
          <Counter></Counter>
        </StyledSection>
        <StyledSection id={sections[3]}>
          <GitUser name="TheGloved1"></GitUser>
        </StyledSection>
      </div>
    </main>
  )
}
