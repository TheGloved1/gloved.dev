'use client';
import { SignUp } from '@clerk/nextjs';

export default function Page(): React.JSX.Element {
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <SignUp signInUrl={window.origin + '/sign-in'} />
    </main>
  );
}
