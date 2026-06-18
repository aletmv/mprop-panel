import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, CalendarClock, FileSignature,
  Users, Settings, LogOut, Search, Bell, ChevronsUpDown, ShieldCheck, HelpCircle
} from 'lucide-react';
import { escribania } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const nav = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/operaciones', label: 'Operaciones', icon: FolderOpen, badge: '47' },
  { to: '/agenda', label: 'Agenda de firmas', icon: CalendarClock },
  { to: '/firmas', label: 'Firmas digitales', icon: FileSignature, soon: true },
  { to: '/clientes', label: 'Partes', icon: Users, soon: true },
];

const secondary = [
  { to: '/cumplimiento', label: 'Cumplimiento', icon: ShieldCheck, soon: true },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, soon: true },
  { to: '/ayuda', label: 'Ayuda', icon: HelpCircle, soon: true },
];

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-card">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display font-bold">
          mp
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold text-[15px] text-foreground">mercadoprop</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Escribanías</div>
        </div>
      </div>

      {/* Escribanía switcher */}
      <button className="mx-3 mt-4 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground grid place-items-center text-xs font-bold">
          {escribania.iniciales}
        </div>
        <div className="flex-1 text-left leading-tight min-w-0">
          <div className="text-[13px] font-semibold text-foreground truncate">{escribania.nombre}</div>
          <div className="text-[11px] text-muted-foreground truncate">{escribania.registro}</div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {/* Nav primary */}
      <nav className="px-3 mt-3 space-y-0.5">
        <div className="px-3 pb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Workspace</div>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/75 hover:text-foreground hover:bg-muted'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-card text-muted-foreground border border-border font-semibold">
                {item.badge}
              </span>
            )}
            {item.soon && (
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Pronto</span>
            )}
          </NavLink>
        ))}
      </nav>

      <nav className="px-3 mt-6 space-y-0.5">
        <div className="px-3 pb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Sistema</div>
        {secondary.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-foreground/75 hover:text-foreground hover:bg-muted'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.soon && <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Pronto</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="mt-auto m-3 p-3 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-accent/20 blur-xl" />
        <div className="relative">
          <Badge className="bg-accent text-accent-foreground hover:bg-accent text-[10px] mb-2">Nuevo</Badge>
          <div className="text-[13px] font-semibold leading-tight">Marketplace de servicios</div>
          <div className="text-[11px] opacity-80 mt-1 leading-snug">Gestoría, tasaciones y certificaciones en un solo lugar.</div>
          <button className="mt-2.5 text-[11px] font-semibold underline underline-offset-2">Explorar →</button>
        </div>
      </div>
    </aside>
  );
};

export const Topbar = ({ title, subtitle, actions }) => {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="h-16 px-6 lg:px-8 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          {title && <h1 className="font-display font-bold text-[18px] text-foreground leading-tight truncate">{title}</h1>}
          {subtitle && <div className="text-[12px] text-muted-foreground truncate">{subtitle}</div>}
        </div>

        <div className="hidden md:flex relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar operación, parte o documento…"
            className="pl-9 w-[320px] h-9 bg-muted border-transparent focus-visible:bg-card focus-visible:border-border"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground">⌘K</kbd>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
        </Button>

        <Button variant="ghost" size="sm" className="gap-2">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
      {actions && (
        <div className="px-6 lg:px-8 pb-3 -mt-1">{actions}</div>
      )}
    </header>
  );
};

export const Shell = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};
