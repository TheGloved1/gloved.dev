import { NAME } from '@/lib/constants'
import Colors from './_components/Colors'

export const metadata = {
  title: `${NAME} | Colors`,
  description: 'A stupid color game...',
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <div className='h-dvh w-dvw'>
        <Colors />
      </div>
    </>
  )
}
