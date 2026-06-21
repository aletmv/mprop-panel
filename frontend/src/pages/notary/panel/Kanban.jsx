import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlayCircle, FolderOpen, Search, FileSignature, CheckCircle2, ShieldAlert, FileText, Clock, ChevronRight, Plus, Minus, Check, Calendar,
  ExternalLink,
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { alertas as ALERTAS_MOCK, estadoLabel, riesgoLabel, bloqueoLabel } from './mockData';
import { DND_TYPE } from './dndTypes';
import { dayTasks, useDayTasks } from './dayTasksStore';
import { HourglassFalling } from './HourglassFalling';
import { PartiesPair } from './PartiesPair';
import { StatusBadge } from './StatusBadge';

// 5 hitos con progresión cromática lógica:
// neutro-frío (Inicio) → fresco (Expediente) → análisis (Due diligence) → transición (Pre-cierre) → final/éxito (Cierre).
const HITOS = [
  {
    id: 'inicio',
    label: 'Inicio de operación',
    sub: 'Apertura del legajo',
    icon: PlayCircle,
    iconColor: 'text-[var(--stage-inicio-text)] bg-[var(--stage-inicio-soft)]',
    borderColor: 'border-[var(--stage-inicio)]',
    states: ['apertura'],
  },
  {
    id: 'expediente',
    label: 'Expediente documental',
    sub: 'Carga y revisión inicial',
    icon: FolderOpen,
    iconColor: 'text-[var(--stage-expediente-text)] bg-[var(--stage-expediente-soft)]',
    borderColor: 'border-[var(--stage-expediente)]',
    states: ['documentos'],
  },
  {
    id: 'due-diligence',
    label: 'Due diligence',
    sub: 'Análisis registral y dominial',
    icon: Search,
    iconColor: 'text-[var(--stage-diligence-text)] bg-[var(--stage-diligence-soft)]',
    borderColor: 'border-[var(--stage-diligence)]',
    states: ['analisis', 'observado'],
  },
  {
    id: 'pre-cierre',
    label: 'Pre-cierre',
    sub: 'Listos para firma',
    icon: FileSignature,
    iconColor: 'text-[var(--stage-precierre-text)] bg-[var(--stage-precierre-soft)]',
    borderColor: 'border-[var(--stage-precierre)]',
    states: ['en-firma'],
  },
  {
    id: 'post-cierre',
    label: 'Cierre y post-cierre',
    sub: 'Inscripción y archivado',
    icon: CheckCircle2,
    iconColor: 'text-[var(--stage-cierre-text)] bg-[var(--stage-cierre-soft)]',
    borderColor: 'border-[var(--stage-cierre)]',
    states: ['cerrado'],
  },
];

// Visual de etapa por estado (mismos tokens --stage-* ya usados en HITOS/estadoLabel),
// para colorear acentos de card y pills dentro del Kanban sin depender del objeto HITO.
const ESTADO_STAGE_VISUAL = {
  apertura: { bg: 'var(--stage-inicio-soft)', text: 'var(--stage-inicio-text)', accent: 'var(--stage-inicio)' },
  documentos: { bg: 'var(--stage-expediente-soft)', text: 'var(--stage-expediente-text)', accent: 'var(--stage-expediente)' },
  analisis: { bg: 'var(--stage-diligence-soft)', text: 'var(--stage-diligence-text)', accent: 'var(--stage-diligence)' },
  observado: { bg: 'var(--stage-diligence-soft)', text: 'var(--stage-diligence-text)', accent: 'var(--stage-diligence)' },
  'en-firma': { bg: 'var(--stage-precierre-soft)', text: 'var(--stage-precierre-text)', accent: 'var(--stage-precierre)' },
  cerrado: { bg: 'var(--stage-cierre-soft)', text: 'var(--stage-cierre-text)', accent: 'var(--stage-cierre)' },
};

// Tinte de hover por actor en los chips de "¿Quién tiene la pelota?" — solo estilo.
const ACTOR_HOVER = {
  comprador: 'hover:border-[#D0E1F5] hover:bg-[#F7FAFE]',
  vendedor: 'hover:border-[#FADBCA] hover:bg-[#FEF8F4]',
  escribania: 'hover:border-[#E4DFF5] hover:bg-[#FAF8FE]',
  gestoria: 'hover:border-[#D9EBE0] hover:bg-[#F6FBF8]',
  tercero: 'hover:border-slate-200 hover:bg-slate-50',
  bloqueado: 'hover:border-red-200 hover:bg-red-50',
};

const NIVEL_CFG = {
  critica: { label: 'Crítica', tone: 'red', priority: 'Alta', barClass: 'bg-red-500', textClass: 'text-red-700', softBg: 'bg-red-50', softBorder: 'border-red-200' },
  media: { label: 'Media', tone: 'amber', priority: 'Media', barClass: 'bg-amber-500', textClass: 'text-amber-700', softBg: 'bg-amber-50', softBorder: 'border-amber-200' },
  info: { label: 'Info', tone: 'sky', priority: 'Baja', barClass: 'bg-sky-500', textClass: 'text-sky-700', softBg: 'bg-sky-50', softBorder: 'border-sky-200' },
};

// Tono cromático del badge "Acción / Esperando / Bloqueado".
// Por defecto usamos gris neutro para todos los actores; sólo "bloqueado" usa rojo.
const BLOQUEO_TONE = {
  neutral: { dot: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  red:     { dot: 'bg-red-500',   bg: 'bg-red-50',    text: 'text-red-800',   border: 'border-red-200'   },
};

// Pelota de fútbol estilizada (SVG inline) para identificar al responsable
// del próximo desbloqueo en el Kanban: "quién tiene la pelota".
const SoccerBallIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 122.88 122.88"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M61.44,0c16.97,0,32.33,6.88,43.44,18c11.12,11.12,18,26.48,18,43.44c0,16.97-6.88,32.33-18,43.44 c-11.12,11.12-26.48,18-43.44,18S29.11,116,18,104.88C6.88,93.77,0,78.41,0,61.44C0,44.47,6.88,29.11,18,18 C29.11,6.88,44.47,0,61.44,0L61.44,0z M76.85,117.08L76.73,117l6.89-23.09L69.41,78.15L52.66,78L39.38,94.62l6.66,22.32l-0.15,0.1 c4.95,1.38,10.16,2.12,15.55,2.12C66.78,119.16,71.95,118.44,76.85,117.08L76.85,117.08z M12.22,91.61l24.34,0.12L49.28,75.8 l-5.26-16.12l-21.42-9.3L3.78,64.08C4.23,74.14,7.26,83.53,12.22,91.61L12.22,91.61z M16.77,24.88l7.4,22.14l19.98,8.68 l15.44-11.97V20.94L40.51,7.63c-7.52,2.93-14.28,7.39-19.89,13C19.27,21.98,17.98,23.4,16.77,24.88L16.77,24.88z M81.7,7.37 L63.3,20.77V43.7L77.8,54.91l20.81-8.92l7.18-21.49c-1.12-1.35-2.3-2.64-3.54-3.88C96.48,14.85,89.49,10.29,81.7,7.37L81.7,7.37z M119.09,64.36l-0.02,0.01L99.09,49.82l-19.81,8.49l-6.08,18.03l13.73,15.23c0.06,0.06,0.09,0.13,0.11,0.21l23.6-0.11 C115.56,83.65,118.59,74.34,119.09,64.36L119.09,64.36z"
    />
  </svg>
);

// Extrae sólo la jurisdicción (último segmento de "Recoleta, CABA").
const jurisdiccionDe = (barrio) => {
  if (!barrio) return '—';
  const parts = barrio.split(',').map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || barrio;
};

// "Pelota: Responsable" — icono de fútbol + nombre del responsable. Se usa
// en el Kanban (variante clickeable que abre el popover "Línea de pases").
export const BloqueoNameOnly = ({ actor, opId, className = '', textClassName = 'text-[12px]', iconClassName = 'w-3.5 h-3.5', tone }) => {
  if (!actor) return null;
  const meta = bloqueoLabel[actor];
  if (!meta) return null;
  const isBloqueado = actor === 'bloqueado';
  // Con `tone`, el color lo define el contenedor (pill) vía currentColor.
  const colorText = isBloqueado ? 'text-red-700' : tone ? '' : 'text-slate-800';
  return (
    <span
      data-testid={opId ? `bloqueo-name-${opId}` : `bloqueo-name-${actor}`}
      className={`inline-flex items-center gap-1.5 ${colorText} ${textClassName} font-semibold whitespace-nowrap ${className}`}
    >
      <SoccerBallIcon className={iconClassName} />
      {meta.short}
    </span>
  );
};

// Popover "Línea de pases": muestra paso previo + paso actual + próximo paso,
// todos conectados al mismo timeline. Lo único que diferencia visualmente al
// estado actual son: punto verde titilante, tipografía oscura y sin sombreado.
// Previo y próximo: tipografía y sombreado grises.
const PaseRow = ({ pase, variant }) => {
  const isCurrent = variant === 'current';
  const meta = bloqueoLabel[pase.actor];
  const when = pase.desde
    ? pase.desde
    : `${pase.fecha || ''}${pase.hora ? ` · ${pase.hora}` : ''}`;

  const rowBg = isCurrent ? 'bg-transparent' : 'bg-slate-100/70';
  const actorClass = 'text-slate-900 font-semibold';
  const actionClass = isCurrent ? 'text-slate-700' : 'text-slate-400';
  const whenClass = isCurrent ? 'text-slate-500' : 'text-slate-400';

  return (
    <li className={`relative pl-7 pr-3 py-2 rounded-md ${rowBg}`}>
      <span className="absolute left-1.5 top-3.5 -translate-y-1/2">
        {isCurrent ? (
          <span className="block w-2.5 h-2.5 rounded-full bg-slate-300 pase-current-ring ring-2 ring-white" aria-hidden />
        ) : (
          <span className="block w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
        )}
      </span>
      <div className={`text-[12.5px] leading-snug ${actorClass}`}>{meta?.short || pase.actor}</div>
      <div className={`text-[11.5px] leading-snug ${actionClass}`}>{pase.accion}</div>
      {when && <div className={`text-[10.5px] mt-0.5 ${whenClass}`}>{when}</div>}
    </li>
  );
};

const LineaDePasesContent = ({ op, onNavigate }) => {
  const pases = op.lineaDePases || [];
  const next = op.proximoPaso;

  // Tomamos sólo penúltimo (previo) + último (actual). Si hay menos entradas
  // mostramos lo que haya. El próximo se deriva de proximoPaso.
  const currentPase = pases[pases.length - 1];
  const previousPase = pases.length >= 2 ? pases[pases.length - 2] : null;
  const nextPase = next
    ? {
        actor: next.responsable,
        accion: next.descripcion,
        desde: next.vence ? `Vence ${next.vence}` : null,
      }
    : null;

  return (
    <div className="w-[280px]" data-testid={`linea-pases-${op.id}`}>
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Línea de pases</h3>
        <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
          Últimos traspasos de responsabilidad del legajo.
        </p>
      </div>

      <div className="px-3 py-3">
        <ol className="relative space-y-1">
          {/* línea de tiempo: se extiende y se desvanece arriba/abajo para indicar
              que el legajo tiene más pasos antes y después de los 3 mostrados. */}
          <span
            className="absolute left-[10px] w-px"
            style={{
              top: '-14px',
              bottom: '-14px',
              background:
                'linear-gradient(to bottom, transparent, #E2E8F0 16px, #E2E8F0 calc(100% - 16px), transparent)',
            }}
            aria-hidden
          />
          {previousPase && <PaseRow pase={previousPase} variant="previous" />}
          {currentPase && <PaseRow pase={currentPase} variant="current" />}
          {nextPase && <PaseRow pase={nextPase} variant="next" />}
        </ol>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNavigate?.();
        }}
        data-testid={`linea-pases-cta-${op.id}`}
        className="w-full px-4 py-2.5 text-[12px] font-semibold text-slate-900 hover:bg-sky-50 transition-colors border-t border-slate-100 flex items-center justify-center gap-1.5"
      >
        Ver timeline completo
      </button>
    </div>
  );
};

// Trigger soccer del Kanban: badge sin pill que abre con hover el popover
// "Línea de pases".
const SoccerBloqueoTrigger = ({ op, navigate }) => {
  const isBloqueado = op.bloqueoActor === 'bloqueado';
  const visual = ESTADO_STAGE_VISUAL[op.estado] || ESTADO_STAGE_VISUAL.apertura;
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          data-testid={`bloqueo-badge-${op.id}`}
          title="Ver línea de pases"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
          style={isBloqueado ? undefined : { background: visual.bg, color: visual.text }}
          className={`inline-flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-1 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-1 ${
            isBloqueado ? 'bg-red-50' : ''
          }`}
        >
          <BloqueoNameOnly actor={op.bloqueoActor} opId={op.id} tone textClassName="text-[11px]" iconClassName="w-3 h-3" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="p-0 w-auto border-slate-200 shadow-lg z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <LineaDePasesContent
          op={op}
          onNavigate={() => navigate(`/escribanos/operaciones/${op.id}?tab=timeline`)}
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export const BloqueoBadge = ({ op, size = 'sm', variant = 'default' }) => {
  const actor = op.bloqueoActor;
  const navigate = useNavigate();
  if (!actor) return null;
  const meta = bloqueoLabel[actor];
  if (!meta) return null;
  // Variante "soccer": "Pelota: Responsable" sin pill (sin borde, sin fondo),
  // sólo icono y nombre. Clickeable → abre el popover "Línea de pases".
  if (variant === 'soccer') {
    return <SoccerBloqueoTrigger op={op} navigate={navigate} />;
  }

  const tone = actor === 'bloqueado' ? BLOQUEO_TONE.red : BLOQUEO_TONE.neutral;
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const fontSize = size === 'sm' ? 'text-[10.5px]' : 'text-[11.5px]';

  return (
    <span
      data-testid={`bloqueo-badge-${op.id}`}
      title={op.bloqueoMotivo || meta.label}
      className={`inline-flex items-center gap-1.5 ${padding} rounded-full border ${tone.bg} ${tone.text} ${tone.border} ${fontSize} font-semibold whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
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

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          data-testid={`alert-chip-${op.id}`}
          aria-label={`Alerta ${cfg.label.toLowerCase()}`}
          title={`Alerta ${cfg.label.toLowerCase()}`}
          className="inline-flex items-center justify-center w-6 h-6 -m-1 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300 rounded"
        >
          <span className="grid place-items-center w-5 h-5 rounded-[7px] bg-destructive shadow-[0_2px_5px_rgba(229,86,75,0.35)]" aria-hidden>
            <ShieldAlert className="w-3 h-3 text-white" strokeWidth={2} />
          </span>
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
            <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.textClass}`}>
              Alerta {cfg.label.toLowerCase()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
              Prioridad {data.prioridad || cfg.priority}
            </span>
          </div>
          <div>
            <div className="text-[12.5px] font-semibold text-slate-900 leading-snug">Título</div>
            <div className="text-[11.5px] text-slate-900 leading-snug mt-0.5">{data.titulo}</div>
          </div>
          {data.impacto && (
            <div>
              <div className="text-[12.5px] font-semibold text-slate-900 leading-snug">Impacto</div>
              <div className="text-[11.5px] text-slate-700 leading-snug mt-0.5">{data.impacto}</div>
            </div>
          )}
          {data.accion && (
            <div className={`${cfg.softBg} border ${cfg.softBorder} rounded-md px-2.5 py-2`}>
              <div className="text-[12.5px] font-semibold text-slate-900 leading-snug">Acción sugerida</div>
              <div className={`text-[11.5px] ${cfg.textClass} leading-snug mt-0.5`}>{data.accion}</div>
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
  const isDone = tasksState.done.includes(op.id);
  const isInBoard = tasksState.pending.includes(op.id) || isDone;
  const accent = (ESTADO_STAGE_VISUAL[op.estado] || ESTADO_STAGE_VISUAL.apertura).accent;

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

  const onRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (tasksState.pending.includes(op.id)) dayTasks.removePending(op.id);
    else if (tasksState.done.includes(op.id)) dayTasks.removeDone(op.id);
  };

  return (
    <Link
      to={`/escribanos/operaciones/${op.id}`}
      draggable
      onDragStart={onDragStart}
      data-testid={`kanban-card-${op.id}`}
      style={{ borderLeft: `3px solid ${accent}` }}
      className={`block border border-[#EEEFF2] rounded-2xl p-[15px] transition-all group cursor-grab active:cursor-grabbing ${
        isDone
          ? 'bg-slate-50 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
          : isInBoard
          ? 'bg-[#FFFFFF0D] shadow-[0_6px_16px_rgba(16,24,40,0.09)] -translate-y-px'
          : 'bg-[#FFFFFF0D] shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-[11px]">
        {op.bloqueoActor ? (
          <BloqueoBadge op={op} variant="soccer" />
        ) : (
          <span aria-hidden />
        )}
        <AlertChip op={op} />
      </div>
      <div className="text-[15px] font-semibold text-slate-900 leading-snug truncate" title={op.direccion}>
        {op.direccion}
      </div>
      <div className="text-[12px] text-slate-400 mt-0.5 truncate">{jurisdiccionDe(op.barrio)}</div>

      {op.tareaEnCurso && (
        <div
          className={`mt-[13px] flex items-center text-[11px] rounded-[11px] pl-2.5 pr-1.5 py-[9px] transition-colors ${
            isInBoard
              ? 'gap-3 bg-slate-100 text-slate-700 border border-slate-200'
              : 'gap-2 text-slate-700 bg-[#F7F8FA] border border-transparent'
          }`}
          data-testid={`kanban-task-${op.id}`}
          title={isInBoard ? 'Ya está en tu día' : undefined}
        >
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 self-center ${
              isDone ? 'bg-emerald-500' : isInBoard ? 'pase-current-dot' : 'bg-slate-300'
            }`}
            aria-hidden
          />
          <span className="leading-snug flex-1 min-w-0">
            <span className="block text-[9.5px] uppercase tracking-[0.08em] font-semibold text-[#B3B8BF]">
              Tarea en curso
            </span>
            <span
              className={`block font-semibold truncate text-[12.5px] mt-0.5 ${isInBoard ? 'text-slate-900' : 'text-[#3A4048]'}`}
              title={op.tareaEnCursoFull || op.tareaEnCurso}
            >
              {op.tareaEnCurso}
            </span>
            {isInBoard && <span className="sr-only">Ya está en tu día</span>}
          </span>
          {isDone ? (
            <button
              type="button"
              onClick={onRemoveClick}
              data-testid={`kanban-remove-task-${op.id}`}
              title="Tarea completada"
              aria-label="Tarea completada"
              className="shrink-0 w-[26px] h-[26px] grid place-items-center rounded-[8px] transition-colors bg-emerald-50 border border-slate-200 text-emerald-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
            </button>
          ) : isInBoard ? (
            <button
              type="button"
              onClick={onRemoveClick}
              data-testid={`kanban-remove-task-${op.id}`}
              title="Quitar de mi día"
              aria-label="Quitar de mi día"
              className="shrink-0 w-[26px] h-[26px] grid place-items-center rounded-[8px] transition-colors bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2.4} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddClick}
              data-testid={`kanban-add-task-${op.id}`}
              title="Agregar a mi día"
              aria-label="Agregar a mi día"
              className="shrink-0 w-[26px] h-[26px] grid place-items-center rounded-[8px] transition-colors bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
            </button>
          )}
        </div>
      )}

      <div className="mt-[13px] h-[5px] rounded-full bg-[#EEF0F3] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${op.progreso}%`, background: accent }}
        />
      </div>

      <div className="mt-[13px] flex items-center justify-between gap-2">
        <PartiesPair vendedor={op.vendedor} comprador={op.comprador} opId={op.id} size="sm" withPopover />
        <ChevronRight className="w-4 h-4 text-[#C5C9CF] group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="mt-[11px] pt-[11px] border-t border-[#F1F2F4] flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-[11.5px] ${
            urgente ? 'text-destructive font-bold' : 'text-[#8A9099] font-medium'
          }`}
          title={`Firma tentativa ${op.firma}`}
        >
          <Clock className="w-3 h-3" />
          {op.diasFirma > 0 ? `${op.diasFirma}d` : op.diasFirma === 0 ? 'hoy' : `${Math.abs(op.diasFirma)}d`}
        </span>
        <span className="font-mono text-[11.5px] font-semibold text-[#B3B8BF] tracking-tight">{op.id}</span>
      </div>
    </Link>
  );
};

const Column = ({ hito, items }) => {
  const Icon = hito.icon;
  return (
    <div
      data-testid={`kanban-column-${hito.id}`}
      className="flex flex-col rounded-[18px] overflow-hidden"
    >
      <Link
        to={`/escribanos/operaciones?hito=${hito.id}`}
        data-testid={`kanban-column-header-${hito.id}`}
        className={`px-3.5 py-3 flex items-center gap-2.5 border-b-2 ${hito.borderColor} bg-white hover:bg-slate-50 transition-colors group`}
        title={`Ver todos los legajos en ${hito.label}`}
      >
        <span className={`w-[30px] h-[30px] rounded-[9px] grid place-items-center ${hito.iconColor}`}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-slate-900 leading-tight truncate">{hito.label}</div>
          <div className="text-[11px] text-[#A6ABB3] truncate">{hito.sub}</div>
        </div>
        <span
          className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#7A818B] tabular-nums"
          data-testid={`kanban-count-${hito.id}`}
        >
          {items.length}
        </span>
      </Link>
      <div className="py-2.5 flex flex-col gap-2.5 min-h-[331px] max-h-[585px] overflow-y-auto flex-1">
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

const InlineList = ({ operaciones }) => {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
        <table className="w-full text-[13px]" data-testid="legajos-inline-list">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
              {['Legajo', 'Estado', 'Tarea en curso', 'Partes', 'Firma', 'Riesgo', ''].map((h) => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operaciones.map((op, idx) => {
              const e = estadoLabel[op.estado];
              const r = riesgoLabel[op.riesgo];
              const riesgoShort = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }[op.riesgo] || op.riesgo;
              const urgente = op.diasFirma >= 0 && op.diasFirma <= 5;
              return (
                <tr
                  key={op.id}
                  data-testid={`inline-row-${op.id}`}
                  onClick={() => navigate(`/escribanos/operaciones/${op.id}`)}
                  className={`group border-b border-slate-100 last:border-0 hover:bg-sky-50/60 cursor-pointer transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <td className="px-3.5 py-3 align-top">
                    <div className="font-mono text-[10.5px] text-slate-500">{op.id}</div>
                    <div className="font-semibold text-slate-900 truncate max-w-[260px]">{op.direccion}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-500">{jurisdiccionDe(op.barrio)}</span>
                      {op.bloqueoActor && (
                        <>
                          <span className="text-slate-300">·</span>
                          <BloqueoBadge op={op} />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 align-top">
                    <StatusBadge variant={e.color}>{e.label}</StatusBadge>
                  </td>
                  <td className="px-3.5 py-3 align-top">
                    <div className="text-[9.5px] uppercase tracking-[0.06em] font-semibold text-slate-400">
                      Tarea en curso
                    </div>
                    <div className="text-[12.5px] font-semibold text-slate-800 max-w-[220px] truncate mt-0.5">
                      {op.tareaEnCursoFull || op.tareaEnCurso || '—'}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 align-top">
                    <PartiesPair vendedor={op.vendedor} comprador={op.comprador} opId={op.id} size="sm" />
                  </td>
                  <td className="px-3.5 py-3 align-top">
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-900 tabular-nums">{op.firma}</span>
                    </div>
                    <div className={`text-[10.5px] mt-0.5 ${urgente ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                      {op.diasFirma > 0 ? `en ${op.diasFirma}d` : op.diasFirma === 0 ? 'hoy' : `hace ${-op.diasFirma}d`}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 align-top">
                    {op.riesgo === 'bajo' ? (
                      <span className="text-[11px] text-slate-400">—</span>
                    ) : (
                      <StatusBadge variant={r.color}>{riesgoShort}</StatusBadge>
                    )}
                  </td>
                  <td className="px-3.5 py-3 align-top text-right">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-300 group-hover:text-slate-500">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RIESGO_ORDER = { alto: 0, medio: 1, bajo: 2 };

// Urgencia: firmas próximas primero; lo ya firmado/vencido (diasFirma negativo) al final.
const urgenciaKey = (op) => (op.diasFirma < 0 ? Infinity : op.diasFirma);

const SORTERS = {
  urgencia: (a, b) => urgenciaKey(a) - urgenciaKey(b),
  riesgo: (a, b) => (RIESGO_ORDER[a.riesgo] ?? 9) - (RIESGO_ORDER[b.riesgo] ?? 9),
};

export const LegajosKanban = ({ operaciones }) => {
  const [view, setView] = useState('kanban');
  const [actor, setActor] = useState('todos');
  const [stage, setStage] = useState('todas');
  const [sortBy, setSortBy] = useState('urgencia');

  // Conteo por actor (sólo legajos activos).
  const activas = operaciones.filter((o) => o.estado !== 'cerrado');
  const actorCounts = activas.reduce((acc, o) => {
    if (!o.bloqueoActor) return acc;
    acc[o.bloqueoActor] = (acc[o.bloqueoActor] || 0) + 1;
    return acc;
  }, {});
  const actorChips = [
    { id: 'todos', label: 'Todos', count: activas.length },
    ...Object.entries(bloqueoLabel)
      .map(([id, meta]) => ({ id, label: meta.short, count: actorCounts[id] || 0 }))
      .filter((c) => c.count > 0),
  ];

  const filtradas = actor === 'todos' ? operaciones : operaciones.filter((o) => o.bloqueoActor === actor);
  const columnas = HITOS.map((h) => ({
    hito: h,
    items: filtradas.filter((o) => h.states.includes(o.estado)),
  }));
  const totalActivos = filtradas.filter((o) => o.estado !== 'cerrado').length;

  // Solo para la vista Lista: filtro de etapa propio + orden.
  const porEtapa = stage === 'todas' ? filtradas : filtradas.filter((o) => HITO_MAP[stage]?.states.includes(o.estado));
  const listaOrdenada = [...porEtapa].sort(SORTERS[sortBy]);

  return (
    <div className="card-surface-lg p-6" data-testid="legajos-kanban">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-[18px]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="icon-chip" style={{ color: '#7C6CB8' }}>
            <FolderOpen className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </span>
          <h2 className="font-display font-semibold text-[19px] text-foreground leading-tight tracking-[-0.3px]">
            Legajos
          </h2>
          <span
            className="font-display font-bold text-[22px] text-[#C5C9CF] leading-none -ml-0.5 num-tabular"
            data-testid="kanban-activos-count"
          >
            {totalActivos}
          </span>
        </div>
        <div className="inline-flex bg-[#F3F4F6] rounded-[11px] p-[3px] gap-0.5" data-testid="legajos-view-toggle" role="tablist">
          <button
            role="tab"
            aria-selected={view === 'kanban'}
            data-testid="legajos-view-kanban"
            onClick={() => setView('kanban')}
            className={`px-4 py-[7px] text-[12.5px] font-semibold rounded-[9px] transition-colors ${
              view === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-[#9AA0A8] hover:text-foreground'
            }`}
          >
            Kanban
          </button>
          <button
            role="tab"
            aria-selected={view === 'lista'}
            data-testid="legajos-view-lista"
            onClick={() => setView('lista')}
            className={`px-4 py-[7px] text-[12.5px] font-semibold rounded-[9px] transition-colors ${
              view === 'lista' ? 'bg-card text-foreground shadow-sm' : 'text-[#9AA0A8] hover:text-foreground'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="mb-[22px] -mx-1 px-1 overflow-x-auto" data-testid="legajos-actor-filter">
        <div className="inline-flex items-center gap-2.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#B3B8BF] pr-1 whitespace-nowrap">
            ¿Quién tiene la pelota?
          </span>
          {actorChips.map((c) => {
            const isActive = actor === c.id;
            const hover = ACTOR_HOVER[c.id] || 'hover:border-slate-200 hover:bg-slate-50';
            return (
              <button
                key={c.id}
                type="button"
                data-testid={`actor-chip-${c.id}`}
                onClick={() => setActor(c.id)}
                style={isActive ? { background: '#242424' } : undefined}
                className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                  isActive ? 'text-white border-transparent' : `bg-white text-[#5C636D] border-[#ECEDF0] font-medium ${hover}`
                }`}
              >
                {c.label}
                <span
                  className={`text-[11px] font-bold rounded-full ${
                    isActive ? 'px-1.5 py-px bg-white/20' : 'text-[#9AA0A8]'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {columnas.map(({ hito, items }) => (
            <Column key={hito.id} hito={hito} items={items} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3" data-testid="lista-controls">
            <div className="inline-flex items-center gap-1.5 overflow-x-auto">
              {[{ id: 'todas', label: 'Todas' }, ...HITOS.map((h) => ({ id: h.id, label: h.label }))].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  data-testid={`lista-stage-${s.id}`}
                  onClick={() => setStage(s.id)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
                    stage === s.id ? 'bg-[#242424] text-white' : 'bg-white text-[#5C636D] border border-[#ECEDF0] hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-1.5 text-[12px] text-[#9AA0A8] shrink-0">
              Ordenar por
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                data-testid="lista-sort"
                className="font-semibold text-[#242424] bg-white border border-[#ECEDF0] rounded-md px-2 py-1 focus:outline-none"
              >
                <option value="urgencia">Urgencia (firma)</option>
                <option value="riesgo">Riesgo</option>
              </select>
            </div>
          </div>
          <InlineList operaciones={listaOrdenada} />
        </>
      )}
    </div>
  );
};

// Export para que OperacionesList pueda mapear hitoId → estados.
export const HITO_MAP = HITOS.reduce((acc, h) => {
  acc[h.id] = h;
  return acc;
}, {});
