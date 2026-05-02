'use client';
import React from 'react';
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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white">Choose Your Bird:</label>
      <div className="grid grid-cols-2 gap-2">
        {birdTypes.map((birdType) => {
          const info = birdInfo[birdType];
          const isSelected = (currentBird || selectedBird) === birdType;
          
          return (
            <button
              key={birdType}
              onClick={() => handleBirdChange(birdType)}
              className={`
                flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all
                ${isSelected 
                  ? 'border-white bg-white/20 text-white shadow-lg' 
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                }
              `}
            >
              <span className="text-lg">{info.emoji}</span>
              <span>{info.name}</span>
              {isSelected && (
                <div className={`ml-auto h-2 w-2 rounded-full ${info.color}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
