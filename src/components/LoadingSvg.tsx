export default function LoadingSvg() {
  return (
    <div className='flex size-12 items-center justify-center'>
      <svg
        version='1.1'
        id='L5'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        x='0px'
        y='0px'
        viewBox='0 0 120 120'
        enableBackground='new 0 0 0 0'
        xmlSpace='preserve'
      >
        <circle fill='#fff' stroke='none' cx='6' cy='50' r='6'>
          <animateTransform
            attributeName='transform'
            dur='0.5s'
            type='translate'
            values='0 10 ; 0 -10; 0 10'
            repeatCount='indefinite'
            begin='0.1'
          />
        </circle>
        <circle fill='#fff' stroke='none' cx='30' cy='50' r='6'>
          <animateTransform
            attributeName='transform'
            dur='0.5s'
            type='translate'
            values='0 10 ; 0 -10; 0 10'
            repeatCount='indefinite'
            begin='0.2'
          />
        </circle>
        <circle fill='#fff' stroke='none' cx='54' cy='50' r='6'>
          <animateTransform
            attributeName='transform'
            dur='0.5s'
            type='translate'
            values='0 10 ; 0 -10; 0 10'
            repeatCount='indefinite'
            begin='0.3'
          />
        </circle>
      </svg>
    </div>
  );
}
