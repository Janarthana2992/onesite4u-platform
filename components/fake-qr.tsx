"use client";

import { useMemo } from "react";

/** Stylised QR-code UI (visual demo only — not scannable). */
export function FakeQr({ size = 220, seed = 7 }: { size?: number; seed?: number }) {
  const n = 29;

  const cells = useMemo(() => {
    let s = seed >>> 0;
    const rnd = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const grid: boolean[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => rnd() > 0.55),
    );
    const finder = (ox: number, oy: number) => {
      for (let y = -1; y < 8; y++) {
        for (let x = -1; x < 8; x++) {
          const gy = oy + y;
          const gx = ox + x;
          if (gy < 0 || gx < 0 || gy >= n || gx >= n) continue;
          if (y === -1 || x === -1 || y === 7 || x === 7) {
            grid[gy][gx] = false;
            continue;
          }
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[gy][gx] = edge || inner;
        }
      }
    };
    finder(0, 0);
    finder(n - 7, 0);
    finder(0, n - 7);
    for (let i = 8; i < n - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }
    const c = Math.floor(n / 2);
    for (let y = c - 3; y <= c + 3; y++) for (let x = c - 3; x <= c + 3; x++) grid[y][x] = false;
    return grid;
  }, [seed]);

  const cell = size / n;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR code">
      <rect width={size} height={size} fill="white" />
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell + 0.3}
              height={cell + 0.3}
              fill="#111827"
            />
          ) : null,
        ),
      )}
      <rect x={size / 2 - 22} y={size / 2 - 22} width={44} height={44} rx={10} fill="#4f46e5" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill="white"
        fontFamily="system-ui, sans-serif"
      >
        1S
      </text>
    </svg>
  );
}
