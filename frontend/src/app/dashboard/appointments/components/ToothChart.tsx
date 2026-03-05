'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TOOTH_SPOTS } from '../lib/tooth-chart-spots';

/** Adult tooth chart from CodePen (johnstuif/pen/JdOXWa). Universal numbering 1–32, DFM labels, clickable spots. */
const VIEWBOX = '0 0 450 700';

/** Status colors (from design): new, has treatment before, pending */
const STATUS_COLORS = {
  new: { fill: '#EC4899', stroke: '#DB2777' },
  has_treatment: { fill: '#9598FF', stroke: '#6366F1' },
  pending: { fill: '#FF956C', stroke: '#EA580C' },
} as const;
const TOOTH_BORDER_DEFAULT = '#667E9D';
const TOOTH_NUMBER_DEFAULT = '#A1A9B4';

// Tooth number labels (lbl32..lbl1) and DFM labels – from CodePen
const TOOTH_LABELS = [
  [97.98, 402.14], [94.74, 449.17], [106, 495.54], [118, 538.67], [136.41, 573.51], [157.33, 603.82], [179.33, 623.82], [204.67, 628.48],
  [231.33, 628.15], [256.33, 619.15], [276.33, 602.48], [286.67, 573.15], [303.63, 538.67], [322.98, 495.54], [325.13, 449.17], [324, 402.14],
  [312.85, 324.1], [315.33, 275.33], [311.33, 236], [300.33, 200.67], [286.67, 172], [270.23, 142.44], [247.51, 118.97], [227.84, 112.97],
  [200.18, 112.97], [170.51, 117.64], [148.67, 134.17], [131.36, 164.83], [119.39, 195.64], [103.86, 234.44], [96.25, 276], [93.98, 324.77],
];
const DFM_LABELS = [
  [5, 386.38], [1, 449.74], [9.67, 513.59], [36.33, 578.26], [74.33, 626.92], [109, 660.92], [145.67, 678.26], [191.67, 687.59],
  [233, 687.59], [283, 673.59], [329.67, 644.92], [359.67, 604.92], [390.33, 558.26], [412.64, 494.25], [416.16, 449.74], [409.98, 386.38],
  [410.54, 325.85], [414, 251.85], [408.77, 211.71], [386.71, 165.74], [360.59, 123.58], [344.01, 89.59], [301.05, 54.16], [229.23, 29.29],
  [172.74, 30.33], [114.33, 51.55], [72, 91.21], [48.54, 127.87], [27.21, 167.01], [8.8, 212.33], [3.25, 260.11], [5, 338.44],
];

export type ToothStatus = 'new' | 'has_treatment' | 'pending';

type Props = {
  selectedTeeth: number[];
  onSelectionChange: (teeth: number[]) => void;
  /** Optional per-tooth status for legend colors (new / has treatment before / pending). If not set, selected teeth show as pending. */
  toothStatus?: Partial<Record<number, ToothStatus>>;
  /** When set, clicking a tooth calls this instead of toggling selection (view-only history mode). */
  onToothClick?: (toothNumber: number) => void;
  /** Hide the "Selected: ..." hint below the legend (e.g. for view-only mode). */
  hideSelectedHint?: boolean;
  /** Show only "Has treatment before" and "Pending treatment" in the legend (for medical history view). */
  legendOnlyHistory?: boolean;
  className?: string;
};

export function ToothChart({
  selectedTeeth,
  onSelectionChange,
  toothStatus,
  onToothClick,
  hideSelectedHint,
  legendOnlyHistory,
  className,
}: Props) {
  const handleClick = (key: string) => {
    const n = parseInt(key, 10);
    if (onToothClick) {
      onToothClick(n);
    } else {
      if (selectedTeeth.includes(n)) {
        onSelectionChange(selectedTeeth.filter((t) => t !== n));
      } else {
        onSelectionChange([...selectedTeeth, n].sort((a, b) => a - b));
      }
    }
  };

  return (
    <div className={cn('w-full h-full min-w-0 min-h-0 flex flex-col tooth-chart', className)}>
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-w-full max-h-full border border-border rounded-lg bg-card tooth-chart-svg block"
        >
        {/* Tooth number labels (32 → 1) – grey default, dark when tooth has status */}
        <g id="toothLabels">
          {TOOTH_LABELS.map(([x, y], i) => {
            const num = 32 - i;
            const hasStatus = toothStatus?.[num] !== undefined || selectedTeeth.includes(num);
            const numberFill = hasStatus ? 'hsl(var(--foreground))' : TOOTH_NUMBER_DEFAULT;
            return (
              <text
                key={num}
                id={`lbl${num}`}
                transform={`matrix(1 0 0 1 ${x} ${y})`}
                fontFamily="Avenir, system-ui, sans-serif"
                fontSize="21px"
                fontWeight="700"
                fill={numberFill}
              >
                {num}
              </text>
            );
          })}
        </g>
        {/* DFM labels */}
        <g id="dmftLabels" fill="hsl(var(--muted-foreground))">
          {DFM_LABELS.map(([x, y], i) => (
            <text
              key={i}
              id={`txtTooth${32 - i}`}
              transform={`matrix(1 0 0 1 ${x} ${y})`}
              fontFamily="system-ui, sans-serif"
              fontSize="16px"
            >
              DFM
            </text>
          ))}
        </g>
        {/* Clickable tooth spots – status colors or default (blue-grey border) */}
        <g id="Spots">
          {TOOTH_SPOTS.map((spot) => {
            const num = parseInt(spot.key, 10);
            const selected = selectedTeeth.includes(num);
            const status = toothStatus?.[num] ?? (selected ? 'pending' : null);
            const colors = status ? STATUS_COLORS[status] : null;
            const fill = colors ? colors.fill : 'hsl(var(--muted))';
            const stroke = colors ? colors.stroke : TOOTH_BORDER_DEFAULT;
            const common = {
              fill,
              stroke,
              strokeWidth: status ? 1.5 : 1,
              style: { transition: 'fill 0.2s, stroke 0.2s' },
              className: 'cursor-pointer',
              onClick: () => handleClick(spot.key),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(spot.key);
                }
              },
              role: 'button' as const,
              tabIndex: 0,
              'aria-pressed': !!status,
              'aria-label': `Tooth ${spot.key}${status ? `, ${status}` : ''}`,
              'data-key': spot.key,
            };
            if (spot.type === 'polygon') {
              return (
                <polygon
                  key={spot.id}
                  id={spot.id}
                  points={spot.points}
                  {...common}
                />
              );
            }
            return (
              <path key={spot.id} id={spot.id} d={spot.d} {...common} />
            );
          })}
        </g>
        </svg>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 flex-shrink-0 text-sm text-foreground">
        {!legendOnlyHistory && (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: STATUS_COLORS.new.fill }} aria-hidden />
            New treatment
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: STATUS_COLORS.has_treatment.fill }} aria-hidden />
          Has treatment before
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: STATUS_COLORS.pending.fill }} aria-hidden />
          Pending treatment
        </span>
      </div>
      {!hideSelectedHint && (
        <p className="text-xs text-muted-foreground text-center mt-2 break-words flex-shrink-0">
          Universal numbering (1–32). Click a tooth to select involvement. Selected:{' '}
          {selectedTeeth.length > 0 ? selectedTeeth.join(', ') : 'None'}
        </p>
      )}
    </div>
  );
}
