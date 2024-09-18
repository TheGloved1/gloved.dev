import { Discord, NAME } from '@/lib/constants'
import { Link, MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [{ title: NAME + ' | ' + Discord.title }, { name: 'description', content: Discord.description }]
}

export default function Page(): React.JSX.Element {
  return (
    <div className='flex min-h-[95vh] flex-col items-center justify-center text-center tracking-tight'>
      <h1 className='text-4xl font-bold'>{'Find Me on Discord!'}</h1>
      <p className='max-w-[500px]'>{"Whether you have a question, or just want to chat, I'm always available on my discord server. Don't hesitate to reach out!"}</p>
      <Link to='https://discord.gloved.dev' className='btn'>
        {'Join Server'}
      </Link>
    </div>
  )
}
