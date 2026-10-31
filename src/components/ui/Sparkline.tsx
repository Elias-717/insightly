/** A tiny inline bar sparkline for the column list. */
export function Sparkline({ values, width = 80, height = 24 }: { values: number[]; width?: number; height?: number }) {
  const max = Math.max(1, ...values);
  const barWidth = values.length > 0 ? width / values.length : width;
  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      {values.map((v, i) => {
        const h = (v / max) * height;
        return (
          <rect
            key={i}
            x={i * barWidth}
            y={height - h}
            width={Math.max(1, barWidth - 1)}
            height={h}
            rx={1}
            className="fill-violet/70"
          />
        );
      })}
    </svg>
  );
}
