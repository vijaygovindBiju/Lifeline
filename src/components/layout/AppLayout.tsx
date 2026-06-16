import React from 'react';
import { LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LifeBuoy className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">LifeLine AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Emergency</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Resources</a>
              <a href="#" className="hover:text-blue-600 transition-colors">About</a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className={cn("flex-1 w-full max-w-5xl mx-auto px-4 py-8", className)}>
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 LifeLine AI. Focused on human-centered crisis recovery.
          </p>
        </div>
      </footer>
    </div>
  );
}
