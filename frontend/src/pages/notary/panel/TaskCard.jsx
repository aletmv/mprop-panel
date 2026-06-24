import React from 'react';
import { ShieldAlert, AlertTriangle, MessageCircle, ClipboardList, Check, X, RotateCcw } from 'lucide-react';

// TaskCard F1 — renderer compacto unificado de OperationalTask.
// Contrato: memory/TASKCARD_F1_CONTRACT.md.
// - tipo = forma del ícono (sin badge textual visible) · severidad = color/tono del ícono
// - íconos de revisión reutilizados de la card de Alertas (Dashboard.jsx): ShieldAlert
//   (crítica) / AlertTriangle (media o sin severidad) — no se inventa ícono nuevo
// - sin role pill: el rol se integra al título visible (`view.displayTitle`, ver
//   taskCardPresentation.buildDisplayTitle); sin animación de rol por ahora
// - acciones icon-only con aria-label/title · cancel != remove · done sin eliminar
// - pending/done/cancelled comparten estructura; done/cancelled atenúan (no reordenan)
// - drag opcional (draggable/onDragStart/onDragOver/onDragEnd/isDragging): solo wiring,
//   la lógica de reorder vive en TasksBoard (igual que onComplete/onCancel)
// - portable: no contiene lógica de agrupación ni de subtasks (solo dibuja una card del view-model)

// Severidad → tono del ícono. Las tareas operativas NO usan acento lateral: el
// border/acento lateral es identidad de tarea formal/proceso, no de severidad.
// La severidad persiste vía tono; done/cancelled la atenúan por opacidad del contenedor.
const ICON_TONE = { critica: 'text-red-500', media: 'text-amber-500', null: 'text-sky-400' };

// Tipo → forma del ícono. Revisión varía de ícono según severidad (mismos íconos
// que usa la card de Alertas); seguimiento/tarea no tienen severidad en el modelo
// (ver taskCardPresentation), así que su ícono es fijo.
const iconForType = (type, sev) => {
  if (type === 'revision') return sev === 'critica' ? ShieldAlert : AlertTriangle;
  if (type === 'seguimiento') return MessageCircle;
  return ClipboardList;
};

const IconBtn = ({ onClick, title, children, className }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`w-9 h-9 grid place-items-center rounded-[11px] transition-colors ${className}`}
  >
    {children}
  </button>
);

export const TaskCard = ({
  view, onComplete, onReopen, onCancel,
  // Drag opcional (reorder de pending) — la lógica vive en TasksBoard; TaskCard
  // solo aplica los handlers/estilos que recibe, igual que onComplete/onCancel.
  draggable, onDragStart, onDragOver, onDragEnd, isDragging,
}) => {
  const sev = view.severity; // 'critica' | 'media' | null
  const Icon = iconForType(view.type, sev);
  // Texto del tipo+severidad, solo accesible (title/aria-label) — no se pinta visible.
  const iconTitle = sev === 'critica' ? `${view.typeLabel} crítica`
    : sev === 'media' ? `${view.typeLabel} media`
    : view.typeLabel;
  const done = view.status === 'done';
  const cancelled = view.status === 'cancelled';
  const atenuado = done || cancelled;
  // Borde de perímetro (NO lateral) solo para crítica — distinto de §0/identidad de
  // tarea formal. Atenuado/cancelled mantiene el mismo border-red; la opacidad del
  // contenedor ya lo atenúa, sin necesidad de un tono de borde distinto.
  const critica = sev === 'critica';

  return (
    <li
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      data-testid={`taskcard-${view.id}`}
      className={`relative shrink-0 overflow-hidden flex items-center gap-3.5 rounded-2xl pl-5 pr-4 py-3.5 snap-start transition-all ${
        atenuado
          ? `bg-[#F7F8FA] border opacity-80 ${critica ? 'border-red-300' : 'border-transparent'}`
          : critica
            ? 'bg-red-50/30 border border-red-300 ring-1 ring-red-100 hover:border-red-400'
            : 'bg-white border border-[#EEEFF2] hover:border-[#DDE6F5] hover:shadow-sm'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* ícono = tipo + severidad (sin texto visible); accesible vía title/aria-label.
          Sin badge/sombreado, sin acento lateral (eso es identidad de tarea formal). */}
      <span
        className={`flex items-center justify-center w-5 shrink-0 self-center ${ICON_TONE[sev]}`}
        title={iconTitle}
        aria-label={iconTitle}
        role="img"
      >
        <Icon className="w-4 h-4" />
      </span>

      <div className="flex-1 min-w-0">
        <div className={`text-[14.5px] font-semibold leading-snug ${atenuado ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {view.displayTitle}
        </div>
        {(view.legajoId || view.addressLine) && (
          <div className="text-[12.5px] text-slate-400 mt-1 truncate">
            {view.addressLine ? `${view.addressLine} · ` : ''}<span className="font-mono font-semibold">{view.legajoId}</span>
          </div>
        )}
      </div>

      {/* acciones icon-only (texto solo en aria-label/title) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {view.status === 'pending' && (
          <>
            <IconBtn
              onClick={() => onComplete?.(view.id)}
              title="Completar tarea"
              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
            >
              <Check className="w-[18px] h-[18px]" strokeWidth={2.4} />
            </IconBtn>
            <IconBtn
              onClick={() => onCancel?.(view.id)}
              title="Cancelar tarea"
              className="bg-slate-100 text-slate-400 hover:bg-destructive-soft hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </IconBtn>
          </>
        )}
        {(done || cancelled) && (
          <IconBtn
            onClick={() => onReopen?.(view.id)}
            title="Reabrir tarea"
            className="bg-white border border-[#ECEDF0] text-slate-400 hover:text-primary"
          >
            <RotateCcw className="w-[18px] h-[18px]" />
          </IconBtn>
        )}
      </div>
    </li>
  );
};
