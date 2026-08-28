'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Grid3x3, Trash2, Loader2, Milk, Refrigerator, Wine } from 'lucide-react';
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
import { CATEGORIES, type CategoryId, type Gondola } from '@/lib/types';
import { useGondolas } from '@/hooks/use-gondolas';
import { StockLights } from '@/components/ciervo/stock-lights';
import { useStockStats } from '@/hooks/use-stock-stats';
import { StockSearch } from '@/components/ciervo/stock-search';
import { toast } from 'sonner';

interface GondolaListProps {
  category: CategoryId;
  onBack: () => void;
  onOpenGondola: (g: Gondola) => void;
}

const ICONS = { Wine, Milk, Refrigerator };

export function GondolaList({ category, onBack, onOpenGondola }: GondolaListProps) {
  const { gondolas, loading, createGondola, deleteGondola } = useGondolas(category);
  const { byGondola } = useStockStats(category);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Gondola | null>(null);

  const cat = CATEGORIES.find((c) => c.id === category)!;
  const Icon = ICONS[cat.icon];

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 py-6">
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold leading-tight">{cat.label}</h1>
            <p className="text-xs text-muted-foreground">
              {gondolas.length} {gondolas.length === 1 ? 'góndola' : 'góndolas'}
            </p>
          </div>
        </div>
      </header>

      <div className="mb-5">
        <StockSearch category={category} />
      </div>

      <Button
        onClick={() => setCreateOpen(true)}
        size="lg"
        className="mb-5 h-12 w-full text-base"
      >
        <Plus className="mr-2 h-5 w-5" />
        Crear nueva góndola
      </Button>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : gondolas.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Grid3x3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No hay góndolas todavía.<br />Creá la primera con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-6">
          {gondolas.map((g) => (
            <div
              key={g.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <button
                onClick={() => onOpenGondola(g)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Grid3x3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight">{g.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {g.size_x} × {g.size_y} · {g.size_x * g.size_y} posiciones
                  </p>
                </div>
              </button>
              <StockLights counts={byGondola[g.id] ?? { red: 0, yellow: 0, green: 0 }} />
              <button
                onClick={() => setConfirmDelete(g)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                aria-label="Eliminar góndola"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <CreateGondolaDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createGondola}
      />

      <DeleteConfirmDialog
        gondola={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          const { error } = await deleteGondola(confirmDelete.id);
          if (error) {
            toast.error('No se pudo eliminar: ' + error);
          } else {
            toast.success('Góndola eliminada');
          }
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}

function CreateGondolaDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (name: string, sizeX: number, sizeY: number) => Promise<{ error: string | null }>;
}) {
  const [name, setName] = useState('');
  const [sizeX, setSizeX] = useState('11');
  const [sizeY, setSizeY] = useState('5');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sizeX || !sizeY) return;
    setSubmitting(true);
    const { error } = await onCreate(name.trim(), parseInt(sizeX, 10), parseInt(sizeY, 10));
    setSubmitting(false);
    if (error) {
      toast.error('No se pudo crear: ' + error);
    } else {
      toast.success('Góndola creada');
      setName('');
      setSizeX('11');
      setSizeY('5');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Nueva góndola</DialogTitle>
          <DialogDescription>Definí el nombre y las medidas del estante.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="g-name">Nombre</Label>
            <Input
              id="g-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Malbec 1"
              autoFocus
              className="h-12 text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="g-x">Ancho (columnas)</Label>
              <Input
                id="g-x"
                type="number"
                min={1}
                max={30}
                value={sizeX}
                onChange={(e) => setSizeX(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-y">Alto (estantes)</Label>
              <Input
                id="g-y"
                type="number"
                min={1}
                max={20}
                value={sizeY}
                onChange={(e) => setSizeY(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-11">
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()} className="h-11">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({
  gondola,
  onCancel,
  onConfirm,
}: {
  gondola: Gondola | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!gondola} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="mx-4 max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Eliminar góndola</DialogTitle>
          <DialogDescription>
            ¿Seguro que querés eliminar <strong>{gondola?.name}</strong>? Se borrarán todas
            sus posiciones. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onCancel} className="h-11">Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} className="h-11">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
