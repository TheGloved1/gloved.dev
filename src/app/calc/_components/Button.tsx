'use client';
import React from 'react';

interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: string;
  disabled: boolean;
}

const btnBase =
  'flex aspect-square items-center justify-center rounded-xl border font-semibold transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none text-lg sm:text-xl md:text-2xl lg:text-3xl';

export function NumberButton({ onClick, children, disabled }: ButtonProps) {
  return (
    <button
      className={`${btnBase} brutal-shadow-sm border-white/10 bg-white/5 text-white hover:border-fuchsia-500/40 hover:bg-fuchsia-500/[0.06]`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function EqualsButton({ onClick, children, disabled }: ButtonProps) {
  return (
    <button
      className={`${btnBase} brutal-shadow border-fuchsia-500 bg-fuchsia-500 text-black hover:bg-fuchsia-400`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function OperatorButton({ onClick, children, disabled }: ButtonProps) {
  return (
    <button
      className={`${btnBase} brutal-shadow-sm border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 hover:border-fuchsia-500/60 hover:bg-fuchsia-500/20`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function ClearButton({ onClick, children, disabled }: ButtonProps) {
  return (
    <button
      className={`${btnBase} brutal-shadow-sm border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
