"use client";

import React, { useState } from 'react';
import StyledSection from "src/components/StyledSection";

export default function Page() {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = ['Welcome', 'About', 'Robotics'];

  const handleNext = () => {
    const nextSection = (currentSection + 1) % sections.length;
    setCurrentSection(nextSection);
    const element = document.getElementById(sections[nextSection]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    const prevSection = (currentSection - 1 + sections.length) % sections.length;
    setCurrentSection(prevSection);
    const element = document.getElementById(sections[prevSection]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <h1 className="fixed text-5xl font-extrabold tracking-tight text-white sm:text-[5rem] top-4 left-4">
        gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev<span className="text-[hsl(280,100%,40%)]">/</span>home <span className="text-gray-700">Work in progress...</span>
      </h1>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 scroll-snap-y-mandatory">
        <StyledSection id={sections[0]}>
          <h2>{"Welcome to my website!"}</h2>
          <p>{"I'm Kaden Hood."}</p>
          <p>{"I'm a young software engineer."}</p>
        </StyledSection>
        <StyledSection id={sections[1]}>
          <h2>{"About Me"}</h2>
          <p>{"I wear gloves, and go by \"Gloves\" online."}</p>
          <p>{"And if you couldn't tell already, I like to code."}</p>
        </StyledSection>
        <StyledSection id={sections[2]}>
          <h2><strong><a className="fancy-link" href="https://meporobotics.com/">{"Mediapolis High School Robotics Club"}</a></strong></h2>
          <p><a className="fancy-link" href="https://frc-events.firstinspires.org/team/9061">{"FIRST Inspires Robotics Team 9061"}</a></p>
          <p>{"Since 2023 - Present"}</p>
          <p><strong>{"Role: "}</strong>{"Programmer"}</p>
          <p><strong>{"Language: "}</strong>{"Java and Python"}</p>
        </StyledSection>
      </div>
      <button className="fixed bottom-4 left-4 rounded" onClick={handlePrev}>Previous</button>
      <button className="fixed bottom-4 right-4" onClick={handleNext}>Next</button>
    </main>
  );
}
