import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GripVertical, X, Inbox, Clock, ChevronDown, CheckCircle2, RotateCcw, Check,
} from 'lucide-react';
import { dayTasks, useDayTasks } from './dayTasksStore';
import { DND_TYPE } from './dndTypes';
import { AlertChip } from './Kanban';

const TaskItem = ({ op, idx, dragIdx, onDragStart, onDragOver, onDragEnd, onOpen }) => {
  const urgente = op.diasFirma >= 0 && op.diasFirma <= 5;
  const titulo = op.tareaEnCursoFull || op.tareaEnCurso || 'Tarea sin descripción';
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, idx)}
      onDragOver={(e) => onDragOver(e, idx)}
      onDragEnd={onDragEnd}
      data-testid={`task-item-${op.id}`}
      className={`group flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing ${
        dragIdx === idx ? 'opacity-50' : ''
      }`}
    >
      <span className="flex items-center justify-center w-5 text-slate-300 group-hover:text-slate-500 shrink-0 self-center">
        <GripVertical className="w-4 h-4" />
      </span>
      <button onClick={() => onOpen(op.id)} data-testid={`task-open-${op.id}`} className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className="text-[13.5px] font-semibold text-slate-900 leading-snug">{titulo}</span>
          <AlertChip op={op} size="md" />
        </div>
        <div className="text-[11.5px] text-slate-500 mt-1 truncate">
          {op.direccion}, {op.barrio}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
          <span className="font-mono">{op.id}</span>
          <span className="text-slate-300">·</span>
          <Clock className="w-3 h-3" />
          <span className={urgente ? 'text-red-600 font-semibold' : ''}>
            {op.diasFirma > 0
              ? `${op.diasFirma}d a firma`
              : op.diasFirma === 0
              ? 'firma hoy'
              : `firmado hace ${Math.abs(op.diasFirma)}d`}
          </span>
        </div>
      </button>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => dayTasks.complete(op.id)}
          data-testid={`task-complete-${op.id}`}
          title="Marcar como completada"
          aria-label="Marcar como completada"
          className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.4} />
        </button>
        <button
          onClick={() => dayTasks.removePending(op.id)}
          data-testid={`task-remove-${op.id}`}
          title="Quitar de mi día"
          aria-label="Quitar de mi día"
          className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:text-destructive hover:bg-destructive-soft transition-colors"
        >
          <X className="w-3.5 h-3.5" />
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
      className="group flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5"
    >
      <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center shrink-0 mt-0.5">
        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-500 line-through leading-snug">{titulo}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
          <span className="font-mono">{op.id}</span> · {op.direccion}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => dayTasks.uncomplete(op.id)}
          data-testid={`task-restore-${op.id}`}
          title="Restaurar"
          aria-label="Restaurar"
          className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => dayTasks.removeDone(op.id)}
          data-testid={`done-remove-${op.id}`}
          title="Eliminar"
          aria-label="Eliminar"
          className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:text-destructive hover:bg-destructive-soft transition-colors"
        >
          <X className="w-3.5 h-3.5" />
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
      className={`card-surface p-5 flex flex-col transition-all ${
        isOver ? 'ring-2 ring-primary/40 border-primary/40 bg-primary/[0.02]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="font-display font-bold text-[20px] text-foreground leading-tight">Tareas del día</h2>
          <span className="text-slate-400 text-[16px]">·</span>
          <span className="text-slate-400 font-semibold text-[15px] num-tabular" data-testid="tasks-pending-count">
            {pendingTasks.length}
          </span>
        </div>
        {pendingTasks.length > 0 && (
          <button
            onClick={() => dayTasks.clearPending()}
            data-testid="tasks-clear-all"
            className="text-[11px] font-semibold text-muted-foreground hover:text-destructive transition-colors"
          >
            Vaciar pendientes
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
          className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1"
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

      {doneTasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200" data-testid="done-section">
          <button
            onClick={() => setShowDone((v) => !v)}
            data-testid="done-toggle"
            className="w-full flex items-center justify-between gap-2 group"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-semibold text-slate-700">
                Completadas hoy
              </span>
              <span className="text-slate-400 text-[12px]">·</span>
              <span className="text-[12px] font-semibold text-slate-400 num-tabular" data-testid="tasks-done-count">
                {doneTasks.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showDone && (
                <button
                  onClick={(e) => { e.stopPropagation(); dayTasks.clearDone(); }}
                  data-testid="done-clear-all"
                  className="text-[10.5px] font-semibold text-muted-foreground hover:text-destructive transition-colors"
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
            <ul className="mt-2.5 space-y-1.5 max-h-[260px] overflow-y-auto pr-1" data-testid="done-list">
              {doneTasks.map((opId) => (
                <DoneItem key={opId} op={opMap[opId]} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
