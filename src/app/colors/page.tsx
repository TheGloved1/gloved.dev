import Constants from '@/lib/constants'
import Colors from './_components/Colors'

export const metadata = {
  title: `${Constants.NAME} | ${Constants.Colors.title}`,
  description: Constants.Colors.description,
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
