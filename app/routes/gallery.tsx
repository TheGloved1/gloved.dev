import React from "react";
import ChevronLeft from "@/components/ChevronLeft";
import { Link, MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: 'gloved.dev | Gallery' },
    {
      name: 'description',
      content: 'The gallery page to tribute the lost life of my best friend.',
    },
    { name: 'icons', content: 'https://api.gloved.dev/gallery/Leo_1.jpg' },
  ]
}

export default function Gallery(): React.JSX.Element {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white">
            <Link to={'/'} className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 md:bottom-auto md:top-2'>
                <button className='btn flex flex-row items-center justify-center'>
                    <ChevronLeft />
                    {'Back'}
                </button>
            </Link>
            <h1 className="text-2xl">Gallery</h1>
            <h2 className="text-md">Upload and view images here.</h2>
        </main>
    )

}