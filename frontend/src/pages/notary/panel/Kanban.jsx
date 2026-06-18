import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle, FolderOpen, Search, FileSignature, CheckCircle2, AlertTriangle, Clock, ChevronRight, ArrowRight, Plus,
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { alertas as ALERTAS_MOCK } from './mockData';
import { DND_TYPE } from './dndTypes';
import { dayTasks, useDayTasks } from './dayTasksStore';
import { HourglassFalling } from './HourglassFalling';

// 5 hitos con progresión cromática lógica:
// neutro-frío (Inicio) → fresco (Expediente) → análisis (Due diligence) → transición (Pre-cierre) → final/éxito (Cierre).
const HITOS = [
  {
    id: 'inicio',
    label: 'Inicio de operación',
    sub: 'Apertura del legajo',
    icon: PlayCircle,
    iconColor: 'text-sky-600 bg-sky-50 border-sky-200',
    states: ['apertura'],
  },
  {
    id: 'expediente',
    label: 'Expediente documental',
    sub: 'Carga y revisión inicial',
    icon: FolderOpen,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    states: ['documentos'],
  },
  {
    id: 'due-diligence',
    label: 'Due diligence',
    sub: 'Análisis registral y dominial',
    icon: Search,
    iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
    states: ['analisis', 'observado'],
  },
  {
    id: 'pre-cierre',
    label: 'Pre-cierre',
    sub: 'Listos para firma',
    icon: FileSignature,
    iconColor: 'text-lime-600 bg-lime-50 border-lime-200',
    states: ['en-firma'],
  },
  {
    id: 'post-cierre',
    label: 'Cierre y post-cierre',
    sub: 'Inscripción y archivado',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    states: ['cerrado'],
  },
];

const NIVEL_CFG = {
  critica: { label: 'Crítica', tone: 'red', priority: 'Alta', barClass: 'bg-red-500', textClass: 'text-red-700', softBg: 'bg-red-50', softBorder: 'border-red-200' },
  media: { label: 'Media', tone: 'amber', priority: 'Media', barClass: 'bg-amber-500', textClass: 'text-amber-700', softBg: 'bg-amber-50', softBorder: 'border-amber-200' },
  info: { label: 'Info', tone: 'sky', priority: 'Baja', barClass: 'bg-sky-500', textClass: 'text-sky-700', softBg: 'bg-sky-50', softBorder: 'border-sky-200' },
};

export const pickWorstAlert = (opId) => {
  const list = ALERTAS_MOCK.filter((a) => a.operacionId === opId);
  if (list.length === 0) return null;
  const order = { critica: 0, media: 1, info: 2 };
  return [...list].sort((a, b) => order[a.nivel] - order[b.nivel])[0];
};

export const getOpAlert = (op) => {
  const alert = pickWorstAlert(op.id);
  if (alert) return alert;
  if (op.riesgo === 'alto' || op.estado === 'observado') {
    return {
      nivel: op.estado === 'observado' ? 'critica' : 'media',
      titulo: op.estado === 'observado' ? 'Legajo observado' : 'Riesgo alto detectado',
      impacto: op.estado === 'observado' ? 'No apto para avanzar sin resolver' : 'Requiere validación adicional',
      accion: 'Revisar observaciones en el detalle del legajo',
      responsable: 'Esc. Lagos',
      prioridad: op.estado === 'observado' ? 'Alta' : 'Media',
    };
  }
  return null;
};

export const AlertChip = ({ op, size = 'sm' }) => {
  const data = getOpAlert(op);
  if (!data) return null;
  const cfg = NIVEL_CFG[data.nivel];
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          data-testid={`alert-chip-${op.id}`}
          className={`inline-flex items-center gap-1 ${textSize} font-semibold ${cfg.textClass} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300 rounded`}
        >
          <AlertTriangle className={iconSize} /> Alerta
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 overflow-hidden border-slate-200 shadow-lg"
        data-testid={`alert-popover-${op.id}`}
      >
        <div className={`h-1 ${cfg.barClass}`} />
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${cfg.textClass}`}>
              <AlertTriangle className="w-3 h-3" /> Alerta {cfg.label.toLowerCase()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Prioridad {data.prioridad || cfg.priority}
            </span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.06em] text-slate-500 font-semibold">Título</div>
            <div className="text-[13px] font-semibold text-slate-900 leading-snug">{data.titulo}</div>
          </div>
          {data.impacto && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.06em] text-slate-500 font-semibold">Impacto</div>
              <div className="text-[12px] text-slate-700 leading-snug">{data.impacto}</div>
            </div>
          )}
          {data.accion && (
            <div className={`${cfg.softBg} border ${cfg.softBorder} rounded-md px-2.5 py-2`}>
              <div className="text-[10px] uppercase tracking-[0.06em] text-slate-500 font-semibold">Acción sugerida</div>
              <div className={`text-[12px] ${cfg.textClass} font-medium leading-snug`}>{data.accion}</div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const KanbanCard = ({ op }) => {
  const urgente = op.diasFirma >= 0 && op.diasFirma <= 5;
  const tasksState = useDayTasks();
  const isInBoard = tasksState.pending.includes(op.id) || tasksState.done.includes(op.id);

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(DND_TYPE, op.id);
    e.dataTransfer.setData('text/plain', op.id);
  };

  const onAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInBoard) dayTasks.addPending(op.id);
  };

  return (
    <Link
      to={`/escribanos/operaciones/${op.id}`}
      draggable
      onDragStart={onDragStart}
      data-testid={`kanban-card-${op.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-slate-300 transition-all group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10.5px] text-slate-500 tracking-tight">{op.id}</span>
        <AlertChip op={op} />
      </div>
      <div className="text-[13px] font-semibold text-slate-900 leading-snug truncate" title={op.direccion}>
        {op.direccion}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{op.barrio}</div>

      {op.tareaEnCurso && (
        <div
          className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md pl-2 pr-1 py-1"
          data-testid={`kanban-task-${op.id}`}
        >
          <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" aria-hidden />
          <span className="leading-snug flex-1 min-w-0">
            <span className="block text-[9.5px] uppercase tracking-[0.08em] text-slate-500 font-semibold">
              Tarea en curso
            </span>
            <span className="block font-medium truncate" title={op.tareaEnCursoFull || op.tareaEnCurso}>{op.tareaEnCurso}</span>
          </span>
          <button
            type="button"
            onClick={onAddClick}
            disabled={isInBoard}
            data-testid={`kanban-add-task-${op.id}`}
            title={isInBoard ? 'Ya está en tu día' : 'Agregar a mi día'}
            className={`shrink-0 w-7 h-7 grid place-items-center rounded-md transition-colors ${
              isInBoard
                ? 'bg-slate-100 text-slate-700 cursor-default'
                : 'bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5'
            }`}
          >
            {isInBoard ? (
              <HourglassFalling className="w-3.5 h-3.5" title="Ya está en tu día" />
            ) : (
              <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
            )}
          </button>
        </div>
      )}

      <div className="mt-2.5 h-1 rounded-full bg-slate-100 overflow-hidden">
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
      <Link
        to={`/escribanos/operaciones?hito=${hito.id}`}
        data-testid={`kanban-column-header-${hito.id}`}
        className="px-3.5 py-3 flex items-center gap-2.5 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
        title={`Ver todos los legajos en ${hito.label}`}
      >
        <span className={`w-8 h-8 rounded-lg grid place-items-center border ${hito.iconColor}`}>
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
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
      </Link>
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
          <h2 className="font-display font-bold text-[20px] text-foreground leading-tight">Legajos</h2>
          <div className="text-[12px] text-muted-foreground mt-0.5 num-tabular">
            <span className="font-semibold text-foreground" data-testid="kanban-activos-count">
              {totalActivos}
            </span>{' '}
            activos
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

// Export para que OperacionesList pueda mapear hitoId → estados.
export const HITO_MAP = HITOS.reduce((acc, h) => {
  acc[h.id] = h;
  return acc;
}, {});
