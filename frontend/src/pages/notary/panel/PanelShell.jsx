import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, CalendarClock, FileSignature,
  Users, Settings, LogOut, Search, Bell, ChevronsUpDown, ShieldCheck, HelpCircle, Store,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { escribania } from './mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { ReactComponent as BrandMark } from '@/assets/mercadoprop-escribanias-mark.svg';

const STORAGE_KEY = 'mp_notary_sidebar_collapsed';
const NAVY = '#2D3277';

const nav = [
  { to: '/escribanos/panel', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/escribanos/operaciones', label: 'Legajos', icon: FolderOpen, badge: '47' },
  { to: '/escribanos/agenda', label: 'Agenda de firmas', icon: CalendarClock },
  { to: '/escribanos/firmas', label: 'Firmas digitales', icon: FileSignature, soon: true },
  { to: '/escribanos/partes', label: 'Partes', icon: Users },
];

const secondary = [
  { to: '/escribanos/cumplimiento', label: 'Cumplimiento', icon: ShieldCheck, soon: true },
  { to: '/escribanos/ajustes', label: 'Ajustes', icon: Settings, soon: true },
  { to: '/escribanos/ayuda', label: 'Ayuda', icon: HelpCircle, soon: true },
];

const useCollapsed = () => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);
  return [collapsed, setCollapsed];
};

const BrandLogo = ({ collapsed }) => (
  <span className="flex items-center gap-2.5 min-w-0">
    <BrandMark className="h-9 w-9 shrink-0" data-testid="brand-mark" />
    {!collapsed && (
      <span className="leading-none min-w-0">
        <span
          className="block font-display font-bold text-[16px] tracking-tight lowercase truncate"
          style={{ color: NAVY }}
        >
          mercadoprop
        </span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] mt-0.5 text-[#666666] truncate">
          Escribanías
        </span>
      </span>
    )}
  </span>
);

const NavItem = ({ item, collapsed }) => {
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
      className={({ isActive }) =>
        `relative flex items-center rounded-lg text-[13.5px] font-medium transition-colors ${
          collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2'
        } ${
          isActive
            ? 'text-primary font-semibold'
            : 'text-foreground/75 hover:text-foreground hover:bg-muted'
        }`
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="w-[18px] h-[18px] shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-card text-muted-foreground border border-border font-semibold">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold grid place-items-center">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
  return link;
};

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { notaryLogout } = useApp();
  const width = collapsed ? 'w-[68px]' : 'w-64';

  return (
    <aside
      data-testid="notary-sidebar"
      data-collapsed={collapsed ? 'true' : 'false'}
      className={`hidden lg:flex flex-col ${width} shrink-0 h-screen sticky top-0 border-r border-border bg-card transition-[width] duration-200`}
    >
      <div className={`h-16 flex items-center border-b border-transparent ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <BrandLogo collapsed={collapsed} />
      </div>

      {!collapsed && (
        <button
          data-testid="sidebar-escribania-switcher"
          className="mx-3 mt-4 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground grid place-items-center text-xs font-bold">
            {escribania.iniciales}
          </div>
          <div className="flex-1 text-left leading-tight min-w-0">
            <div className="text-[13px] font-semibold text-foreground truncate">{escribania.nombre}</div>
            <div className="text-[11px] text-muted-foreground truncate">{escribania.registro}</div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      )}

      <nav className={`mt-3 space-y-0.5 ${collapsed ? 'px-1.5' : 'px-3'}`}>
        {!collapsed && (
          <div className="px-3 pb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Workspace
          </div>
        )}
        {nav.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <nav className={`mt-6 space-y-0.5 ${collapsed ? 'px-1.5' : 'px-3'}`}>
        {!collapsed && (
          <div className="px-3 pb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Sistema
          </div>
        )}
        {secondary.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={`mt-auto space-y-1 ${collapsed ? 'p-1.5' : 'p-3'}`}>
        {!collapsed ? (
          <>
            <Link
              to="/"
              data-testid="sidebar-link-marketplace"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Store className="w-4 h-4" /> Volver al marketplace
            </Link>
            <button
              data-testid="sidebar-logout"
              onClick={() => {
                notaryLogout();
                navigate('/escribanos');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium text-foreground/75 hover:text-destructive hover:bg-destructive-soft transition-colors"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              to="/"
              title="Volver al marketplace"
              data-testid="sidebar-link-marketplace"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Store className="w-4 h-4" />
            </Link>
            <button
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              data-testid="sidebar-logout"
              onClick={() => {
                notaryLogout();
                navigate('/escribanos');
              }}
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-foreground/75 hover:text-destructive hover:bg-destructive-soft transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          data-testid="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className={`mt-1 ${
            collapsed
              ? 'w-10 h-10 mx-auto'
              : 'w-full px-3 py-2 justify-start'
          } flex items-center gap-2 rounded-lg text-[12.5px] font-medium text-foreground/75 hover:text-foreground hover:bg-muted transition-colors`}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" /> Colapsar
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export const Topbar = ({ title, subtitle, actions, greeting = false }) => {
  const navigate = useNavigate();
  const { notaryLogout } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl overflow-hidden">
      <div className="h-16 px-9 flex items-center gap-4 border-b border-transparent">
        {greeting && (
          <div
            className="absolute left-0 right-0 -top-2.5 h-[120px] pointer-events-none blur-[6px] z-0"
            style={{
              background:
                'radial-gradient(60% 80% at 20% 40%, rgba(228,223,245,.55), transparent 70%), radial-gradient(55% 80% at 60% 30%, rgba(208,225,245,.5), transparent 70%), radial-gradient(50% 80% at 85% 60%, rgba(250,219,202,.45), transparent 70%)',
            }}
            aria-hidden="true"
          />
        )}
        <div className="flex-1 min-w-0 relative z-10">
          {title && (
            <h1
              className={`font-display leading-tight truncate ${
                greeting
                  ? 'font-semibold text-[22px] tracking-[-0.6px]'
                  : 'font-bold text-[18px] text-foreground'
              }`}
            >
              {title}
            </h1>
          )}
          {subtitle && <div className="text-[12px] text-muted-foreground truncate">{subtitle}</div>}
        </div>

        <div className="hidden md:flex relative z-10">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar legajo, parte o documento…"
            className="pl-9 w-[320px] h-[42px] rounded-[14px] bg-card border border-border shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus-visible:border-ring"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground">⌘K</kbd>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative z-10 w-[42px] h-[42px] rounded-[13px] bg-card border border-border shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-muted"
          aria-label="Notificaciones"
          data-testid="topbar-notif-btn"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive border-2 border-card" />
        </Button>

        <Button
          variant="ghost"
          className="relative z-10 h-[42px] gap-2 rounded-[13px] bg-card border border-border text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-muted"
          aria-label="Cerrar sesión"
          data-testid="topbar-logout-btn"
          onClick={() => {
            notaryLogout();
            navigate('/escribanos');
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
      {actions && <div className="px-6 lg:px-8 pb-3 -mt-1">{actions}</div>}
    </header>
  );
};

export const PanelShell = ({ children }) => {
  const [collapsed, setCollapsed] = useCollapsed();
  return (
    <div className="escribania-panel min-h-screen flex bg-background text-foreground">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};
