export function CornerDecorations({
  size = 6,
  className,
  hovering = false,
}: {
  size?: number;
  className?: string;
  hovering?: boolean;
}) {
  return (
    <>
      {/* Top-left corner */}
      <div
        className={`absolute left-0 top-0 h-${size} w-${size} border-l-2 border-t-2 border-fuchsia-500/50 transition-all duration-300 ease-out ${className || ''} ${
          hovering ? 'scale-150 border-fuchsia-700' : 'scale-100'
        }`}
        style={{
          transformOrigin: 'top left',
        }}
      />
      {/* Top-right corner */}
      <div
        className={`absolute right-0 top-0 h-${size} w-${size} border-r-2 border-t-2 border-fuchsia-500/50 transition-all duration-300 ease-out ${className || ''} ${
          hovering ? 'scale-150 border-fuchsia-700' : 'scale-100'
        }`}
        style={{
          transformOrigin: 'top right',
        }}
      />
      {/* Bottom-left corner */}
      <div
        className={`absolute bottom-0 left-0 h-${size} w-${size} border-b-2 border-l-2 border-fuchsia-500/50 transition-all duration-300 ease-out ${className || ''} ${
          hovering ? 'scale-150 border-fuchsia-700' : 'scale-100'
        }`}
        style={{
          transformOrigin: 'bottom left',
        }}
      />
      {/* Bottom-right corner */}
      <div
        className={`absolute bottom-0 right-0 h-${size} w-${size} border-b-2 border-r-2 border-fuchsia-500/50 transition-all duration-300 ease-out ${className || ''} ${
          hovering ? 'scale-150 border-fuchsia-700' : 'scale-100'
        }`}
        style={{
          transformOrigin: 'bottom right',
        }}
      />
    </>
  );
}
