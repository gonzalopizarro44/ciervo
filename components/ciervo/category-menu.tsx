'use client';

import { Wine, Milk, Refrigerator, ChevronRight, LogOut } from 'lucide-react';
import { CATEGORIES, type CategoryId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { StockLights } from '@/components/ciervo/stock-lights';
import { useStockStats } from '@/hooks/use-stock-stats';
import { StockSearch } from '@/components/ciervo/stock-search';

interface CategoryMenuProps {
  onSelect: (id: CategoryId) => void;
  onLogout: () => void;
}

const ICONS = { Wine, Milk, Refrigerator };

export function CategoryMenu({ onSelect, onLogout }: CategoryMenuProps) {
  const { byCategory } = useStockStats();

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ciervo</h1>
          <p className="text-sm text-muted-foreground">Elegí una categoría</p>
        </div>
        <button
          onClick={onLogout}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Salir"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <StockSearch />

      <div className="flex flex-1 flex-col justify-center gap-4 pb-8">
        {CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon];
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                'group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5 text-left ring-1 ring-border/50 transition-all hover:ring-foreground/20 active:scale-[0.98]',
                cat.accent
              )}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background/60 ring-1 ring-border">
                <Icon className="h-7 w-7 text-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold leading-tight">{cat.label}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Ver góndolas</p>
              </div>
              <StockLights counts={byCategory[cat.id]} />
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
