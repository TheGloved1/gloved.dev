import React from 'react';

interface AnimatedBirdProps {
  wingPhase: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  isDead?: boolean;
}

export function CardinalBird({ wingPhase, size, x, y, rotation, isDead = false }: AnimatedBirdProps) {
  const wingAngle = Math.sin(wingPhase) * 35;
  const bodyColor = isDead ? '#8b4513' : '#dc143c';
  const crestHeight = Math.sin(wingPhase * 0.5) * 2 + size * 0.15;
  
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
        stroke="#8b0000"
        strokeWidth="1"
      />
      
      {/* Belly */}
      <ellipse
        cx={size/2}
        cy={size * 0.55}
        rx={size * 0.25}
        ry={size * 0.3}
        fill="#ffd4a3"
      />
      
      {/* Left Wing */}
      <g transform={`translate(${size * 0.15}, ${size * 0.45})`}>
        <g transform={`rotate(${-wingAngle})`}>
          <path
            d={`M 0,0 Q ${-size * 0.35},${-size * 0.25} ${-size * 0.6},${-size * 0.15} Q ${-size * 0.7},${size * 0.1} ${-size * 0.35},${size * 0.2} Z`}
            fill={bodyColor}
            stroke="#8b0000"
            strokeWidth="1"
          />
          {/* Wing detail */}
          <path
            d={`M ${-size * 0.1},${-size * 0.08} Q ${-size * 0.3},${-size * 0.15} ${-size * 0.4},${-size * 0.08}`}
            stroke="#4a0000"
            strokeWidth="0.5"
            fill="none"
          />
        </g>
      </g>
      
      {/* Right Wing */}
      <g transform={`translate(${size * 0.85}, ${size * 0.45})`}>
        <g transform={`rotate(${wingAngle})`}>
          <path
            d={`M 0,0 Q ${size * 0.35},${-size * 0.25} ${size * 0.6},${-size * 0.15} Q ${size * 0.7},${size * 0.1} ${size * 0.35},${size * 0.2} Z`}
            fill={bodyColor}
            stroke="#8b0000"
            strokeWidth="1"
          />
          {/* Wing detail */}
          <path
            d={`M ${size * 0.1},${-size * 0.08} Q ${size * 0.3},${-size * 0.15} ${size * 0.4},${-size * 0.08}`}
            stroke="#4a0000"
            strokeWidth="0.5"
            fill="none"
          />
        </g>
      </g>
      
      {/* Head */}
      <circle
        cx={size * 0.65}
        cy={size * 0.3}
        r={size * 0.2}
        fill={bodyColor}
        stroke="#8b0000"
        strokeWidth="1"
      />
      
      {/* Crest */}
      <path
        d={`M ${size * 0.55},${size * 0.2} L ${size * 0.58},${size * 0.1} L ${size * 0.65},${size * 0.05} L ${size * 0.72},${size * 0.1} L ${size * 0.75},${size * 0.2}`}
        fill={bodyColor}
        stroke="#8b0000"
        strokeWidth="0.5"
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
        fill="#ffa500"
        stroke="#ff8c00"
        strokeWidth="0.5"
      />
      
      {/* Mask around eye */}
      <path
        d={`M ${size * 0.62},${size * 0.25} Q ${size * 0.65},${size * 0.22} ${size * 0.75},${size * 0.25} Q ${size * 0.72},${size * 0.32} ${size * 0.62},${size * 0.32} Z`}
        fill="black"
        opacity="0.8"
      />
      
      {/* Tail */}
      <path
        d={`M ${size * 0.15},${size * 0.5} L ${size * 0.05},${size * 0.35} L ${size * 0.05},${size * 0.65} Z`}
        fill={bodyColor}
        stroke="#8b0000"
        strokeWidth="1"
      />
    </g>
  );
}
