import "src/styles/globals.css";
import React from 'react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev/home
          coming soon!
        </h1>
      </div>
    </main>
  );

}
