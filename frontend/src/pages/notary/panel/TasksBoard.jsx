import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GripVertical, X, Inbox, Clock, ChevronDown, RotateCcw, Check, ListChecks, Trash2,
} from 'lucide-react';
import { dayTasks, useDayTasks } from './dayTasksStore';
import { operationalTasks, useOperationalTasks, todayDateString, dateStringFromISO } from './operationalTasksStore';
import { taskCardPresentation } from './taskCardPresentation';
import { TaskCard } from './TaskCard';
import { DND_TYPE } from './dndTypes';
import { AlertChip } from './Kanban';

// Color de acento por etapa (mismo origen que HITOS/estadoLabel) — solo lectura,
// no agrega datos nuevos, solo decide qué token visual mostrar.
const ESTADO_ACCENT = {
  apertura: 'var(--stage-inicio)',
  documentos: 'var(--stage-expediente)',
  analisis: 'var(--stage-diligence)',
  observado: 'var(--stage-diligence)',
  'en-firma': 'var(--stage-precierre)',
  cerrado: 'var(--stage-cierre)',
};

const TaskItem = ({ op, idx, dragIdx, onDragStart, onDragOver, onDragEnd, onOpen }) => {
  const urgente = op.diasFirma >= 0 && op.diasFirma <= 5;
  const titulo = op.tareaEnCursoFull || op.tareaEnCurso || 'Tarea sin descripción';
  const accent = ESTADO_ACCENT[op.estado] || 'var(--stage-inicio)';
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, idx)}
      onDragOver={(e) => onDragOver(e, idx)}
      onDragEnd={onDragEnd}
      data-testid={`task-item-${op.id}`}
      className={`group relative shrink-0 overflow-hidden flex items-center gap-3.5 bg-white border border-[#EEEFF2] rounded-2xl pl-5 pr-4 py-4 hover:border-[#DDE6F5] hover:shadow-sm transition-all cursor-grab active:cursor-grabbing snap-start ${
        dragIdx === idx ? 'opacity-50' : ''
      }`}
    >
      <span className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-full" style={{ background: accent }} />
      <span className="flex items-center justify-center w-5 text-slate-300 group-hover:text-slate-500 shrink-0 self-center">
        <GripVertical className="w-4 h-4" />
      </span>
      <button onClick={() => onOpen(op.id)} data-testid={`task-open-${op.id}`} className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className="text-[14.5px] font-semibold text-slate-900 leading-snug">{titulo}</span>
          <AlertChip op={op} size="md" />
        </div>
        <div className="text-[12.5px] text-slate-500 mt-1 truncate">
          {op.direccion}, {op.barrio}
        </div>
        <div className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-2">
          <span className="font-semibold text-slate-500">{op.id}</span>
          <span className="text-slate-300">·</span>
          <span className={`inline-flex items-center gap-1 ${urgente ? 'text-red-600 font-semibold' : ''}`}>
            <Clock className="w-3 h-3" />
            {op.diasFirma > 0
              ? `${op.diasFirma}d a firma`
              : op.diasFirma === 0
              ? 'firma hoy'
              : `firmado hace ${Math.abs(op.diasFirma)}d`}
          </span>
        </div>
      </button>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => dayTasks.complete(op.id)}
          data-testid={`task-complete-${op.id}`}
          title="Marcar como completada"
          aria-label="Marcar como completada"
          className="w-9 h-9 grid place-items-center rounded-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
        >
          <Check className="w-[18px] h-[18px]" strokeWidth={2.4} />
        </button>
        <button
          onClick={() => dayTasks.removePending(op.id)}
          data-testid={`task-remove-${op.id}`}
          title="Quitar de mi día"
          aria-label="Quitar de mi día"
          className="w-9 h-9 grid place-items-center rounded-[11px] bg-slate-100 text-slate-400 hover:bg-destructive-soft hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
};

const DoneItem = ({ op }) => {
  const titulo = op.tareaEnCursoFull || op.tareaEnCurso || 'Tarea sin descripción';
  return (
    <li
      data-testid={`done-item-${op.id}`}
      className="flex items-center gap-3.5 bg-[#F7F8FA] rounded-2xl px-4 py-3.5"
    >
      <span className="w-[30px] h-[30px] rounded-[9px] bg-slate-100 text-slate-400 grid place-items-center shrink-0">
        <Check className="w-4 h-4" strokeWidth={2.4} />
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-slate-500 bg-slate-100">
          Proceso
        </span>
        <div className="text-[14px] font-medium text-slate-400 line-through leading-snug mt-1">{titulo}</div>
        <div className="text-[12px] text-slate-400 mt-0.5 truncate">
          <span className="font-mono">{op.id}</span> · {op.direccion}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => dayTasks.uncomplete(op.id)}
          data-testid={`task-restore-${op.id}`}
          title="Restaurar"
          aria-label="Restaurar"
          className="w-8 h-8 grid place-items-center rounded-[10px] bg-white border border-[#ECEDF0] text-slate-400 hover:text-primary transition-colors"
        >
          <RotateCcw className="w-[15px] h-[15px]" />
        </button>
      </div>
    </li>
  );
};

export const TasksBoard = ({ operaciones }) => {
  const navigate = useNavigate();
  const { pending, done } = useDayTasks();
  const [isOver, setIsOver] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [showDone, setShowDone] = useState(true);
  const overIdxRef = useRef(null);

  const opMap = operaciones.reduce((acc, o) => {
    acc[o.id] = o;
    return acc;
  }, {});
  const pendingTasks = pending.filter((id) => opMap[id]);
  const doneTasks = done.filter((id) => opMap[id]);

  // OperationalTask subtype: 'follow_up'. "Tareas del día" es una vista
  // filtrada por agenda, no "todas las que existen" — ver
  // memory/OPERATIONAL_TASKS_ARCHITECTURE.md sección 7.
  //
  // Pendientes de hoy: por scheduledForDate (cuándo se planeó trabajarla).
  // Completadas hoy: por completedAt (cuándo efectivamente se completó), NO
  // por scheduledForDate — una tarea agendada para hoy pero completada ayer
  // (o agendada para otro día y completada hoy) debe filtrarse por el
  // momento real de completado, no por la agenda original.
  // Tareas operativas de HOY — cualquier subtype (follow_up, review, …), no solo
  // follow_up. Una task 'review' creada al "Resolver" una alerta debe aparecer
  // acá igual que un seguimiento.
  const allOperationalTasks = useOperationalTasks();
  const today = todayDateString();
  const pendingFollowUps = allOperationalTasks.filter((t) => t.status === 'pending' && t.scheduledForDate === today);
  const doneFollowUpsToday = allOperationalTasks.filter(
    (t) => t.status === 'done' && t.completedAt && dateStringFromISO(t.completedAt) === today
  );

  const handleDragOverBoard = (e) => {
    if (![...e.dataTransfer.types].includes(DND_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isOver) setIsOver(true);
  };
  const handleDragLeaveBoard = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsOver(false);
  };
  const handleDropBoard = (e) => {
    setIsOver(false);
    const opId = e.dataTransfer.getData(DND_TYPE);
    if (!opId || !opMap[opId]) return;
    e.preventDefault();
    dayTasks.addPending(opId);
  };

  // Reorder vertical dentro del board.
  const onItemDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/x-mp-task-idx', String(idx));
  };
  const onItemDragOver = (e, idx) => {
    if (dragIdx == null) return;
    e.preventDefault();
    overIdxRef.current = idx;
  };
  const onItemDragEnd = () => {
    if (dragIdx != null && overIdxRef.current != null) {
      dayTasks.reorderPending(dragIdx, overIdxRef.current);
    }
    setDragIdx(null);
    overIdxRef.current = null;
  };

  return (
    <div
      data-testid="tasks-board"
      onDragOver={handleDragOverBoard}
      onDragLeave={handleDragLeaveBoard}
      onDrop={handleDropBoard}
      className={`card-surface-lg p-6 flex flex-col transition-all ${
        isOver ? 'ring-2 ring-primary/40 border-primary/40 bg-primary/[0.02]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-[18px]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="icon-chip">
            <ListChecks className="w-[18px] h-[18px]" strokeWidth={1.9} />
          </span>
          <h2 className="font-display font-semibold text-[19px] text-foreground leading-tight tracking-[-0.3px]">
            Tareas del día
          </h2>
          <span
            className="font-display font-bold text-[22px] text-[#C5C9CF] leading-none -ml-0.5 num-tabular"
            data-testid="tasks-pending-count"
          >
            {pendingTasks.length}
          </span>
        </div>
        {pendingTasks.length > 0 && (
          <button
            onClick={() => dayTasks.clearPending()}
            data-testid="tasks-clear-all"
            title="Vaciar pendientes"
            aria-label="Vaciar pendientes"
            className="shrink-0 w-7 h-7 grid place-items-center rounded-[8px] text-[#A6ABB3] hover:text-destructive hover:bg-destructive-soft transition-colors"
          >
            <Trash2 className="w-[15px] h-[15px]" strokeWidth={2} />
          </button>
        )}
      </div>

      {pendingTasks.length === 0 ? (
        <div
          data-testid="tasks-empty"
          className={`flex-1 min-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6 py-8 transition-colors ${
            isOver ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/30 text-muted-foreground'
          }`}
        >
          <Inbox className="w-7 h-7 mb-2" strokeWidth={1.5} />
          <div className="text-[13px] font-semibold">
            {isOver ? 'Soltá para sumar a tu día' : 'Sin tareas pendientes'}
          </div>
          <div className="text-[11.5px] mt-1 opacity-80">
            Arrastrá una card del tablero o presioná el + en su «Tarea en curso»
          </div>
        </div>
      ) : (
        <ol
          className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1 snap-y snap-mandatory scroll-pt-[2px]"
          data-testid="tasks-list"
        >
          {pendingTasks.map((opId, idx) => (
            <TaskItem
              key={opId}
              op={opMap[opId]}
              idx={idx}
              dragIdx={dragIdx}
              onDragStart={onItemDragStart}
              onDragOver={onItemDragOver}
              onDragEnd={onItemDragEnd}
              onOpen={(id) => navigate(`/escribanos/operaciones/${id}`)}
            />
          ))}
        </ol>
      )}

      {pendingFollowUps.length > 0 && (
        <div className="mt-3 pt-1" data-testid="followups-section">
          <div className="flex items-baseline gap-2 mb-2.5 pr-1">
            <span className="text-[13px] font-semibold leading-tight text-[#7A818B]">Tareas operativas</span>
            <span
              className="text-[13px] font-bold leading-tight text-[#C5C9CF] num-tabular"
              data-testid="followups-pending-count"
            >
              {pendingFollowUps.length}
            </span>
          </div>
          <ul className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1" data-testid="followups-list">
            {pendingFollowUps.map((task) => (
              <TaskCard
                key={task.id}
                view={taskCardPresentation(task, opMap[task.opId])}
                onComplete={operationalTasks.complete}
                onCancel={operationalTasks.cancel}
              />
            ))}
          </ul>
        </div>
      )}

      {(doneTasks.length > 0 || doneFollowUpsToday.length > 0) && (
        <div className="mt-3 pt-1" data-testid="done-section">
          <button
            onClick={() => setShowDone((v) => !v)}
            data-testid="done-toggle"
            className="w-full flex items-center justify-between gap-2 group pr-1 mb-3"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold leading-tight text-[#7A818B]">
                Completadas hoy
              </span>
              <span
                className="text-[13px] font-bold leading-tight text-[#C5C9CF] num-tabular"
                data-testid="tasks-done-count"
              >
                {doneTasks.length + doneFollowUpsToday.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showDone && doneTasks.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); dayTasks.clearDone(); }}
                  data-testid="done-clear-all"
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#A6ABB3] hover:text-[#7A818B] transition-colors"
                >
                  Limpiar
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${showDone ? '' : '-rotate-90'}`}
              />
            </div>
          </button>
          {showDone && (
            <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1" data-testid="done-list">
              {doneTasks.map((opId) => (
                <DoneItem key={opId} op={opMap[opId]} />
              ))}
              {doneFollowUpsToday.map((task) => (
                <TaskCard
                  key={task.id}
                  view={taskCardPresentation(task, opMap[task.opId])}
                  onReopen={operationalTasks.reopen}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
