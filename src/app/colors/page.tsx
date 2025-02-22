import * as constants from '@/lib/constants'
import Colors from './_components/Colors'

export const metadata = {
  title: `${constants.NAME} | ${constants.Colors.title}`,
  description: constants.Colors.description,
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
