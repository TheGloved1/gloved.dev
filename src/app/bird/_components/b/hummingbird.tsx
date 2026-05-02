import React from 'react';

interface AnimatedBirdProps {
  wingPhase: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  isDead?: boolean;
}

export function HummingbirdBird({ wingPhase, size, x, y, rotation, isDead = false }: AnimatedBirdProps) {
  const wingAngle = Math.sin(wingPhase * 3) * 45; // Faster wing beat
  const bodyColor = isDead ? '#778899' : '#228b22';
  const throatColor = isDead ? '#8fbc8f' : '#ff69b4';
  
  return (
    <g transform={`translate(${x + size/2}, ${y + size/2}) rotate(${rotation}) translate(${-size/2}, ${-size/2})`}>
      {/* Shadow */}
      <ellipse
        cx={size/2}
        cy={size * 0.95}
        rx={size * 0.3}
        ry={size * 0.06}
        fill="rgba(0,0,0,0.2)"
      />
      
      {/* Body - more slender */}
      <ellipse
        cx={size/2}
        cy={size/2}
        rx={size * 0.25}
        ry={size * 0.35}
        fill={bodyColor}
        stroke="#006400"
        strokeWidth="1"
      />
      
      {/* Throat patch */}
      <ellipse
        cx={size * 0.55}
        cy={size * 0.35}
        rx={size * 0.12}
        ry={size * 0.15}
        fill={throatColor}
        opacity="0.8"
      />
      
      {/* Left Wing - very fast movement */}
      <g transform={`translate(${size * 0.2}, ${size * 0.4})`}>
        <g transform={`rotate(${-wingAngle})`}>
          <path
            d={`M 0,0 Q ${-size * 0.25},${-size * 0.35} ${-size * 0.4},${-size * 0.3} Q ${-size * 0.45},${size * 0.05} ${-size * 0.2},${size * 0.1} Z`}
            fill={bodyColor}
            stroke="#006400"
            strokeWidth="0.5"
          />
          {/* Wing shimmer */}
          <path
            d={`M ${-size * 0.05},${-size * 0.1} Q ${-size * 0.2},${-size * 0.2} ${-size * 0.3},${-size * 0.15}`}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.3"
            fill="none"
          />
        </g>
      </g>
      
      {/* Right Wing */}
      <g transform={`translate(${size * 0.8}, ${size * 0.4})`}>
        <g transform={`rotate(${wingAngle})`}>
          <path
            d={`M 0,0 Q ${size * 0.25},${-size * 0.35} ${size * 0.4},${-size * 0.3} Q ${size * 0.45},${size * 0.05} ${size * 0.2},${size * 0.1} Z`}
            fill={bodyColor}
            stroke="#006400"
            strokeWidth="0.5"
          />
          {/* Wing shimmer */}
          <path
            d={`M ${size * 0.05},${-size * 0.1} Q ${size * 0.2},${-size * 0.2} ${size * 0.3},${-size * 0.15}`}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.3"
            fill="none"
          />
        </g>
      </g>
      
      {/* Head */}
      <circle
        cx={size * 0.65}
        cy={size * 0.25}
        r={size * 0.15}
        fill={bodyColor}
        stroke="#006400"
        strokeWidth="1"
      />
      
      {/* Eye */}
      <circle
        cx={size * 0.68}
        cy={size * 0.23}
        r={size * 0.04}
        fill="white"
      />
      <circle
        cx={size * 0.69}
        cy={size * 0.23}
        r={size * 0.025}
        fill="black"
      />
      
      {/* Long thin beak */}
      <path
        d={`M ${size * 0.78},${size * 0.25} L ${size * 1.1},${size * 0.26} L ${size * 0.78},${size * 0.27} Z`}
        fill="#000"
        opacity="0.8"
      />
      
      {/* Tail feathers - spread */}
      <path
        d={`M ${size * 0.25},${size * 0.7} L ${size * 0.15},${size * 0.85} L ${size * 0.2},${size * 0.8} Z`}
        fill={bodyColor}
        stroke="#006400"
        strokeWidth="0.5"
      />
      <path
        d={`M ${size * 0.25},${size * 0.7} L ${size * 0.25},${size * 0.9} L ${size * 0.3},${size * 0.8} Z`}
        fill={bodyColor}
        stroke="#006400"
        strokeWidth="0.5"
      />
      <path
        d={`M ${size * 0.25},${size * 0.7} L ${size * 0.35},${size * 0.85} L ${size * 0.3},${size * 0.8} Z`}
        fill={bodyColor}
        stroke="#006400"
        strokeWidth="0.5"
      />
    </g>
  );
}
