'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Minus, Plus, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Gondola, Cell, StockLevel } from '@/lib/types';
import { getStockLevel, STOCK_META } from '@/lib/types';
import { useCells } from '@/hooks/use-cells';
import { useGondolas } from '@/hooks/use-gondolas';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GondolaGridProps {
  gondola: Gondola;
  onBack: () => void;
  onNavigate: (gondola: Gondola) => void;
}

export function GondolaGrid({ gondola, onBack, onNavigate }: GondolaGridProps) {
  const { cells, loading, updateCell } = useCells(gondola.id);
  const { gondolas } = useGondolas(gondola.category);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [filterLevel, setFilterLevel] = useState<StockLevel | null>(null);

  const currentIndex = gondolas.findIndex((item) => item.id === gondola.id);
  const previousGondola = currentIndex > 0 ? gondolas[currentIndex - 1] : null;
  const nextGondola = currentIndex >= 0 && currentIndex < gondolas.length - 1 ? gondolas[currentIndex + 1] : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      if (event.key === 'ArrowLeft' && previousGondola) {
        event.preventDefault();
        onNavigate(previousGondola);
      }

      if (event.key === 'ArrowRight' && nextGondola) {
        event.preventDefault();
        onNavigate(nextGondola);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextGondola, onNavigate, previousGondola]);

  // Build a 2D grid: grid[y][x] = Cell | null
  const grid = useMemo(() => {
    const rows: (Cell | null)[][] = [];
    for (let y = 0; y < gondola.size_y; y++) {
      const row: (Cell | null)[] = [];
      for (let x = 0; x < gondola.size_x; x++) {
        const cell = cells.find((c) => c.pos_x === x && c.pos_y === y);
        row.push(cell ?? null);
      }
      rows.push(row);
    }
    return rows;
  }, [cells, gondola.size_x, gondola.size_y]);

  // Summary stats
  const stats = useMemo(() => {
    let green = 0, yellow = 0, red = 0, total = 0;
    for (const c of cells) {
      total++;
      const level = getStockLevel(c.bottle_count);
      if (level === 'green') green++;
      else if (level === 'yellow') yellow++;
      else red++;
    }
    return { green, yellow, red, total };
  }, [cells]);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-background/90 px-3 py-3 backdrop-blur-md">
        <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => previousGondola && onNavigate(previousGondola)}
            disabled={!previousGondola}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Góndola anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h1 className="truncate text-center text-lg font-black tracking-tight text-foreground">{gondola.name}</h1>

          <button
            onClick={() => nextGondola && onNavigate(nextGondola)}
            disabled={!nextGondola}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Góndola siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Gondola grid — fixed-size cells, scrollable if needed */}
      <div className="flex-1 overflow-auto px-3 py-3">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {grid.map((row, y) => (
              <div
                key={y}
                className="flex gap-1.5"
              >
                {row.map((cell, x) => {
                  if (!cell) {
                    return (
                      <div
                        key={`${x}-${y}`}
                        className="flex h-24 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border/40 text-[10px] text-muted-foreground/30"
                      >
                        —
                      </div>
                    );
                  }
                  const level = getStockLevel(cell.bottle_count);
                  const meta = STOCK_META[level];
                  return (
                    <button
                      key={cell.id}
                      onClick={() => setEditingCell(cell)}
                      className={cn(
                        'flex h-24 w-14 shrink-0 flex-col items-center justify-center rounded-lg border p-1 text-center transition-all active:scale-95',
                        meta.bgSolid,
                        'border-white',
                        'hover:brightness-110'
                      )}
                    >
                      <span className="w-full truncate text-[9px] font-medium leading-tight text-white">
                        {cell.wine_name || '—'}
                      </span>
                      <span className="mt-0.5 text-sm font-bold text-white">
                        {cell.bottle_count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter buttons */}
      <footer className="shrink-0 border-t border-border bg-card/60 px-3 py-2.5">
        <div className="flex gap-2">
          {(['green', 'yellow', 'red'] as StockLevel[]).map((lvl) => {
            const m = STOCK_META[lvl];
            const count = lvl === 'green' ? stats.green : lvl === 'yellow' ? stats.yellow : stats.red;
            const isActive = filterLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setFilterLevel(isActive ? null : lvl)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-xl border px-2 py-2 transition-all active:scale-95',
                  isActive ? cn(m.bg, m.ring, 'border-transparent') : 'border-border bg-muted/40'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn('h-2.5 w-2.5 rounded-full', m.dot)} />
                  <span className="text-[11px] font-bold text-foreground">{count}</span>
                </div>
                <span className="text-[9px] font-medium leading-tight text-foreground text-center">
                  {m.label}
                </span>
                <span className="text-[8px] leading-tight text-muted-foreground text-center">
                  {m.range}
                </span>
              </button>
            );
          })}
        </div>
      </footer>

      {/* Filtered list panel */}
      {filterLevel && (
        <FilteredListPanel
          level={filterLevel}
          cells={cells
            .filter((c) => getStockLevel(c.bottle_count) === filterLevel)
            .sort((a, b) => a.bottle_count - b.bottle_count)}
          onClose={() => setFilterLevel(null)}
          onCellClick={(cell) => {
            setFilterLevel(null);
            setEditingCell(cell);
          }}
        />
      )}

      {/* Cell edit dialog */}
      <CellEditDialog
        cell={editingCell}
        onClose={() => setEditingCell(null)}
        onSave={async (cellId, updates) => {
          const { error } = await updateCell(cellId, updates);
          if (error) {
            toast.error('No se pudo guardar: ' + error);
          } else {
            toast.success('Posición actualizada');
          }
          setEditingCell(null);
        }}
      />
    </div>
  );
}

function FilteredListPanel({
  level,
  cells,
  onClose,
  onCellClick,
}: {
  level: StockLevel;
  cells: Cell[];
  onClose: () => void;
  onCellClick: (cell: Cell) => void;
}) {
  const meta = STOCK_META[level];
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="flex max-h-[70dvh] w-full flex-col rounded-t-2xl border-t border-border bg-background pb-safe pb-4 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className={cn('h-3 w-3 rounded-full', meta.dot)} />
            <div>
              <h2 className="text-base font-bold leading-tight">{meta.label}</h2>
              <p className="text-[11px] text-muted-foreground">
                {meta.range} · {cells.length} {cells.length === 1 ? 'posición' : 'posiciones'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cells.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay posiciones en este estado.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {cells.map((cell) => (
                <button
                  key={cell.id}
                  onClick={() => onCellClick(cell)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-95',
                    meta.bg,
                    meta.border
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold',
                    meta.bgSolid,
                    'text-foreground'
                  )}>
                    {cell.bottle_count}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">
                      {cell.wine_name || 'Sin etiqueta'}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Columna {cell.pos_x + 1} · Estante {cell.pos_y + 1}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CellEditDialog({
  cell,
  onClose,
  onSave,
}: {
  cell: Cell | null;
  onClose: () => void;
  onSave: (cellId: string, updates: Partial<Pick<Cell, 'wine_name' | 'bottle_count'>>) => Promise<void>;
}) {
  const [wineName, setWineName] = useState('');
  const [bottleCount, setBottleCount] = useState(6);

  useEffect(() => {
    if (cell) {
      setWineName(cell.wine_name);
      setBottleCount(cell.bottle_count);
    }
  }, [cell]);

  const level = cell ? getStockLevel(bottleCount) : 'green';
  const meta = STOCK_META[level];

  const adjustCount = (delta: number) => {
    setBottleCount((c) => Math.max(0, Math.min(99, c + delta)));
  };

  const handleSave = () => {
    if (!cell) return;
    onSave(cell.id, { wine_name: wineName.trim(), bottle_count: bottleCount });
  };

  return (
    <Dialog open={!!cell} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="mx-4 max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar posición</DialogTitle>
          <DialogDescription>
            Posición ({(cell?.pos_x ?? 0) + 1}, {(cell?.pos_y ?? 0) + 1})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="wine-name">Etiqueta / nombre</Label>
            <Input
              id="wine-name"
              value={wineName}
              onChange={(e) => setWineName(e.target.value)}
              placeholder="Ej: Malbec Reserva"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Botellas en estante</Label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustCount(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition-colors hover:bg-accent active:scale-95"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className={cn(
                'flex h-12 flex-1 items-center justify-center rounded-xl border border-border text-2xl font-bold transition-colors',
                meta.bg, meta.text
              )}>
                {bottleCount}
              </div>
              <button
                onClick={() => adjustCount(1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition-colors hover:bg-accent active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estado rápido</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['green', 'yellow', 'red'] as StockLevel[]).map((lvl) => {
                const m = STOCK_META[lvl];
                const isActive = level === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setBottleCount(lvl === 'green' ? 6 : lvl === 'yellow' ? 2 : 0)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition-all active:scale-95',
                      isActive ? cn(m.bg, m.ring, 'border-transparent') : 'border-border bg-muted/50'
                    )}
                  >
                    <span className={cn('h-3 w-3 rounded-full', m.dot)} />
                    <span className="text-[10px] font-medium leading-tight text-foreground">
                      {lvl === 'green' ? 'Suficiente' : lvl === 'yellow' ? 'Revisar' : 'Reposición'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onClose} className="h-11">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="h-11">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
