import React from 'react';

interface AnimatedBirdProps {
  wingPhase: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  isDead?: boolean;
}

export function SparrowBird({ wingPhase, size, x, y, rotation, isDead = false }: AnimatedBirdProps) {
  const wingAngle = Math.sin(wingPhase) * 30;
  const bodyColor = isDead ? '#8b7355' : '#8b6914';
  const bellyColor = isDead ? '#d2b48c' : '#f4e4c1';
  
  return (
    <g transform={`translate(${x + size/2}, ${y + size/2}) rotate(${rotation}) translate(${-size/2}, ${-size/2})`}>
      {/* Shadow */}
      <ellipse
        cx={size/2}
        cy={size * 0.95}
        rx={size * 0.4}
        ry={size * 0.08}
        fill="rgba(0,0,0,0.2)"
      />
      
      {/* Body */}
      <ellipse
        cx={size/2}
        cy={size/2}
        rx={size * 0.35}
        ry={size * 0.4}
        fill={bodyColor}
        stroke="#654321"
        strokeWidth="1"
      />
      
      {/* Belly */}
      <ellipse
        cx={size/2}
        cy={size * 0.55}
        rx={size * 0.25}
        ry={size * 0.3}
        fill={bellyColor}
      />
      
      {/* Left Wing */}
      <g transform={`translate(${size * 0.15}, ${size * 0.45})`}>
        <g transform={`rotate(${-wingAngle})`}>
          <path
            d={`M 0,0 Q ${-size * 0.3},${-size * 0.2} ${-size * 0.5},${-size * 0.1} Q ${-size * 0.6},${size * 0.1} ${-size * 0.3},${size * 0.15} Z`}
            fill={bodyColor}
            stroke="#654321"
            strokeWidth="1"
          />
          {/* Wing detail */}
          <path
            d={`M ${-size * 0.1},${-size * 0.05} Q ${-size * 0.25},${-size * 0.1} ${-size * 0.35},${-size * 0.05}`}
            stroke="#4a3018"
            strokeWidth="0.5"
            fill="none"
          />
        </g>
      </g>
      
      {/* Right Wing */}
      <g transform={`translate(${size * 0.85}, ${size * 0.45})`}>
        <g transform={`rotate(${wingAngle})`}>
          <path
            d={`M 0,0 Q ${size * 0.3},${-size * 0.2} ${size * 0.5},${-size * 0.1} Q ${size * 0.6},${size * 0.1} ${size * 0.3},${size * 0.15} Z`}
            fill={bodyColor}
            stroke="#654321"
            strokeWidth="1"
          />
          {/* Wing detail */}
          <path
            d={`M ${size * 0.1},${-size * 0.05} Q ${size * 0.25},${-size * 0.1} ${size * 0.35},${-size * 0.05}`}
            stroke="#4a3018"
            strokeWidth="0.5"
            fill="none"
          />
        </g>
      </g>
      
      {/* Head */}
      <circle
        cx={size * 0.65}
        cy={size * 0.3}
        r={size * 0.18}
        fill={bodyColor}
        stroke="#654321"
        strokeWidth="1"
      />
      
      {/* Eye */}
      <circle
        cx={size * 0.7}
        cy={size * 0.28}
        r={size * 0.05}
        fill="white"
      />
      <circle
        cx={size * 0.72}
        cy={size * 0.28}
        r={size * 0.03}
        fill="black"
      />
      <circle
        cx={size * 0.68}
        cy={size * 0.26}
        r={size * 0.02}
        fill="white"
      />
      
      {/* Beak */}
      <path
        d={`M ${size * 0.8},${size * 0.3} L ${size * 0.95},${size * 0.32} L ${size * 0.8},${size * 0.35} Z`}
        fill="#ff8c00"
        stroke="#ff6600"
        strokeWidth="0.5"
      />
      
      {/* Tail */}
      <path
        d={`M ${size * 0.15},${size * 0.5} L ${size * 0.05},${size * 0.4} L ${size * 0.05},${size * 0.6} Z`}
        fill={bodyColor}
        stroke="#654321"
        strokeWidth="1"
      />
    </g>
  );
}
