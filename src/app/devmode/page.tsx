import DevModeOnly from '@/components/DevModeOnly'

export default function Page(): React.JSX.Element {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center border-4 border-white bg-gray-700/50 p-4 text-[10px] md:text-[1rem]'>
      <DevModeOnly fallback={<>{'This page is only available in a development environment.'}</>}>
        <>{'YOUR IN DEV MODE!'}</>
      </DevModeOnly>
    </div>
  )
}
