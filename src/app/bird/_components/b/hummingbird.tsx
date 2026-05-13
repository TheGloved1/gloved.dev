interface AnimatedBirdProps {
  wingPhase: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  isDead?: boolean;
}

export function HummingbirdBird({ wingPhase, size, x, y, rotation, isDead = false }: AnimatedBirdProps) {
  const bodyColor = isDead ? '#778899' : '#228B22';
  const wingColor = '#006400';
  const bellyColor = '#BBF7D0';

  return (
    <g transform={`translate(${x + size / 2}, ${y + size / 2}) rotate(${rotation}) translate(${-size / 2}, -20)`}>
      {/* Pixel Art Hummingbird */}
      <rect x='14' y='12' width='14' height='20' fill={bodyColor} /> {/* Body */}
      <rect x='20' y='4' width='14' height='12' fill={bodyColor} /> {/* Head */}
      <rect x='16' y='16' width='10' height='14' fill={bellyColor} /> {/* Belly */}
      <rect x='22' y='14' width='6' height='8' fill='#FF69B4' /> {/* Throat */}
      <rect x='32' y='8' width='14' height='2' fill='#000' /> {/* Beak top */}
      <rect x='32' y='10' width='12' height='2' fill='#000' /> {/* Beak bottom */}
      <rect x='26' y='8' width='5' height='5' fill='#FFF' /> {/* Eye */}
      <rect x='28' y='10' width='2' height='2' fill='#1F2937' /> {/* Pupil */}
      <rect x='8' y='12' width='12' height='4' fill='rgba(34,139,34,0.6)' /> {/* Wing */}
    </g>
  );
}
