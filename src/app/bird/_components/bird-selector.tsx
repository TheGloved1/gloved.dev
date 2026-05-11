'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { birdTypes, type BirdType } from './b';

interface BirdSelectorProps {
  onBirdChange?: (birdType: BirdType) => void;
  currentBird?: BirdType;
}

export function BirdSelector({ onBirdChange, currentBird }: BirdSelectorProps) {
  const [selectedBird, setSelectedBird] = useLocalStorage<BirdType>('selected-bird', 'sparrow');

  const handleBirdChange = (birdType: BirdType) => {
    setSelectedBird(birdType);
    onBirdChange?.(birdType);
  };

  const birdInfo = {
    sparrow: { name: 'Sparrow', emoji: '🐦', color: 'bg-yellow-600' },
    cardinal: { name: 'Cardinal', emoji: '🟥', color: 'bg-red-600' },
    bluejay: { name: 'Blue Jay', emoji: '🔵', color: 'bg-blue-600' },
    hummingbird: { name: 'Hummingbird', emoji: '🐤', color: 'bg-green-600' },
  };

  return (
    <div className='flex flex-col gap-2'>
      <Label className='text-sm font-medium text-green-200'>Choose Your Bird:</Label>
      <div className='grid grid-cols-2 gap-2'>
        {birdTypes.map((birdType) => {
          const info = birdInfo[birdType];
          const isSelected = (currentBird || selectedBird) === birdType;

          return (
            <Button
              key={birdType}
              onClick={() => handleBirdChange(birdType)}
              className={`flex items-center gap-2 rounded-none border-2 px-3 py-2 text-sm font-medium transition-all ${
                isSelected ?
                  'border-yellow-400 bg-yellow-900/40 text-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                : 'border-green-800 bg-green-950/40 text-green-200/70 hover:border-green-600 hover:bg-green-900/40'
              } `}
            >
              <span className='text-lg'>{info.emoji}</span>
              <span>{info.name}</span>
              {isSelected && <div className={`ml-auto h-2 w-2 ${info.color}`} />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
