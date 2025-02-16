import PageBack from '@/components/PageBack'
import Colors from './_components/Colors'

export default function Page(): React.JSX.Element {
  return (
    <>
      <div className='h-dvh w-dvw'>
        <PageBack />
        <Colors />
      </div>
    </>
  )
}
