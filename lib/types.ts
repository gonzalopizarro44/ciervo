export type CategoryId = 'vinos' | 'destilados' | 'heladeras';

export interface Gondola {
  id: string;
  category: CategoryId;
  name: string;
  size_x: number;
  size_y: number;
  created_at: string;
}

export interface Cell {
  id: string;
  gondola_id: string;
  pos_x: number;
  pos_y: number;
  wine_name: string;
  bottle_count: number;
  updated_at: string;
}

export type StockLevel = 'green' | 'yellow' | 'red';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: 'Wine' | 'Milk' | 'Refrigerator';
  accent: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'vinos', label: 'Vinos y espumantes', icon: 'Wine', accent: 'from-rose-500/20 to-rose-600/10' },
  { id: 'destilados', label: 'Destilados', icon: 'Milk', accent: 'from-amber-500/20 to-amber-600/10' },
  { id: 'heladeras', label: 'Heladeras', icon: 'Refrigerator', accent: 'from-sky-500/20 to-sky-600/10' },
];

export const MASTER_PASSWORD = 'Ciervo2026';

export function getStockLevel(bottleCount: number): StockLevel {
  if (bottleCount === 0) return 'red';
  if (bottleCount <= 3) return 'yellow';
  return 'green';
}

export const STOCK_META: Record<StockLevel, { label: string; range: string; bg: string; bgSolid: string; ring: string; text: string; dot: string; border: string }> = {
  green: {
    label: 'Stock suficiente',
    range: '4 o más botellas',
    bg: 'bg-emerald-400/15 hover:bg-emerald-400/25',
    bgSolid: 'bg-emerald-500/60',
    ring: 'ring-emerald-400/30',
    text: 'text-emerald-200',
    dot: 'bg-emerald-400',
    border: 'border-emerald-400/20',
  },
  yellow: {
    label: 'Pronta revisión',
    range: 'de 3 a 1 botella',
    bg: 'bg-amber-400/20 hover:bg-amber-400/30',
    bgSolid: 'bg-amber-500/60',
    ring: 'ring-amber-400/30',
    text: 'text-amber-200',
    dot: 'bg-amber-400',
    border: 'border-amber-400/20',
  },
  red: {
    label: 'Reposición',
    range: '0 botellas',
    bg: 'bg-red-400/20 hover:bg-red-400/30',
    bgSolid: 'bg-red-500/60',
    ring: 'ring-red-400/30',
    text: 'text-red-200',
    dot: 'bg-red-400',
    border: 'border-red-400/20',
  },
};
