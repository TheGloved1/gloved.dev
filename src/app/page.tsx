import Link from "next/link"

export default function Page() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white bg-gradient-to-br from-sky-950 to-[#1e210c]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/home"
          >
            <h3 className="text-2xl font-bold">Home →</h3>
            <div className="text-lg">
              The home page for my About Me based web project built with the Next.js React Web Framework.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/todos"
          >
            <h3 className="text-2xl font-bold">Todo App →</h3>
            <div className="text-lg">
              A simple todo list web app. Uses local storage to save and get todos list even after reloading.
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://github.com/TheGloved1/"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Github →</h3>
            <div className="text-lg">
              View the source code. Visit my Github profile to take a look at my other projects.
            </div>
          </Link>
          <Link className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20" href="https://old.gloved.dev/">
            <h3 className="text-2xl font-bold">Old Site →</h3>
            <div className="text-lg">
              Visit the old site. This is the previous version of my About Me site built with Vue.
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
