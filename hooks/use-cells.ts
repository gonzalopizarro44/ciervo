'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Cell } from '@/lib/types';

export function useCells(gondolaId: string | null) {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCells = useCallback(async () => {
    if (!gondolaId) {
      setCells([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('cells')
      .select('*')
      .eq('gondola_id', gondolaId)
      .order('pos_y', { ascending: true })
      .order('pos_x', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setCells(data as Cell[]);
      setError(null);
    }
    setLoading(false);
  }, [gondolaId]);

  useEffect(() => {
    fetchCells();
  }, [fetchCells]);

  // Realtime: refresh when any cell in this gondola changes (sync between devices)
  useEffect(() => {
    if (!gondolaId) return;
    const channel = supabase
      .channel(`cells-${gondolaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cells', filter: `gondola_id=eq.${gondolaId}` },
        () => { fetchCells(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gondolaId, fetchCells]);

  const updateCell = useCallback(
    async (cellId: string, updates: Partial<Pick<Cell, 'wine_name' | 'bottle_count'>>) => {
      const { error } = await supabase
        .from('cells')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', cellId);
      if (error) return { error: error.message };
      // Optimistic local update
      setCells((prev) =>
        prev.map((c) => (c.id === cellId ? { ...c, ...updates } : c))
      );
      return { error: null };
    },
    []
  );

  return { cells, loading, error, updateCell, refetch: fetchCells };
}
