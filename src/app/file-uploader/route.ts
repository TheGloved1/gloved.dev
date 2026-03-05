import { redirect } from 'next/navigation';

// Redirect to the files page
export async function GET() {
  redirect('/files');
}
