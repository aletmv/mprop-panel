import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PanelShell, Topbar } from './PanelShell';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  FolderOpen, PenLine, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight,
  CalendarDays, ChevronRight, Sparkles, FileText, ShieldAlert,
} from 'lucide-react';
import {
  kpis, alertas, proximasFirmas, cargaMensual, estadoLabel,
} from './mockData';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useApp } from '@/context/AppContext';

const iconMap = { folder: FolderOpen, pen: PenLine, alert: AlertTriangle, clock: Clock };

const KpiCard = ({ kpi }) => {
  const Icon = iconMap[kpi.icon];
  const positive = kpi.trend === 'up';
  return (
    <div
      data-testid={`kpi-${kpi.id}`}
      className="card-surface p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg bg-muted grid place-items-center">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
            positive ? 'text-success' : 'text-muted-foreground'
          }`}
        >
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {kpi.delta}
        </span>
      </div>
      <div>
        <div className="font-display font-bold text-[28px] text-foreground leading-none num-tabular">{kpi.value}</div>
        <div className="text-[12px] text-muted-foreground mt-1">{kpi.label}</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { notarySession } = useApp();
  if (!notarySession) return <Navigate to="/escribanos" replace />;

  return (
    <PanelShell>
      <Topbar
        title="Buen día, María Inés"
        subtitle="Tenés 4 alertas críticas y 12 firmas en los próximos 7 días."
      />
      <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6" data-testid="notary-dashboard">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
        </section>

        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="card-surface p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-[18px] text-foreground">Volumen operativo</h2>
                  <div className="text-[12px] text-muted-foreground">Aperturas y firmas concretadas — últimos 6 meses</div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary" />Aperturas
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-accent" />Firmas
                  </span>
                </div>
              </div>
              <div className="h-[220px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cargaMensual}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px hsl(222 45% 17% / 0.08)',
                      }}
                    />
                    <Area type="monotone" dataKey="aperturas" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="firmas" stroke="hsl(var(--accent))" fill="url(#g2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-surface p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-[18px] text-foreground flex items-center gap-2">
                    Alertas que requieren tu atención
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-destructive text-destructive-foreground">
                      3
                    </span>
                  </h2>
                  <div className="text-[12px] text-muted-foreground">Ordenadas por prioridad e impacto sobre la firma</div>
                </div>
                <Link to="/escribanos/operaciones" className="text-[12px] font-semibold text-primary hover:underline">
                  Ver todas →
                </Link>
              </div>
              <div className="space-y-2.5">
                {alertas.map((a) => {
                  const colorMap = {
                    critica: { bg: 'bg-destructive-soft', border: 'border-destructive/15', text: 'text-destructive', icon: ShieldAlert, badge: 'destructive', label: 'Crítica' },
                    media: { bg: 'bg-warning-soft', border: 'border-warning/20', text: 'text-warning-foreground', icon: AlertTriangle, badge: 'warning', label: 'Media' },
                    info: { bg: 'bg-info-soft', border: 'border-info/20', text: 'text-info', icon: FileText, badge: 'info', label: 'Info' },
                  }[a.nivel];
                  const Icon = colorMap.icon;
                  return (
                    <Link
                      to={`/escribanos/operaciones/${a.operacionId}`}
                      key={a.id}
                      data-testid={`alert-${a.id}`}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border ${colorMap.bg} ${colorMap.border} hover:shadow-sm transition-shadow group`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-card grid place-items-center shrink-0 border ${colorMap.border}`}>
                        <Icon className={`w-4 h-4 ${colorMap.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-foreground">{a.titulo}</span>
                          <StatusBadge variant={colorMap.badge} dot={false}>{colorMap.label}</StatusBadge>
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{a.descripcion}</div>
                        <div className="text-[11px] text-muted-foreground mt-1.5">
                          <span className="font-mono">{a.operacionId}</span> · {a.responsable}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="rounded-2xl p-5 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-accent/25 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-80">Resumen del día</span>
                </div>
                <div className="font-display font-bold text-[16px] leading-snug">
                  3 legajos pueden pasar a pre-cierre esta semana
                </div>
                <div className="text-[12px] opacity-80 mt-2 leading-snug">
                  Documentación completa. Te sugerimos programar firma tentativa entre el 26 y 28 de junio.
                </div>
                <button className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card/15 hover:bg-card/25 text-[12px] font-semibold backdrop-blur-sm transition-colors">
                  Ver sugerencias <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="card-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-[15px] text-foreground">Próximas firmas</h3>
                </div>
                <Link to="/escribanos/agenda" className="text-[11px] font-semibold text-primary hover:underline">
                  Agenda
                </Link>
              </div>
              <div className="space-y-2">
                {proximasFirmas.slice(0, 5).map((f) => {
                  const colorByState = { confirmada: 'success', observada: 'destructive', tentativa: 'warning' }[f.estado];
                  return (
                    <Link
                      to={`/escribanos/operaciones/${f.operacion}`}
                      key={f.operacion}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-11 text-center shrink-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">
                          {f.fecha.split('/')[1] === '06' ? 'Jun' : 'Jul'}
                        </div>
                        <div className="font-display font-bold text-[18px] text-foreground leading-none">
                          {f.fecha.split('/')[0]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground truncate">{f.direccion}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span>{f.hora}</span>
                          <span>·</span>
                          <span className="font-mono">{f.operacion}</span>
                        </div>
                      </div>
                      <StatusBadge variant={colorByState} className="text-[10px]">
                        {f.estado === 'confirmada' ? 'Conf.' : f.estado === 'observada' ? 'Obs.' : 'Tent.'}
                      </StatusBadge>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="card-surface p-5">
              <h3 className="font-display font-bold text-[15px] text-foreground mb-3">Por estado</h3>
              <div className="space-y-2.5">
                {[
                  { k: 'apertura', n: 6 },
                  { k: 'documentos', n: 14 },
                  { k: 'analisis', n: 18 },
                  { k: 'observado', n: 4 },
                  { k: 'en-firma', n: 5 },
                ].map(({ k, n }) => {
                  const e = estadoLabel[k];
                  const pct = Math.round((n / 47) * 100);
                  const barClass = {
                    info: 'bg-info',
                    warning: 'bg-warning',
                    destructive: 'bg-destructive',
                    success: 'bg-success',
                    muted: 'bg-muted-foreground',
                  }[e.color];
                  return (
                    <div key={k}>
                      <div className="flex items-center justify-between mb-1">
                        <StatusBadge variant={e.color}>{e.label}</StatusBadge>
                        <span className="text-[12px] font-semibold text-foreground num-tabular">{n}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PanelShell>
  );
};

export default Dashboard;
