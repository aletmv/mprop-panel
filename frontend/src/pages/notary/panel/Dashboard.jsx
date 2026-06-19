import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PanelShell, Topbar } from './PanelShell';
import { StatusBadge } from './StatusBadge';
import {
  Clock, CalendarDays, ChevronRight, Sparkles, ShieldAlert, AlertTriangle, FileText,
} from 'lucide-react';
import {
  alertas, proximasFirmas, estadoLabel, operaciones as MOCK_OPERACIONES,
} from './mockData';
import { buildNotaryOperaciones } from './operacionesAdapter';
import { LegajosKanban } from './Kanban';
import { TasksBoard } from './TasksBoard';
import { useApp } from '@/context/AppContext';

const Dashboard = () => {
  const ctx = useApp();
  const { notarySession } = ctx;
  const [agendaTab, setAgendaTab] = useState('proximas');
  if (!notarySession) return <Navigate to="/escribanos" replace />;
  const operaciones = buildNotaryOperaciones(ctx, MOCK_OPERACIONES);
  const distribucion = [
    { k: 'apertura', n: operaciones.filter((o) => o.estado === 'apertura').length || 6 },
    { k: 'documentos', n: operaciones.filter((o) => o.estado === 'documentos').length || 14 },
    { k: 'analisis', n: operaciones.filter((o) => o.estado === 'analisis').length || 18 },
    { k: 'observado', n: operaciones.filter((o) => o.estado === 'observado').length || 4 },
    { k: 'en-firma', n: operaciones.filter((o) => o.estado === 'en-firma').length || 5 },
  ];
  const totalDist = distribucion.reduce((s, x) => s + x.n, 0) || 1;

  const firmasOrdenadas = proximasFirmas;
  const fechaHoy = firmasOrdenadas[0]?.fecha;
  const firmasHoy = firmasOrdenadas.filter((f) => f.fecha === fechaHoy);
  const firmasAMostrar = agendaTab === 'hoy' ? firmasHoy : firmasOrdenadas.slice(0, 5);

  return (
    <PanelShell>
      <Topbar
        title="Buen día, María Inés"
        subtitle="Tenés 4 alertas críticas y 12 firmas en los próximos 7 días."
      />
      <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6" data-testid="notary-dashboard">
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <TasksBoard operaciones={operaciones} />
          </div>
          <aside className="col-span-12 lg:col-span-4">
            <div className="card-surface p-5 h-full flex flex-col" data-testid="alerts-card-top">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="font-display font-bold text-[18px] text-foreground leading-tight">Alertas</h2>
                  <div className="text-[11.5px] text-muted-foreground">Ordenadas por prioridad e impacto</div>
                </div>
                <Link
                  to="/escribanos/operaciones"
                  data-testid="alerts-view-all"
                  className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0"
                >
                  Ver todas
                </Link>
              </div>
              <div className="space-y-2 overflow-y-auto pr-1 flex-1 max-h-[420px]">
                {alertas.map((a) => {
                  const cfg = {
                    critica: { Icon: ShieldAlert, bg: 'bg-destructive-soft', border: 'border-destructive/15', boxBg: 'bg-destructive', boxBorder: 'border-destructive', iconClass: 'text-white' },
                    media:   { Icon: AlertTriangle, bg: 'bg-card', border: 'border-border', boxBg: 'bg-card', boxBorder: 'border-warning/40', iconClass: 'text-warning-foreground' },
                    info:    { Icon: FileText, bg: 'bg-card', border: 'border-border', boxBg: 'bg-card', boxBorder: 'border-info/30', iconClass: 'text-info' },
                  }[a.nivel];
                  const Icon = cfg.Icon;
                  return (
                    <Link
                      to={`/escribanos/operaciones/${a.operacionId}`}
                      key={a.id}
                      data-testid={`alert-${a.id}`}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${cfg.bg} ${cfg.border} hover:shadow-sm transition-shadow group`}
                    >
                      <div className={`w-7 h-7 rounded-md grid place-items-center shrink-0 border ${cfg.boxBorder} ${cfg.boxBg}`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.iconClass}`} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-foreground leading-snug">{a.titulo}</div>
                        <div className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">{a.descripcion}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono">{a.operacionId}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>

        <LegajosKanban operaciones={operaciones} />

        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="card-surface p-6" data-testid="agenda-card">
              <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
                <div>
                  <h2 className="font-display font-bold text-[18px] text-foreground flex items-center gap-2">
                    <CalendarDays className="w-[18px] h-[18px] text-primary" />
                    {agendaTab === 'hoy' ? 'Agenda del día' : 'Próximas firmas'}
                  </h2>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    {agendaTab === 'hoy'
                      ? `${firmasHoy.length} firma${firmasHoy.length === 1 ? '' : 's'} programada${firmasHoy.length === 1 ? '' : 's'} para hoy`
                      : 'Próximos 5 actos notariales agendados'}
                  </div>
                </div>
                <div
                  className="inline-flex bg-muted rounded-lg p-1"
                  data-testid="agenda-toggle"
                  role="tablist"
                >
                  <button
                    role="tab"
                    aria-selected={agendaTab === 'hoy'}
                    data-testid="agenda-tab-hoy"
                    onClick={() => setAgendaTab('hoy')}
                    className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
                      agendaTab === 'hoy' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    role="tab"
                    aria-selected={agendaTab === 'proximas'}
                    data-testid="agenda-tab-proximas"
                    onClick={() => setAgendaTab('proximas')}
                    className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
                      agendaTab === 'proximas' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Próximas firmas
                  </button>
                </div>
              </div>

              {firmasAMostrar.length === 0 ? (
                <div className="py-10 flex flex-col items-center text-center text-[13px] text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-muted grid place-items-center mb-3">
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  </div>
                  No hay firmas programadas para hoy.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {firmasAMostrar.map((f) => {
                    const colorByState = { confirmada: 'success', observada: 'destructive', tentativa: 'warning' }[f.estado];
                    const labelByState = { confirmada: 'Confirmada', observada: 'Observada', tentativa: 'Tentativa' }[f.estado];
                    return (
                      <Link
                        to={`/escribanos/operaciones/${f.operacion}`}
                        key={f.operacion}
                        data-testid={`agenda-item-${f.operacion}`}
                        className="flex items-center gap-4 py-3.5 group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="w-14 text-center shrink-0">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {f.fecha.split('/')[1] === '06' ? 'Jun' : 'Jul'}
                          </div>
                          <div className="font-display font-bold text-[20px] text-foreground leading-none num-tabular">
                            {f.fecha.split('/')[0]}
                          </div>
                        </div>
                        <div className="w-px self-stretch bg-border" />
                        <div className="flex items-center gap-2 shrink-0 text-foreground font-semibold num-tabular text-[14px]">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {f.hora}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-semibold text-foreground truncate">{f.direccion}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            <span className="font-mono">{f.operacion}</span> · {f.escribano}
                          </div>
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 bg-${colorByState}`}
                          title={labelByState}
                          aria-label={`Estado: ${labelByState}`}
                          role="img"
                        />
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3.5" data-testid="agenda-status-legend">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
                    <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" /> Confirmada
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                    <span className="w-2 h-2 rounded-full bg-destructive" aria-hidden="true" /> Observada
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warning-foreground">
                    <span className="w-2 h-2 rounded-full bg-warning" aria-hidden="true" /> Tentativa
                  </span>
                </div>
                <Link
                  to="/escribanos/agenda"
                  className="text-[12px] font-semibold text-primary hover:underline"
                  data-testid="agenda-card-link-agenda"
                >
                  Ver agenda completa →
                </Link>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="rounded-2xl p-5 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-accent/25 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-80">Resumen del día</span>
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
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
              <h3 className="font-display font-bold text-[15px] text-foreground mb-3">Por estado</h3>
              <div className="space-y-2.5">
                {distribucion.map(({ k, n }) => {
                  const e = estadoLabel[k];
                  const pct = Math.round((n / totalDist) * 100);
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
