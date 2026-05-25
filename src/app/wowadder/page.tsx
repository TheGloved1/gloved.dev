import Constants from '@/lib/constants';
import { Metadata } from 'next';
import WowAdderPage from './_components/WowAdderPage';

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.WowAdder.title,
  description: Constants.WowAdder.description,
};

export default function Page(): React.JSX.Element {
  return <WowAdderPage />;
}
