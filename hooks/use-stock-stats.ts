'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CategoryId, StockLevel } from '@/lib/types';
import { getStockLevel } from '@/lib/types';
import type { StockCounts } from '@/components/ciervo/stock-lights';

function emptyCounts(): StockCounts {
  return { red: 0, yellow: 0, green: 0 };
}

export function useStockStats(category: CategoryId | null = null) {
  const [byGondola, setByGondola] = useState<Record<string, StockCounts>>({});
  const [byCategory, setByCategory] = useState<Record<CategoryId, StockCounts>>({
    vinos: emptyCounts(),
    destilados: emptyCounts(),
    heladeras: emptyCounts(),
  });

  const fetchStats = useCallback(async () => {
    let gondolaQuery = supabase.from('gondolas').select('id, category');
    if (category) gondolaQuery = gondolaQuery.eq('category', category);

    const [{ data: gondolas }, { data: cells }] = await Promise.all([
      gondolaQuery,
      supabase.from('cells').select('gondola_id, bottle_count'),
    ]);

    const categoryByGondola = new Map(
      (gondolas ?? []).map((gondola) => [gondola.id, gondola.category as CategoryId])
    );
    const nextByGondola: Record<string, StockCounts> = {};
    const nextByCategory: Record<CategoryId, StockCounts> = {
      vinos: emptyCounts(),
      destilados: emptyCounts(),
      heladeras: emptyCounts(),
    };

    for (const cell of cells ?? []) {
      const cellCategory = categoryByGondola.get(cell.gondola_id);
      if (!cellCategory) continue;
      const level: StockLevel = getStockLevel(cell.bottle_count);
      const gondolaCounts = nextByGondola[cell.gondola_id] ?? emptyCounts();
      gondolaCounts[level]++;
      nextByGondola[cell.gondola_id] = gondolaCounts;
      nextByCategory[cellCategory][level]++;
    }

    setByGondola(nextByGondola);
    setByCategory(nextByCategory);
  }, [category]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const channel = supabase
      .channel(`stock-stats-${category ?? 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cells' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gondolas' }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [category, fetchStats]);

  return { byGondola, byCategory };
}
