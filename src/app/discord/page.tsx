import DiscordServerWidget from '@/components/DiscordServerWidget';
import Constants from '@/lib/constants';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.Discord.title,
  description: Constants.Discord.description,
};

export default function Page(): React.JSX.Element {
  return (
    <div className='flex min-h-[95vh] flex-col items-center justify-center text-center'>
      <h1 className='text-4xl font-bold'>{'Find Me on Discord!'}</h1>
      <p className='max-w-[500px]'>
        {
          "Whether you have a question, or just want to chat, I'm always available on my discord server. Don't hesitate to reach out!"
        }
      </p>
      <Link href='https://discord.gloved.dev' className='btn mt-4'>
        {'Join Server'}
      </Link>
      <div className='mt-8 flex items-center justify-center rounded-xl'>
        <DiscordServerWidget />
      </div>
    </div>
  );
}
