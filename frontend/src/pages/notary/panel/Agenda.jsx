import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PanelShell, Topbar } from './PanelShell';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, Clock, MapPin } from 'lucide-react';
import { proximasFirmas } from './mockData';
import { useApp } from '@/context/AppContext';

const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const buildMonth = () => {
  const cells = [];
  for (let d = 26; d <= 31; d++) cells.push({ day: d, prev: true });
  for (let d = 1; d <= 30; d++) cells.push({ day: d });
  let i = cells.length;
  while (cells.length < 42) {
    cells.push({ day: cells.length - i + 1, next: true });
  }
  return cells.slice(0, 42);
};

const eventosMes = {
  3: [{ id: 'MP-474755', label: 'MP-474755', estado: 'success', hora: '10:00' }],
  10: [{ id: 'MP-474700', label: 'MP-474700', estado: 'success', hora: '11:30' }],
  17: [{ id: 'MP-474612', label: 'MP-474612', estado: 'success', hora: '15:00' }],
  18: [{ id: 'MP-474755', label: 'MP-474755', estado: 'success', hora: '12:00' }],
  24: [{ id: 'MP-475011', label: 'MP-475011', estado: 'success', hora: '11:00' }],
  25: [{ id: 'MP-475032', label: 'MP-475032', estado: 'destructive', hora: '15:30' }],
  27: [{ id: 'MP-474900', label: 'MP-474900', estado: 'success', hora: '10:00' }],
  30: [{ id: 'MP-474870', label: 'MP-474870', estado: 'warning', hora: '12:00' }],
};

const Agenda = () => {
  const { notarySession } = useApp();
  const [mes] = useState('Junio 2025');
  const cells = buildMonth();

  if (!notarySession) return <Navigate to="/escribanos" replace />;

  return (
    <PanelShell>
      <Topbar title="Agenda de firmas" subtitle="Planificá y reprogramá las firmas de tu escribanía" />

      <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-5" data-testid="agenda-page">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center bg-card border border-border rounded-lg h-10">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-r-none">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 text-[14px] font-semibold text-foreground border-x border-border h-10 leading-10">
              {mes}
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-l-none">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" className="h-10">Hoy</Button>

          <div className="inline-flex bg-card border border-border rounded-lg p-1 ml-auto">
            <button className="px-3 py-1.5 text-[12px] font-semibold text-foreground bg-muted rounded-md">Mes</button>
            <button className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">Semana</button>
            <button className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">Día</button>
          </div>
          <Button className="gap-2 h-10 bg-primary hover:bg-primary-glow text-primary-foreground">
            <Plus className="w-4 h-4" /> Nueva firma
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8 card-surface overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border">
              {dias.map((d) => (
                <div
                  key={d}
                  className="px-3 py-3 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((c, i) => {
                const e = eventosMes[c.day];
                const isToday = c.day === 23 && !c.prev && !c.next;
                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border-r border-b border-border last:border-r-0 p-2 relative ${
                      c.prev || c.next ? 'bg-muted/30 text-muted-foreground/40' : 'bg-card hover:bg-muted/30'
                    } ${(i + 1) % 7 === 0 ? 'border-r-0' : ''} transition-colors`}
                  >
                    <div
                      className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                        isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      } ${(c.prev || c.next) ? 'text-muted-foreground/50' : ''}`}
                    >
                      {c.day}
                    </div>
                    {e && !c.prev && !c.next && (
                      <div className="mt-1 space-y-1">
                        {e.map((ev) => {
                          const cls = {
                            success: 'bg-success-soft text-success border-success/20',
                            destructive: 'bg-destructive-soft text-destructive border-destructive/20',
                            warning: 'bg-warning-soft text-warning-foreground border-warning/30',
                          }[ev.estado];
                          return (
                            <Link
                              to={`/escribanos/operaciones/${ev.id}`}
                              key={ev.id}
                              className={`block px-1.5 py-1 rounded-md border ${cls} text-[10px] font-mono truncate hover:shadow-sm transition-shadow`}
                            >
                              <span className="font-semibold">{ev.hora}</span> · {ev.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-3">
            <div className="card-surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalIcon className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-[15px] text-foreground">Próximas firmas</h3>
              </div>
              <div className="space-y-3">
                {proximasFirmas.map((f) => {
                  const c = { confirmada: 'success', observada: 'destructive', tentativa: 'warning' }[f.estado];
                  return (
                    <Link
                      to={`/escribanos/operaciones/${f.operacion}`}
                      key={f.operacion}
                      className="block p-3 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all bg-muted/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CalIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-semibold text-[13px] text-foreground">{f.fecha}</span>
                          <Clock className="w-3 h-3 text-muted-foreground ml-1" />
                          <span className="text-[12px] text-muted-foreground">{f.hora}</span>
                        </div>
                        <StatusBadge variant={c} className="text-[10px]">
                          {f.estado === 'confirmada' ? 'Conf.' : f.estado === 'observada' ? 'Obs.' : 'Tent.'}
                        </StatusBadge>
                      </div>
                      <div className="font-semibold text-[13px] text-foreground leading-tight">{f.direccion}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="font-mono">{f.operacion}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-accent-soft border border-accent/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground grid place-items-center shrink-0">
                  <CalIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-[13px] text-foreground">Sincronización con Google Calendar</div>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Conectá tu calendario para sincronizar firmas y recibir recordatorios automáticos.
                  </p>
                  <button className="text-[12px] font-semibold text-accent hover:underline mt-2">Conectar →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
};

export default Agenda;
