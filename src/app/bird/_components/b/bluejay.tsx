import React from 'react';

interface AnimatedBirdProps {
  wingPhase: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  isDead?: boolean;
}

export function BlueJayBird({ wingPhase, size, x, y, rotation, isDead = false }: AnimatedBirdProps) {
  const wingAngle = Math.sin(wingPhase) * 40;
  const bodyColor = isDead ? '#6b8e9b' : '#4169e1';
  
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
        stroke="#1e3a8a"
        strokeWidth="1"
      />
      
      {/* Belly */}
      <ellipse
        cx={size/2}
        cy={size * 0.55}
        rx={size * 0.25}
        ry={size * 0.3}
        fill="#e6f3ff"
      />
      
      {/* Left Wing */}
      <g transform={`translate(${size * 0.15}, ${size * 0.45})`}>
        <g transform={`rotate(${-wingAngle})`}>
          <path
            d={`M 0,0 Q ${-size * 0.4},${-size * 0.3} ${-size * 0.7},${-size * 0.2} Q ${-size * 0.8},${size * 0.1} ${-size * 0.4},${size * 0.2} Z`}
            fill={bodyColor}
            stroke="#1e3a8a"
            strokeWidth="1"
          />
          {/* Wing bars */}
          <rect
            x={-size * 0.6}
            y={-size * 0.15}
            width={size * 0.3}
            height={size * 0.05}
            fill="white"
            transform={`rotate(-20)`}
          />
          <rect
            x={-size * 0.5}
            y={-size * 0.05}
            width={size * 0.25}
            height={size * 0.04}
            fill="white"
            transform={`rotate(-15)`}
          />
        </g>
      </g>
      
      {/* Right Wing */}
      <g transform={`translate(${size * 0.85}, ${size * 0.45})`}>
        <g transform={`rotate(${wingAngle})`}>
          <path
            d={`M 0,0 Q ${size * 0.4},${-size * 0.3} ${size * 0.7},${-size * 0.2} Q ${size * 0.8},${size * 0.1} ${size * 0.4},${size * 0.2} Z`}
            fill={bodyColor}
            stroke="#1e3a8a"
            strokeWidth="1"
          />
          {/* Wing bars */}
          <rect
            x={size * 0.3}
            y={-size * 0.15}
            width={size * 0.3}
            height={size * 0.05}
            fill="white"
            transform={`rotate(20)`}
          />
          <rect
            x={size * 0.25}
            y={-size * 0.05}
            width={size * 0.25}
            height={size * 0.04}
            fill="white"
            transform={`rotate(15)`}
          />
        </g>
      </g>
      
      {/* Head */}
      <circle
        cx={size * 0.65}
        cy={size * 0.3}
        r={size * 0.2}
        fill={bodyColor}
        stroke="#1e3a8a"
        strokeWidth="1"
      />
      
      {/* Crest */}
      <path
        d={`M ${size * 0.55},${size * 0.2} L ${size * 0.58},${size * 0.05} L ${size * 0.65},${size * 0} L ${size * 0.72},${size * 0.05} L ${size * 0.75},${size * 0.2}`}
        fill={bodyColor}
        stroke="#1e3a8a"
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
        fill="#4169e1"
        stroke="#1e3a8a"
        strokeWidth="0.5"
      />
      
      {/* Necklace */}
      <path
        d={`M ${size * 0.55},${size * 0.38} Q ${size * 0.65},${size * 0.35} ${size * 0.75},${size * 0.38}`}
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Tail */}
      <path
        d={`M ${size * 0.15},${size * 0.5} L ${size * 0.05},${size * 0.3} L ${size * 0.05},${size * 0.7} Z`}
        fill={bodyColor}
        stroke="#1e3a8a"
        strokeWidth="1"
      />
    </g>
  );
}
