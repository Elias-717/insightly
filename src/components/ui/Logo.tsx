import { cn } from '@/lib/utils';

/** Insightlet logo: a 3x3 grid where one cell glows, with a spark mark. */
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
      <defs>
        <linearGradient id="insightlet-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      {/* 3x3 grid cells */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const glow = row === 0 && col === 2;
          return (
            <rect
              key={`${row}-${col}`}
              x={2 + col * 10}
              y={2 + row * 10}
              width={8}
              height={8}
              rx={2}
              fill={glow ? 'url(#insightlet-grad)' : 'currentColor'}
              opacity={glow ? 1 : 0.25}
            />
          );
        }),
      )}
      {/* spark mark */}
      <path
        d="M24 1.5l1.1 2.4 2.4 1.1-2.4 1.1L24 8.5l-1.1-2.4L20.5 5l2.4-1.1z"
        fill="url(#insightlet-grad)"
      />
    </svg>
  );
}
