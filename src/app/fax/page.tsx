import PageBack from '@/components/PageBack';
import Constants from '@/lib/constants';
import { Metadata } from 'next';
import FactGenerator from './_components/FactGenerator';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.Fax.title}`,
  description: Constants.Fax.description,
};

export default function Page() {
  return (
    <>
      <PageBack />
      <div className='flex min-h-screen flex-col bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
        <div className='noise-overlay' />
        <main className='grid-pattern flex flex-1 items-center justify-center px-4 py-4 lg:px-6'>
          <FactGenerator />
        </main>
      </div>
    </>
  );
}
