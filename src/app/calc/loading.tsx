import Loading from '@/components/loading'
export default function loading() {
  return (
    <>
      <div className='flex h-dvh w-dvw flex-col items-center justify-center gap-4'>
        <Loading />
      </div>
    </>
  )
}
