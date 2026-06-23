import React, { useState, useMemo } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { PanelShell, Topbar } from './PanelShell';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, SlidersHorizontal, Plus, MapPin, Calendar, ArrowUpDown,
  ChevronRight, Download, X,
} from 'lucide-react';
import { operaciones as MOCK_OPERACIONES, estadoLabel, riesgoLabel } from './mockData';
import { buildNotaryOperaciones } from './operacionesAdapter';
import { HITO_MAP, BloqueoBadge } from './Kanban';
import { PartiesPair } from './PartiesPair';
import { useApp } from '@/context/AppContext';

const filtrosBase = [
  { id: 'todos', label: 'Todas' },
  { id: 'apertura', label: 'Apertura' },
  { id: 'documentos', label: 'Expediente' },
  { id: 'analisis', label: 'Due diligence' },
  { id: 'observado', label: 'Observadas' },
  { id: 'en-firma', label: 'Pre-cierre' },
];

const OperacionesList = () => {
  const ctx = useApp();
  const { notarySession } = ctx;
  const [searchParams, setSearchParams] = useSearchParams();
  const hitoId = searchParams.get('hito');
  const hito = hitoId ? HITO_MAP[hitoId] : null;
  const operacionesAll = buildNotaryOperaciones(ctx, MOCK_OPERACIONES);
  const operaciones = hito ? operacionesAll.filter((o) => hito.states.includes(o.estado)) : operacionesAll;

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

  const clearHito = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('hito');
    setSearchParams(next);
  };

  if (!notarySession) return <Navigate to="/escribanos" replace />;

  return (
    <PanelShell>
      <Topbar
        title={hito ? `Legajos · ${hito.label}` : 'Legajos'}
        subtitle={hito ? hito.sub : 'Todos los legajos en gestión por tu escribanía'}
      />

      <div className="px-9 py-6 lg:py-8 space-y-5" data-testid="operaciones-list">
        {hito && (
          <div
            className="card-surface p-4 flex items-center justify-between gap-3 flex-wrap"
            data-testid="hito-filter-banner"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-muted-foreground">
                Filtrado por hito
              </span>
              <span className="font-semibold text-[13px] text-foreground truncate">{hito.label}</span>
              <span className="text-[12px] text-muted-foreground">·</span>
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {operaciones.length} legajo{operaciones.length === 1 ? '' : 's'}
              </span>
            </div>
            <button
              onClick={clearHito}
              data-testid="clear-hito-filter"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
            >
              <X className="w-3.5 h-3.5" /> Quitar filtro
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por dirección, MP-ID, parte…"
              className="pl-9 h-10 bg-card"
              data-testid="legajos-search-input"
            />
          </div>
          <Button variant="outline" className="gap-2 h-10" disabled title="Próximamente">
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </Button>
          <Button variant="outline" className="gap-2 h-10" disabled title="Próximamente">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <div className="flex-1" />
          <Button variant="outline" className="gap-2 h-10" disabled title="Próximamente">
            <Plus className="w-4 h-4" /> Nuevo legajo
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
                  {['Acción', 'Operación', 'Estado', 'Progreso', 'Partes', 'Firma tentativa', 'Riesgo', ''].map((h) => (
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
                  const riesgoShort = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }[op.riesgo] || op.riesgo;
                  return (
                    <tr
                      key={op.id}
                      data-testid={`operacion-row-${op.id}`}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <BloqueoBadge op={op} />
                      </td>
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
                        <PartiesPair vendedor={op.vendedor} comprador={op.comprador} opId={op.id} size="sm" />
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
                        <StatusBadge variant={r.color}>{riesgoShort}</StatusBadge>
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
