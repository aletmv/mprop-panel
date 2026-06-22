import React, { useState } from 'react';
import { ChevronDown, MessageCircle, RotateCcw, X, Inbox, Check, AlertTriangle } from 'lucide-react';
import { Card, Pill, SectionLabel, StatusDot } from './OperacionDetailPrimitives';
import { operationalTasks, useOperationalTasks, todayDateString, operationalTaskBadge } from './operationalTasksStore';

// Memoria operativa del legajo — ver memory/OPERATIONAL_TASKS_ARCHITECTURE.md
// sección 9/10. Esto NO es "mostrar follow-ups": es la capa accionable del
// legajo, hoy poblada solo manualmente (subtype: 'follow_up', origin: 'manual'),
// pero pensada para que mañana también la pueblen reglas del sistema o IA
// (origin: 'system' | 'ai'). Por eso cada item siempre muestra su origin y
// subtype como badges, en vez de asumir que todo es "un seguimiento manual".
//
// No es el checklist duro (eso es op.estado/HITOS), no es la línea de pases
// (op.bloqueoActor/lineaDePases) y no es el Timeline (eventos narrativos) —
// esta vista no lee ni escribe ninguno de esos tres.

const ORIGIN_LABEL = { manual: 'Manual', system: 'Sistema', ai: 'IA' };
// Tono del badge compuesto (Pill) según severidad — sobrio, concentra la señal.
const BADGE_VARIANT = { critica: 'destructive', media: 'warning', null: 'muted' };
// Tono del icon-chip según severidad: la severidad de la alerta es la señal
// principal de la tarjeta, no el azul genérico de tarea operativa.
const ICON_CHIP_TONE = { critica: 'bg-red-50 text-red-600', media: 'bg-amber-50 text-amber-600', null: 'bg-sky-50 text-sky-600' };

const formatDateTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STATUS_META = {
  pending: { variant: 'info', label: 'Pendiente' },
  done: { variant: 'success', label: 'Completada' },
  cancelled: { variant: 'muted', label: 'Cancelada' },
};

const TaskMemoryItem = ({ task, onComplete, onCancel, onReopen }) => {
  const today = todayDateString();
  const statusMeta = STATUS_META[task.status] || STATUS_META.pending;
  const badge = operationalTaskBadge(task);
  return (
    <div
      data-testid={`op-task-memory-item-${task.id}`}
      className="px-4 py-3.5 flex items-start gap-3.5 hover:bg-slate-50/60 transition-colors"
    >
      <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 mt-0.5 ${ICON_CHIP_TONE[badge.severity]}`}>
        {badge.severity ? <AlertTriangle className="w-4 h-4" strokeWidth={1.8} /> : <MessageCircle className="w-4 h-4" strokeWidth={1.8} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <Pill variant={BADGE_VARIANT[badge.severity]}>{badge.label}</Pill>
          <Pill variant="muted">{ORIGIN_LABEL[task.origin] || task.origin}</Pill>
          {task.scheduledForDate === today && <Pill variant="info">En tu día</Pill>}
        </div>
        <div className={`text-sm font-medium text-slate-900 ${task.status !== 'pending' ? 'text-slate-500' : ''}`}>
          {task.title}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
          {task.relatedActorLabel && <span>Responsable: {task.relatedActorLabel}</span>}
          {task.relatedActorLabel && <span className="text-slate-300">·</span>}
          <span>creada {formatDateTime(task.createdAt)}</span>
          {task.completedAt && (
            <>
              <span className="text-slate-300">·</span>
              <span>completada {formatDateTime(task.completedAt)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusDot variant={statusMeta.variant} label={statusMeta.label} className="text-xs" />
        {task.status === 'pending' && (
          <>
            <button
              onClick={() => onComplete(task.id)}
              data-testid={`op-task-complete-${task.id}`}
              className="w-8 h-8 grid place-items-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
              title="Completar"
              aria-label="Completar"
            >
              <Check className="w-4 h-4" strokeWidth={2.4} />
            </button>
            <button
              onClick={() => onCancel(task.id)}
              data-testid={`op-task-cancel-${task.id}`}
              className="w-8 h-8 grid place-items-center rounded-lg bg-slate-100 text-slate-400 hover:bg-destructive-soft hover:text-destructive transition-colors"
              title="Cancelar"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
        {(task.status === 'done' || task.status === 'cancelled') && (
          <button
            onClick={() => onReopen(task.id)}
            data-testid={`op-task-reopen-${task.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-primary hover:border-primary transition-colors"
            title="Reabrir para hoy"
            aria-label="Reabrir para hoy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reabrir para hoy
          </button>
        )}
      </div>
    </div>
  );
};

export const OperationalTaskMemory = ({ op }) => {
  const allOperationalTasks = useOperationalTasks();
  const [showDone, setShowDone] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const tasks = allOperationalTasks.filter((t) => t.opId === op.id);
  const pending = tasks.filter((t) => t.status === 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const done = tasks.filter((t) => t.status === 'done').sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  const cancelled = tasks.filter((t) => t.status === 'cancelled');

  const handleComplete = (id) => operationalTasks.complete(id);
  const handleCancel = (id) => operationalTasks.cancel(id);
  const handleReopen = (id) => operationalTasks.reopen(id);

  return (
    <Card data-testid="operational-task-memory">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">Memoria operativa del legajo</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
          Acciones operativas para destrabar o avanzar este legajo. Pueden crearse manualmente o, a futuro, por
          reglas del sistema e IA. No reemplazan el checklist formal ni la línea de pases.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="px-5 py-10 flex flex-col items-center text-center" data-testid="op-task-memory-empty">
          <Inbox className="w-7 h-7 text-slate-300 mb-2" strokeWidth={1.5} />
          <div className="text-sm font-medium text-slate-700">Aún no hay memoria operativa para este legajo.</div>
          <div className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
            Las acciones operativas pueden crearse manualmente o, más adelante, por reglas del sistema e IA cuando
            detecten bloqueos, documentos pendientes o comunicaciones necesarias.
          </div>
        </div>
      ) : (
        <div>
          {pending.length > 0 && (
            <div data-testid="op-task-memory-pending">
              <div className="px-5 pt-3.5 pb-1.5">
                <SectionLabel>Pendientes · {pending.length}</SectionLabel>
              </div>
              <div className="divide-y divide-slate-100">
                {pending.map((t) => (
                  <TaskMemoryItem key={t.id} task={t} onComplete={handleComplete} onCancel={handleCancel} onReopen={handleReopen} />
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div className="border-t border-slate-100" data-testid="op-task-memory-done">
              <button
                onClick={() => setShowDone((v) => !v)}
                data-testid="op-task-memory-done-toggle"
                className="w-full px-5 py-3 flex items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors"
              >
                <SectionLabel>Completadas · {done.length}</SectionLabel>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDone ? '' : '-rotate-90'}`} />
              </button>
              {showDone && (
                <div className="divide-y divide-slate-100">
                  {done.map((t) => (
                    <TaskMemoryItem key={t.id} task={t} onComplete={handleComplete} onCancel={handleCancel} onReopen={handleReopen} />
                  ))}
                </div>
              )}
            </div>
          )}

          {cancelled.length > 0 && (
            <div className="border-t border-slate-100" data-testid="op-task-memory-cancelled">
              <button
                onClick={() => setShowCancelled((v) => !v)}
                data-testid="op-task-memory-cancelled-toggle"
                className="w-full px-5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors"
              >
                <span className="text-[11px] font-medium text-slate-400">Canceladas · {cancelled.length}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showCancelled ? '' : '-rotate-90'}`} />
              </button>
              {showCancelled && (
                <div className="divide-y divide-slate-100 opacity-75">
                  {cancelled.map((t) => (
                    <TaskMemoryItem key={t.id} task={t} onComplete={handleComplete} onCancel={handleCancel} onReopen={handleReopen} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
