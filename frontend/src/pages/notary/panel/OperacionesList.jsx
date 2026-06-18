import React, { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PanelShell, Topbar } from './PanelShell';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, SlidersHorizontal, Plus, MapPin, Calendar, ArrowUpDown,
  CheckCircle2, ChevronRight, Download,
} from 'lucide-react';
import { operaciones as MOCK_OPERACIONES, estadoLabel, riesgoLabel } from './mockData';
import { buildNotaryOperaciones } from './operacionesAdapter';
import { useApp } from '@/context/AppContext';

const filtrosBase = [
  { id: 'todos', label: 'Todas' },
  { id: 'apertura', label: 'Apertura' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'analisis', label: 'Análisis' },
  { id: 'observado', label: 'Observadas' },
  { id: 'en-firma', label: 'En firma' },
];

const OperacionesList = () => {
  const ctx = useApp();
  const { notarySession } = ctx;
  const operaciones = buildNotaryOperaciones(ctx, MOCK_OPERACIONES);
  const filtros = useMemo(
    () =>
      filtrosBase.map((f) => ({
        ...f,
        count: f.id === 'todos' ? operaciones.length : operaciones.filter((o) => o.estado === f.id).length,
      })),
    [operaciones]
  );
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    return operaciones.filter((o) => {
      const matchEstado = filtro === 'todos' ? true : o.estado === filtro;
      const q = busqueda.toLowerCase();
      const matchQ =
        !q ||
        o.direccion.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.vendedor.nombre.toLowerCase().includes(q) ||
        o.comprador.nombre.toLowerCase().includes(q);
      return matchEstado && matchQ;
    });
  }, [filtro, busqueda, operaciones]);

  if (!notarySession) return <Navigate to="/escribanos" replace />;

  return (
    <PanelShell>
      <Topbar title="Operaciones" subtitle="Todos los legajos en gestión por tu escribanía" />

      <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-5" data-testid="operaciones-list">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por dirección, MP-ID, parte…"
              className="pl-9 h-10 bg-card"
              data-testid="operaciones-search-input"
            />
          </div>
          <Button variant="outline" className="gap-2 h-10">
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </Button>
          <Button variant="outline" className="gap-2 h-10">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <div className="flex-1" />
          <Button className="gap-2 h-10 bg-primary hover:bg-primary-glow text-primary-foreground">
            <Plus className="w-4 h-4" /> Nueva operación
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              data-testid={`operaciones-filter-${f.id}`}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                filtro === f.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground/75 border-border hover:bg-muted'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-[11px] font-bold ${filtro === f.id ? 'opacity-80' : 'opacity-50'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {['Operación', 'Estado', 'Progreso', 'Partes', 'Firma tentativa', 'Riesgo', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      <span className="inline-flex items-center gap-1">
                        {h}
                        {h && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((op) => {
                  const e = estadoLabel[op.estado];
                  const r = riesgoLabel[op.riesgo];
                  return (
                    <tr
                      key={op.id}
                      data-testid={`operacion-row-${op.id}`}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <Link to={`/escribanos/operaciones/${op.id}`} className="block">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-muted grid place-items-center shrink-0">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate">{op.direccion}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                <span className="font-mono">{op.id}</span>
                                <span>·</span>
                                <span>{op.barrio}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge variant={e.color}>{e.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3.5 w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                op.estado === 'cerrado'
                                  ? 'bg-success'
                                  : op.estado === 'observado'
                                  ? 'bg-destructive'
                                  : 'bg-primary'
                              }`}
                              style={{ width: `${op.progreso}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-muted-foreground num-tabular w-8 text-right">
                            {op.progreso}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex -space-x-2">
                          {[op.vendedor, op.comprador].map((p, i) => (
                            <div key={i} className="relative">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-primary-glow text-primary-foreground grid place-items-center text-[10px] font-bold border-2 border-card">
                                {p.avatar}
                              </div>
                              {p.verificado && (
                                <CheckCircle2 className="w-3 h-3 text-success absolute -bottom-0.5 -right-0.5 bg-card rounded-full" />
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{op.firma}</span>
                          <span
                            className={`text-[11px] ${
                              op.diasFirma < 7 && op.diasFirma > 0
                                ? 'text-destructive font-semibold'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {op.diasFirma > 0
                              ? `en ${op.diasFirma}d`
                              : op.diasFirma === 0
                              ? 'hoy'
                              : `hace ${-op.diasFirma}d`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge variant={r.color}>{r.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/escribanos/operaciones/${op.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-[12px] text-muted-foreground border-t border-border bg-muted/30">
            <div>
              Mostrando <span className="font-semibold text-foreground">{lista.length}</span> de{' '}
              <span className="font-semibold text-foreground">{operaciones.length}</span> legajos
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                1
              </Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                2
              </Button>
              <Button variant="ghost" size="sm">
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
};

export default OperacionesList;
