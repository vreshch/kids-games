import { qrShape } from '@/lib/book-qr';

const QUIET = 3;

export function QrCode({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const { size, path } = qrShape(text);
  const box = size + QUIET * 2;
  return (
    <svg
      viewBox={`${-QUIET} ${-QUIET} ${box} ${box}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect x={-QUIET} y={-QUIET} width={box} height={box} fill="#ffffff" />
      <path d={path} fill="#111827" />
    </svg>
  );
}
