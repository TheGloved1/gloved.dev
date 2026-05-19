'use client';

const HEAD = (
  <div className='absolute right-[-20px] top-[50px] h-[50px] w-[50px] rounded-full border-[3px] border-fuchsia-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]' />
);

const BODY = (
  <div className='absolute right-0 top-[100px] h-[120px] w-[3px] bg-fuchsia-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' />
);

const RIGHT_ARM = (
  <div className='absolute right-[-100px] top-[150px] h-[3px] w-[100px] origin-bottom-left -rotate-[30deg] bg-fuchsia-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]' />
);

const LEFT_ARM = (
  <div className='absolute right-[10px] top-[150px] h-[3px] w-[100px] origin-bottom-right rotate-[30deg] bg-fuchsia-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]' />
);

const RIGHT_LEG = (
  <div className='absolute right-[-90px] top-[210px] h-[3px] w-[100px] origin-bottom-left rotate-[60deg] bg-fuchsia-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]' />
);

const LEFT_LEG = (
  <div className='absolute right-0 top-[210px] h-[3px] w-[100px] origin-bottom-right -rotate-[60deg] bg-fuchsia-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]' />
);

const BODY_PARTS = [HEAD, BODY, RIGHT_ARM, LEFT_ARM, RIGHT_LEG, LEFT_LEG];

type HangmanDrawingProps = {
  numberOfGuesses: number;
};

export function HangmanDrawing({ numberOfGuesses }: HangmanDrawingProps) {
  return (
    <div className='flex w-full justify-center overflow-x-auto'>
      <div className='scale-[0.55] sm:scale-[0.75] md:scale-[0.9] lg:scale-100'>
        <div className='relative'>
          {BODY_PARTS.slice(0, numberOfGuesses)}
          <div className='absolute right-0 top-0 h-[50px] w-[3px] rounded-sm bg-fuchsia-500/80' />
          <div className='ml-[120px] h-[3px] w-[200px] rounded-sm bg-fuchsia-500/80' />
          <div className='ml-[120px] h-[400px] w-[3px] rounded-sm bg-fuchsia-500/80' />
          <div className='h-[3px] w-[250px] rounded-sm bg-fuchsia-500/80 shadow-[0_0_15px_rgba(236,72,153,0.3)]' />
        </div>
      </div>
    </div>
  );
}
