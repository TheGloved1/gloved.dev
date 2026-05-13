interface AnimatedBirdProps {
  wingPhase: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  isDead?: boolean;
}

export function SparrowBird({ wingPhase, size, x, y, rotation, isDead = false }: AnimatedBirdProps) {
  const bodyColor = isDead ? '#8b7355' : '#8B6914';
  const bellyColor = isDead ? '#d2b48c' : '#F4E4C1';
  const wingColor = '#654321';

  return (
    <g transform={`translate(${x + size / 2}, ${y + size / 2}) rotate(${rotation}) translate(${-size / 2}, -20)`}>
      {/* Pixel Art Sparrow (Rect-based) */}
      <rect x='8' y='12' width='24' height='24' fill={bodyColor} /> {/* Body */}
      <rect x='12' y='8' width='16' height='16' fill={bodyColor} /> {/* Head */}
      <rect x='16' y='20' width='16' height='12' fill={bellyColor} /> {/* Belly */}
      <rect x='24' y='12' width='4' height='4' fill='#FFF' /> {/* Eye */}
      <rect x='26' y='14' width='2' height='2' fill='#1F2937' /> {/* Pupil */}
      <rect x='32' y='16' width='8' height='4' fill='#FF8C00' /> {/* Beak */}
      <rect x='4' y='18' width='12' height='8' fill={wingColor} /> {/* Wing */}
    </g>
  );
}
