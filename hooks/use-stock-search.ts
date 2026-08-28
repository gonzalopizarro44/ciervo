'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CategoryId, Cell, Gondola } from '@/lib/types';

export interface StockSearchResult {
  cell: Cell;
  gondola: Gondola;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function useStockSearch(category: CategoryId | null = null) {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (value: string) => {
    const query = normalize(value.trim());
    if (!query) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    const gondolaQuery = supabase.from('gondolas').select('*');
    const { data: gondolaData } = category
      ? await gondolaQuery.eq('category', category)
      : await gondolaQuery;
    const gondolas = (gondolaData ?? []) as Gondola[];
    const gondolaById = new Map(gondolas.map((gondola) => [gondola.id, gondola]));

    const gondolaIds = gondolas.map((gondola) => gondola.id);
    if (gondolaIds.length === 0) {
      setResults([]);
      setSearched(true);
      setLoading(false);
      return;
    }

    const { data: cellData } = await supabase
      .from('cells')
      .select('*')
      .in('gondola_id', gondolaIds);
    const cells = (cellData ?? []) as Cell[];

    setResults(
      cells
        .filter((cell) => {
          const gondola = gondolaById.get(cell.gondola_id);
          return Boolean(
            gondola &&
            (normalize(cell.wine_name).includes(query) || normalize(gondola.name).includes(query))
          );
        })
        .map((cell) => ({ cell, gondola: gondolaById.get(cell.gondola_id)! }))
    );
    setSearched(true);
    setLoading(false);
  }, [category]);

  return { results, loading, searched, search };
}
