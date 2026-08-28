'use client';

import type { StockLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

export type StockCounts = Record<StockLevel, number>;

const LIGHTS: StockLevel[] = ['red', 'yellow', 'green'];

const LIGHT_STYLES: Record<StockLevel, { dot: string; text: string }> = {
  red: { dot: 'bg-red-500', text: 'text-red-300' },
  yellow: { dot: 'bg-amber-400', text: 'text-amber-300' },
  green: { dot: 'bg-emerald-500', text: 'text-emerald-300' },
};

export function StockLights({ counts }: { counts: StockCounts }) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-1" aria-label="Resumen de stock">
      {LIGHTS.map((level) => {
        const styles = LIGHT_STYLES[level];
        return (
          <div key={level} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full ring-1 ring-white/20', styles.dot)} />
            <span className={cn('min-w-[1rem] text-right text-xs font-bold tabular-nums', styles.text)}>
              {counts[level]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
