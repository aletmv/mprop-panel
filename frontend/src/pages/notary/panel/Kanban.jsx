import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle, FolderOpen, Search, FileSignature, CheckCircle2, AlertTriangle, Clock, ChevronRight,
} from 'lucide-react';

// 5 hitos pedidos. Mapeamos cada hito a uno o más estados existentes.
const HITOS = [
  {
    id: 'inicio',
    label: 'Inicio de operación',
    sub: 'Apertura del legajo',
    icon: PlayCircle,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    bar: 'bg-sky-500',
    states: ['apertura'],
  },
  {
    id: 'expediente',
    label: 'Expediente documental',
    sub: 'Carga y revisión inicial',
    icon: FolderOpen,
    accent: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    bar: 'bg-indigo-500',
    states: ['documentos'],
  },
  {
    id: 'due-diligence',
    label: 'Due diligence',
    sub: 'Análisis registral y dominial',
    icon: Search,
    accent: 'text-amber-700 bg-amber-50 border-amber-200',
    bar: 'bg-amber-500',
    states: ['analisis', 'observado'],
  },
  {
    id: 'pre-cierre',
    label: 'Pre-cierre',
    sub: 'Listos para firma',
    icon: FileSignature,
    accent: 'text-violet-700 bg-violet-50 border-violet-200',
    bar: 'bg-violet-500',
    states: ['en-firma'],
  },
  {
    id: 'post-cierre',
    label: 'Cierre y post-cierre',
    sub: 'Inscripción y archivado',
    icon: CheckCircle2,
    accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-500',
    states: ['cerrado'],
  },
];

const KanbanCard = ({ op }) => {
  const alerta = op.riesgo === 'alto' || op.estado === 'observado';
  const urgente = op.diasFirma >= 0 && op.diasFirma <= 5;

  return (
    <Link
      to={`/escribanos/operaciones/${op.id}`}
      data-testid={`kanban-card-${op.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10.5px] text-slate-500 tracking-tight">{op.id}</span>
        {alerta && (
          <span title="Alerta de riesgo / observación" className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600">
            <AlertTriangle className="w-3 h-3" /> Alerta
          </span>
        )}
      </div>
      <div className="text-[13px] font-semibold text-slate-900 leading-snug truncate" title={op.direccion}>
        {op.direccion}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{op.barrio}</div>

      <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${op.estado === 'observado' ? 'bg-red-500' : op.estado === 'cerrado' ? 'bg-emerald-500' : 'bg-sky-500'}`}
          style={{ width: `${op.progreso}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {[op.vendedor, op.comprador].map((p, i) => (
            <span
              key={i}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white grid place-items-center text-[9px] font-bold text-slate-700"
              title={p.nombre}
            >
              {p.avatar}
            </span>
          ))}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[10.5px] ${
            urgente ? 'text-red-600 font-bold' : 'text-slate-500 font-medium'
          }`}
          title={`Firma tentativa ${op.firma}`}
        >
          <Clock className="w-3 h-3" />
          {op.diasFirma > 0 ? `${op.diasFirma}d` : op.diasFirma === 0 ? 'hoy' : `${Math.abs(op.diasFirma)}d`}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};

const Column = ({ hito, items }) => {
  const Icon = hito.icon;
  return (
    <div
      data-testid={`kanban-column-${hito.id}`}
      className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden"
    >
      <div className="px-3.5 py-3 flex items-center gap-2.5 border-b border-slate-200 bg-white">
        <span className={`w-8 h-8 rounded-lg grid place-items-center border ${hito.accent}`}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-slate-900 leading-tight truncate">{hito.label}</div>
          <div className="text-[10.5px] text-slate-500 truncate">{hito.sub}</div>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tabular-nums"
          data-testid={`kanban-count-${hito.id}`}
        >
          {items.length}
        </span>
      </div>
      <div className={`h-1 ${hito.bar}`} />
      <div className="p-2.5 flex flex-col gap-2 min-h-[260px] max-h-[460px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-[11.5px] text-slate-400 py-8">
            Sin legajos en este hito
          </div>
        ) : (
          items.map((op) => <KanbanCard key={op.id} op={op} />)
        )}
      </div>
    </div>
  );
};

export const LegajosKanban = ({ operaciones }) => {
  const columnas = HITOS.map((h) => ({
    hito: h,
    items: operaciones.filter((o) => h.states.includes(o.estado)),
  }));
  const totalActivos = operaciones.filter((o) => o.estado !== 'cerrado').length;

  return (
    <div className="card-surface p-5" data-testid="legajos-kanban">
      <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="font-display font-bold text-[18px] text-foreground">Tablero de legajos</h2>
          <div className="text-[12px] text-muted-foreground mt-0.5">
            {totalActivos} legajos activos a lo largo de los 5 hitos del proceso notarial
          </div>
        </div>
        <Link
          to="/escribanos/operaciones"
          className="text-[12px] font-semibold text-primary hover:underline"
          data-testid="kanban-link-list-view"
        >
          Ver como lista →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {columnas.map(({ hito, items }) => (
          <Column key={hito.id} hito={hito} items={items} />
        ))}
      </div>
    </div>
  );
};
