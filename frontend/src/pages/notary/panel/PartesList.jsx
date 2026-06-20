import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PanelShell, Topbar } from './PanelShell';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, CheckCircle2, FolderOpen } from 'lucide-react';
import { operaciones as MOCK_OPERACIONES } from './mockData';
import { buildNotaryOperaciones } from './operacionesAdapter';
import { buildPartesFromOperaciones, ROL_LABEL } from './partesData';
import { useApp } from '@/context/AppContext';

const PartesList = () => {
  const ctx = useApp();
  const { notarySession } = ctx;
  const operaciones = buildNotaryOperaciones(ctx, MOCK_OPERACIONES);
  const partes = useMemo(() => {
    const derivadas = buildPartesFromOperaciones(operaciones);
    return [...derivadas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [operaciones]);
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return partes;
    return partes.filter((p) => {
      const matchNombre = p.nombre.toLowerCase().includes(q);
      const matchDni = (p.dni || '').toLowerCase().includes(q);
      const matchOp = p.legajos.some((l) => l.opId.toLowerCase().includes(q));
      return matchNombre || matchDni || matchOp;
    });
  }, [busqueda, partes]);

  if (!notarySession) return <Navigate to="/escribanos" replace />;

  return (
    <PanelShell>
      <Topbar title="Partes" subtitle="Compradores y vendedores de tus legajos" />

      <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-5" data-testid="partes-list">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[12px] text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{lista.length}</span>{' '}
            parte{lista.length === 1 ? '' : 's'}
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, DNI o legajo…"
              data-testid="partes-search"
              className="pl-9 h-9 bg-muted border-transparent focus-visible:bg-card focus-visible:border-border"
            />
          </div>
        </div>

        <div className="card-surface overflow-hidden" data-testid="partes-table">
          {lista.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-muted-foreground" data-testid="partes-empty">
              No se encontraron partes para esta búsqueda.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  {['Nombre', 'Rol', 'DNI', 'Legajos', 'Estado', ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                    data-testid={`parte-row-${p.id}`}
                  >
                    <td className="px-4 py-3">
                      <Link to={`/escribanos/partes/${p.id}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 grid place-items-center text-[11px] font-semibold shrink-0">
                          {p.avatar || '—'}
                        </div>
                        <span className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                          {p.nombre}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-600">{ROL_LABEL[p.rolPrincipal]}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-slate-500">{p.dni || '—'}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                        {p.legajosCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.verificado ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> Verificado
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-slate-400">Sin verificar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/escribanos/partes/${p.id}`}
                        data-testid={`parte-link-${p.id}`}
                        className="text-slate-400 hover:text-primary transition-colors inline-flex"
                        aria-label={`Ver ficha de ${p.nombre}`}
                      >
                        <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PanelShell>
  );
};

export default PartesList;
