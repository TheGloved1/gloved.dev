import { BlueJayBird } from './bluejay';
import { CardinalBird } from './cardinal';
import { HummingbirdBird } from './hummingbird';
import { SparrowBird } from './sparrow';

export interface AnimatedBirdProps {
  wingPhase: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  isDead?: boolean;
  birdType?: BirdType;
}

export function AnimatedBird({ wingPhase, size, x, y, rotation, isDead = false, birdType = 'sparrow' }: AnimatedBirdProps) {
  const birdComponents = {
    sparrow: SparrowBird,
    cardinal: CardinalBird,
    bluejay: BlueJayBird,
    hummingbird: HummingbirdBird,
  };

  const BirdComponent = birdComponents[birdType];

  return <BirdComponent wingPhase={wingPhase} size={size} x={x} y={y} rotation={rotation} isDead={isDead} />;
}

export const birdTypes = ['sparrow', 'cardinal', 'bluejay', 'hummingbird'] as const;
export type BirdType = (typeof birdTypes)[number];
