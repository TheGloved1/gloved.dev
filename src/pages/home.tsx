import "src/styles/globals.css";
import React from 'react';
import StyledSection from "src/components/StyledSection";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <StyledSection>
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev/home Work in progress...
          </h1>
        </StyledSection>
        <StyledSection>
          <h1>{"Welcome to my website!"}</h1>
          <p>{"I'm Kaden Hood."}</p>
          <p>{"I'm a young software engineer."}</p>
        </StyledSection>
        <StyledSection>
          <h2>{"About Me"}</h2>
          <p>{"I wear gloves, and go by \"Gloves\" online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <StyledSection>
          <h2><strong><a className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</a></strong></h2>
          <p><a className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</a></p>
          <p>{"Since 2023 - Present"}</p>
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java and Python"}</p>
        </StyledSection>
      </div>
    </main>
  );
}
