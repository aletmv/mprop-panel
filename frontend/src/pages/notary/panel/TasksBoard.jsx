import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Inbox, ChevronDown, RotateCcw, Check, ListChecks, Trash2, FolderOpen,
} from 'lucide-react';
import { dayTasks, useDayTasks } from './dayTasksStore';
import { operationalTasks, useOperationalTasks, todayDateString, dateStringFromISO } from './operationalTasksStore';
import { taskCardPresentation, stripTrailingDot, shortAddress } from './taskCardPresentation';
import { TaskCard } from './TaskCard';
import { DND_TYPE } from './dndTypes';

// Acento lateral de tarea formal = color del hito/etapa (op.estado), reusando
// los tokens --stage-* del sistema de hitos (mismos que Kanban/estadoLabel).
// Representa el proceso, no severidad. (Relación existente: op.estado → etapa.)
const ESTADO_ACCENT = {
  apertura: 'var(--stage-inicio)',
  documentos: 'var(--stage-expediente)',
  analisis: 'var(--stage-diligence)',
  observado: 'var(--stage-diligence)',
  'en-firma': 'var(--stage-precierre)',
  cerrado: 'var(--stage-cierre)',
};

// Renderer ÚNICO de tarea formal/de proceso — pending y done comparten estructura
// e identidad visual (ícono carpeta + título + dirección·MP-ID + acciones). El
// estado solo cambia el TRATAMIENTO (atenuación/tachado) y la acción disponible;
// no reordena campos ni cambia íconos de identidad. No migra formal a
// OperationalTask, no usa store nuevo.
const FormalTaskRow = ({ op, status, onOpen, onComplete, onCancel, onReopen, idx, dragIdx, onDragStart, onDragOver, onDragEnd }) => {
  const titulo = stripTrailingDot(op.tareaEnCursoFull || op.tareaEnCurso || 'Tarea sin descripción');
  const done = status === 'done';
  const dragProps = done
    ? {}
    : {
        draggable: true,
        onDragStart: (e) => onDragStart(e, idx),
        onDragOver: (e) => onDragOver(e, idx),
        onDragEnd,
      };
  return (
    <li
      {...dragProps}
      data-testid={done ? `done-item-${op.id}` : `task-item-${op.id}`}
      className={`relative shrink-0 overflow-hidden flex items-center gap-3.5 rounded-2xl pl-5 pr-4 py-3.5 snap-start transition-all ${
        done
          ? 'bg-[#F7F8FA] border border-transparent opacity-80'
          : `bg-white border border-[#EEEFF2] hover:border-[#DDE6F5] hover:shadow-sm cursor-grab active:cursor-grabbing ${dragIdx === idx ? 'opacity-50' : ''}`
      }`}
    >
      {/* Acento lateral = color del hito/etapa (op.estado) = identidad de proceso,
          no severidad. Presente en pending y done; done lo atenúa vía opacidad. */}
      <span
        className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-full"
        style={{ background: ESTADO_ACCENT[op.estado] || 'var(--stage-inicio)' }}
        aria-hidden
      />
      {/* Ícono de identidad: tarea formal/de proceso (carpeta). Atenuado en done.
          El estado completado se comunica por atenuación/tachado, no por este ícono. */}
      <span className={`flex items-center justify-center w-5 shrink-0 self-center ${done ? 'text-slate-300' : 'text-slate-400'}`}>
        <FolderOpen className="w-4 h-4" />
      </span>
      <button onClick={() => onOpen?.(op.id)} data-testid={`task-open-${op.id}`} className="flex-1 min-w-0 text-left">
        <div className={`text-[14.5px] font-semibold leading-snug ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {titulo}
        </div>
        <div className="text-[12.5px] text-slate-400 mt-1 truncate">
          {shortAddress(op.direccion)} · <span className="font-mono font-semibold">{op.id}</span>
        </div>
      </button>
      <div className="flex items-center gap-1.5 shrink-0">
        {done ? (
          <button
            onClick={() => onReopen(op.id)}
            data-testid={`task-restore-${op.id}`}
            title="Reabrir tarea"
            aria-label="Reabrir tarea"
            className="w-9 h-9 grid place-items-center rounded-[11px] bg-white border border-[#ECEDF0] text-slate-400 hover:text-primary transition-colors"
          >
            <RotateCcw className="w-[18px] h-[18px]" />
          </button>
        ) : (
          <>
            <button
              onClick={() => onComplete(op.id)}
              data-testid={`task-complete-${op.id}`}
              title="Marcar como completada"
              aria-label="Marcar como completada"
              className="w-9 h-9 grid place-items-center rounded-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
            >
              <Check className="w-[18px] h-[18px]" strokeWidth={2.4} />
            </button>
            <button
              onClick={() => onCancel(op.id)}
              data-testid={`task-remove-${op.id}`}
              title="Quitar de mi día"
              aria-label="Quitar de mi día"
              className="w-9 h-9 grid place-items-center rounded-[11px] bg-slate-100 text-slate-400 hover:bg-destructive-soft hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
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
  // "Limpiar" oculta las operativas completadas de ESTA vista sin borrarlas del
  // store (no remove/cancel). Estado local de UI; la memoria queda en Operativa.
  const [hiddenOpDoneIds, setHiddenOpDoneIds] = useState(() => new Set());
  const overIdxRef = useRef(null);
  // Drag/reorder de "Tareas operativas" pending — estado independiente del de
  // tareas formales (dragIdx/overIdxRef arriba), para que un drag iniciado en
  // una sección nunca reordene la otra.
  const [opDragIdx, setOpDragIdx] = useState(null);
  const opOverIdxRef = useRef(null);

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
  // Operativas completadas hoy aún visibles (las ocultadas por "Limpiar" siguen
  // en el store, solo se filtran de la vista).
  const visibleDoneFollowUps = doneFollowUpsToday.filter((t) => !hiddenOpDoneIds.has(t.id));

  // "Limpiar" completadas de hoy: formales por su mecanismo existente
  // (dayTasks.clearDone); operativas se ocultan localmente (sin borrar memoria).
  const handleClearDone = () => {
    dayTasks.clearDone();
    setHiddenOpDoneIds(new Set(visibleDoneFollowUps.map((t) => t.id)));
  };

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

  // Reorder vertical de "Tareas operativas" pending. Mismo patrón que arriba,
  // pero opera sobre ids (operationalTasksStore es un array plano de tasks, no
  // un array de ids como dayTasks.pending) y persiste vía reorderPending(orderedIds).
  const onOpItemDragStart = (e, idx) => {
    setOpDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/x-mp-optask-idx', String(idx));
  };
  const onOpItemDragOver = (e, idx) => {
    if (opDragIdx == null) return;
    e.preventDefault();
    opOverIdxRef.current = idx;
  };
  const onOpItemDragEnd = () => {
    if (opDragIdx != null && opOverIdxRef.current != null && opDragIdx !== opOverIdxRef.current) {
      const reordered = [...pendingFollowUps];
      const [moved] = reordered.splice(opDragIdx, 1);
      reordered.splice(opOverIdxRef.current, 0, moved);
      operationalTasks.reorderPending(reordered.map((t) => t.id));
    }
    setOpDragIdx(null);
    opOverIdxRef.current = null;
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
            <FormalTaskRow
              key={opId}
              op={opMap[opId]}
              status="pending"
              idx={idx}
              dragIdx={dragIdx}
              onDragStart={onItemDragStart}
              onDragOver={onItemDragOver}
              onDragEnd={onItemDragEnd}
              onComplete={dayTasks.complete}
              onCancel={dayTasks.removePending}
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
            {pendingFollowUps.map((task, idx) => (
              <TaskCard
                key={task.id}
                view={taskCardPresentation(task, opMap[task.opId])}
                onComplete={operationalTasks.complete}
                onCancel={operationalTasks.cancel}
                draggable
                isDragging={opDragIdx === idx}
                onDragStart={(e) => onOpItemDragStart(e, idx)}
                onDragOver={(e) => onOpItemDragOver(e, idx)}
                onDragEnd={onOpItemDragEnd}
              />
            ))}
          </ul>
        </div>
      )}

      {(doneTasks.length > 0 || visibleDoneFollowUps.length > 0) && (
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
                {doneTasks.length + visibleDoneFollowUps.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showDone && (doneTasks.length > 0 || visibleDoneFollowUps.length > 0) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleClearDone(); }}
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
                <FormalTaskRow
                  key={opId}
                  op={opMap[opId]}
                  status="done"
                  onReopen={dayTasks.uncomplete}
                  onOpen={(id) => navigate(`/escribanos/operaciones/${id}`)}
                />
              ))}
              {visibleDoneFollowUps.map((task) => (
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
