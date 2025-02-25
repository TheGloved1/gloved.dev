import Constants from '@/lib/constants';
import { Metadata } from 'next';
import HangmanPage from './_components/HangmanPage';

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.Hangman.title,
  description: Constants.Hangman.description,
};

export default function Page(): React.JSX.Element {
  return <HangmanPage />;
}
