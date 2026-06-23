import React from 'react';
import { ShieldAlert, MessageCircle, Check, X, RotateCcw } from 'lucide-react';

// TaskCard F1 — renderer compacto unificado de OperationalTask.
// Contrato: memory/TASKCARD_F1_CONTRACT.md.
// - badge = TIPO solo · severidad = ícono(ShieldAlert)+acento+tono (NO badge de alerta completo)
// - rol corto visible (semibold, neutral, sin pill); animación solo si rol = Escribanía && pending
// - acciones icon-only con aria-label/title · cancel != remove · done sin eliminar
// - pending/done/cancelled comparten estructura; done/cancelled atenúan (no reordenan)
// - portable: no contiene lógica de agrupación ni de subtasks (solo dibuja una card del view-model)

// Severidad → tratamiento visual. La severidad persiste en todos los estados;
// done/cancelled solo la atenúan por opacidad del contenedor.
const ACCENT = { critica: 'bg-red-400', media: 'bg-amber-400', null: 'bg-sky-300' };
const ICON_TONE = { critica: 'text-red-500', media: 'text-amber-500', null: 'text-sky-400' };
const BADGE_TONE = {
  critica: 'text-red-700 bg-red-50',
  media: 'text-amber-700 bg-amber-50',
  null: 'text-sky-600 bg-sky-50',
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

export const TaskCard = ({ view, onComplete, onReopen, onCancel }) => {
  const sev = view.severity; // 'critica' | 'media' | null
  const Icon = sev ? ShieldAlert : MessageCircle;
  const done = view.status === 'done';
  const cancelled = view.status === 'cancelled';
  const atenuado = done || cancelled;
  // Animación SOLO para rol Escribanía y task pending/active (ver contrato §2.1).
  const rolePulse = view.roleLabel === 'Escribanía' && view.status === 'pending';

  return (
    <li
      data-testid={`taskcard-${view.id}`}
      className={`relative shrink-0 overflow-hidden flex items-center gap-3.5 rounded-2xl pl-5 pr-4 py-3.5 snap-start transition-all ${
        atenuado ? 'bg-[#F7F8FA] border border-transparent opacity-80' : 'bg-white border border-[#EEEFF2] hover:border-[#DDE6F5] hover:shadow-sm'
      }`}
    >
      {/* acento lateral por severidad (persiste en todos los estados) */}
      <span className={`absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-full ${ACCENT[sev]}`} aria-hidden />

      {/* ícono de criticidad: solo el ícono (ShieldAlert), sin badge/sombreado */}
      <span className={`flex items-center justify-center w-5 shrink-0 self-center ${ICON_TONE[sev]}`}>
        <Icon className="w-4 h-4" />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${BADGE_TONE[sev]}`}>
            {view.typeLabel}
          </span>
          {view.roleLabel && (
            <span className={`text-[11px] font-semibold text-slate-500 shrink-0 ${rolePulse ? 'task-role-pulse' : ''}`}>
              {view.roleLabel}
            </span>
          )}
        </div>
        <div className={`text-[14.5px] font-semibold leading-snug mt-1 ${atenuado ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {view.title}
        </div>
        {(view.legajoId || view.addressLine) && (
          <div className="text-[12.5px] text-slate-400 mt-1 truncate">
            <span className="font-mono">{view.legajoId}</span>{view.addressLine ? ` · ${view.addressLine}` : ''}
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
