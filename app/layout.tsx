import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ciervo · Gestión de góndolas',
  description: 'Sistema de semáforos para monitorear la reposición de góndolas de bebidas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="mx-auto min-h-[100dvh] max-w-md bg-background text-foreground">
          {children}
        </div>
        <SonnerToaster position="top-center" />
      </body>
    </html>
  );
}
