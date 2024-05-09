import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          gloved<span className="text-[hsl(280,100%,40%)]">.</span>dev
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://gloved.web/"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Home →</h3>
            <div className="text-lg">
              The landing page for my portfolio based web project built using React.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://github.com/TheGloved1/"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Github →</h3>
            <div className="text-lg">
              Visit the git repo to see the source, or visit my Github profile to take a look at my other projects.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
