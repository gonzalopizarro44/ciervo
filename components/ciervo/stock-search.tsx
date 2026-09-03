'use client';

import { Search, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES, type CategoryId } from '@/lib/types';
import { useStockSearch } from '@/hooks/use-stock-search';
import type { StockSearchResult } from '@/hooks/use-stock-search';
import { cn } from '@/lib/utils';

interface StockSearchProps {
  category?: CategoryId;
  onSelect: (result: StockSearchResult) => void;
}

export function StockSearch({ category, onSelect }: StockSearchProps) {
  const [value, setValue] = useState('');
  const { results, loading, searched, search } = useStockSearch(category ?? null);

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    search(nextValue);
  };

  return (
    <div className="relative z-10">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          data-stock-search
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Buscar producto o góndola"
          aria-label="Buscar producto o góndola"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {searched && value.trim() && (
        <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No se encontraron coincidencias.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {results.map(({ cell, gondola }) => (
                <button
                  key={cell.id}
                  onClick={() => onSelect({ cell, gondola })}
                  className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent/50 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {cell.wine_name || 'Sin etiqueta'}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {gondola.name}{category ? '' : ` · ${CATEGORIES.find((item) => item.id === gondola.category)?.label}`}
                    </p>
                  </div>
                  <div className={cn(
                    'shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums',
                    cell.bottle_count === 0 ? 'bg-red-500/20 text-red-300' :
                      cell.bottle_count <= 3 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                  )}>
                    {cell.bottle_count} {cell.bottle_count === 1 ? 'botella' : 'botellas'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}