import { cn } from '@/lib/utils';

/** Insightlet logo: a 3x3 grid where one cell is filled with the accent color. */
export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      role="img"
      aria-label="Insightlet logo"
    >
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const accentCell = row === 0 && col === 2;
          return (
            <rect
              key={`${row}-${col}`}
              x={2 + col * 10}
              y={2 + row * 10}
              width={8}
              height={8}
              rx={2}
              className={accentCell ? 'fill-accent' : 'fill-current'}
              opacity={accentCell ? 1 : 0.3}
            />
          );
        }),
      )}
    </svg>
  );
}
