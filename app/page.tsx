'use client';

import { useState, useEffect } from 'react';
import { AuthScreen } from '@/components/ciervo/auth-screen';
import { CategoryMenu } from '@/components/ciervo/category-menu';
import { GondolaList } from '@/components/ciervo/gondola-list';
import { GondolaGrid } from '@/components/ciervo/gondola-grid';
import type { CategoryId, Cell, Gondola } from '@/lib/types';
import type { StockSearchResult } from '@/hooks/use-stock-search';

type View =
  | { name: 'menu' }
  | { name: 'list'; category: CategoryId }
  | { name: 'grid'; gondola: Gondola; cell?: Cell };

const AUTH_KEY = 'ciervo-auth';

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<View>({ name: 'menu' });

  // Restore auth state from sessionStorage so a refresh doesn't kick you out
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(AUTH_KEY) === '1') {
      setAuthed(true);
    }
  }, []);

  const handleAuth = () => {
    sessionStorage.setItem(AUTH_KEY, '1');
    setAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setView({ name: 'menu' });
  };

  const handleSelectCell = ({ cell, gondola }: StockSearchResult) => {
    setView({ name: 'grid', gondola, cell });
  };

  if (!authed) {
    return <AuthScreen onSuccess={handleAuth} />;
  }

  if (view.name === 'menu') {
    return (
      <CategoryMenu
        onSelect={(cat) => setView({ name: 'list', category: cat })}
        onLogout={handleLogout}
        onSelectCell={handleSelectCell}
      />
    );
  }

  if (view.name === 'list') {
    return (
      <GondolaList
        category={view.category}
        onBack={() => setView({ name: 'menu' })}
        onOpenGondola={(g) => setView({ name: 'grid', gondola: g })}
        onSelectCell={handleSelectCell}
      />
    );
  }

  return (
    <GondolaGrid
      gondola={view.gondola}
      initialCell={view.cell}
      onBack={() => setView({ name: 'list', category: view.gondola.category })}
      onNavigate={(g) => setView({ name: 'grid', gondola: g })}
    />
  );
}
