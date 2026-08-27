'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Cell, CategoryId, Gondola } from '@/lib/types';

export function useGondolas(category: CategoryId | null) {
  const [gondolas, setGondolas] = useState<Gondola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGondolas = useCallback(async () => {
    if (!category) {
      setGondolas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('gondolas')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setGondolas(data as Gondola[]);
      setError(null);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchGondolas();
  }, [fetchGondolas]);

  // Realtime: refresh when any gondola in this category changes
  useEffect(() => {
    if (!category) return;
    const channel = supabase
      .channel(`gondolas-${category}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gondolas', filter: `category=eq.${category}` },
        () => { fetchGondolas(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [category, fetchGondolas]);

  const createGondola = useCallback(
    async (name: string, sizeX: number, sizeY: number) => {
      if (!category) return { error: 'Sin categoría' };
      const { data, error } = await supabase
        .from('gondolas')
        .insert({ category, name, size_x: sizeX, size_y: sizeY })
        .select()
        .single();
      if (error) return { error: error.message };
      const gondola = data as Gondola;
      const rows: Omit<Cell, 'id' | 'updated_at'>[] = [];
      for (let y = 0; y < sizeY; y++) {
        for (let x = 0; x < sizeX; x++) {
          rows.push({ gondola_id: gondola.id, pos_x: x, pos_y: y, wine_name: '', bottle_count: 6 });
        }
      }
      const { error: cellError } = await supabase.from('cells').insert(rows);
      if (cellError) return { error: cellError.message };
      await fetchGondolas();
      return { error: null };
    },
    [category, fetchGondolas]
  );

  const deleteGondola = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('gondolas').delete().eq('id', id);
      if (error) return { error: error.message };
      await fetchGondolas();
      return { error: null };
    },
    [fetchGondolas]
  );

  return { gondolas, loading, error, createGondola, deleteGondola, refetch: fetchGondolas };
}


