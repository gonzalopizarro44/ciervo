'use client';

import { useState } from 'react';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MASTER_PASSWORD } from '@/lib/types';

interface AuthScreenProps {
  onSuccess: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-600/20 to-amber-600/10 ring-1 ring-rose-500/30">
            <svg viewBox="0 0 24 24" className="h-11 w-11 text-rose-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.5 13.5c-1.5 2-4.5 2-6.5 0.5-2-1.5-5-1.5-6.5 0.5" />
              <path d="M3 8l6 6" />
              <path d="M9 14c-1.5 2-4.5 2-6 0" />
              <path d="M12 2v4" />
              <path d="M10 4h4" />
              <path d="M19 21l-3-6" />
              <path d="M16 15l-3 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ciervo</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gestión de góndolas de bebidas
          </p>
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit} className={shake ? 'animate-[shake_0.4s_ease]' : ''}>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">
              Contraseña maestra
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Ingresá la contraseña"
                autoComplete="off"
                autoFocus
                className={`h-12 pl-10 pr-11 text-base ${error ? 'border-red-500/60 ring-1 ring-red-500/30' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-400">Contraseña incorrecta. Intentá de nuevo.</p>
            )}
          </div>

          <Button type="submit" size="lg" className="mt-6 h-12 w-full text-base">
            Ingresar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          MVP interno · Ciervo 2026
        </p>
      </div>
    </div>
  );
}
