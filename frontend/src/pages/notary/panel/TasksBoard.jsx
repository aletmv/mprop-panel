import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, GripVertical, X, Inbox, Clock, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'mp_notary_my_day_tasks';
export const DND_TYPE = 'application/x-mp-legajo-id';

export const loadTasks = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
};

export const TasksBoard = ({ operaciones }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(() => loadTasks());
  const [isOver, setIsOver] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const overIdxRef = useRef(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const opMap = operaciones.reduce((acc, o) => {
    acc[o.id] = o;
    return acc;
  }, {});
  const visibleTasks = tasks.filter((id) => opMap[id]);

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
    setTasks((prev) => (prev.includes(opId) ? prev : [...prev, opId]));
  };

  const removeTask = (opId) => setTasks((prev) => prev.filter((id) => id !== opId));

  // Reorder dentro del board (native DnD con tipo "text/x-mp-task-idx").
  const TASK_IDX_TYPE = 'text/x-mp-task-idx';
  const onItemDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(TASK_IDX_TYPE, String(idx));
  };
  const onItemDragOver = (e, idx) => {
    if (dragIdx == null) return;
    e.preventDefault();
    overIdxRef.current = idx;
  };
  const onItemDragEnd = () => {
    const from = dragIdx;
    const to = overIdxRef.current;
    if (from != null && to != null && from !== to) {
      setTasks((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
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
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <ListChecks className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-display font-bold text-[18px] text-foreground leading-tight">Tareas del día</h2>
            <div className="text-[12px] text-muted-foreground">
              Arrastrá legajos del tablero para ordenar tu jornada
            </div>
          </div>
        </div>
        {visibleTasks.length > 0 && (
          <button
            onClick={() => setTasks([])}
            data-testid="tasks-clear-all"
            className="text-[11px] font-semibold text-muted-foreground hover:text-destructive transition-colors"
          >
            Vaciar lista
          </button>
        )}
      </div>

      {visibleTasks.length === 0 ? (
        <div
          data-testid="tasks-empty"
          className={`flex-1 min-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6 py-8 transition-colors ${
            isOver ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/30 text-muted-foreground'
          }`}
        >
          <Inbox className="w-7 h-7 mb-2" strokeWidth={1.5} />
          <div className="text-[13px] font-semibold">
            {isOver ? 'Soltá para sumar a tu día' : 'Sin tareas seleccionadas todavía'}
          </div>
          <div className="text-[11.5px] mt-1 opacity-80">
            Arrastrá una card de cualquier columna del tablero de legajos
          </div>
        </div>
      ) : (
        <ol
          className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1"
          data-testid="tasks-list"
        >
          {visibleTasks.map((opId, idx) => {
            const op = opMap[opId];
            const urgente = op.diasFirma >= 0 && op.diasFirma <= 5;
            return (
              <li
                key={opId}
                draggable
                onDragStart={(e) => onItemDragStart(e, idx)}
                onDragOver={(e) => onItemDragOver(e, idx)}
                onDragEnd={onItemDragEnd}
                data-testid={`task-item-${opId}`}
                className={`group flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                  dragIdx === idx ? 'opacity-50' : ''
                }`}
              >
                <span className="flex flex-col items-center justify-center w-6 text-slate-300 group-hover:text-slate-500 shrink-0">
                  <GripVertical className="w-4 h-4" />
                </span>
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-[11px] font-bold grid place-items-center shrink-0 tabular-nums">
                  {idx + 1}
                </span>
                <button
                  onClick={() => navigate(`/escribanos/operaciones/${opId}`)}
                  data-testid={`task-open-${opId}`}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10.5px] text-slate-500">{op.id}</span>
                    {op.tareaEnCurso && (
                      <span className="text-[10.5px] font-semibold text-slate-600 truncate">
                        · {op.tareaEnCurso}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] font-semibold text-slate-900 truncate">{op.direccion}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span className={urgente ? 'text-red-600 font-semibold' : ''}>
                      {op.diasFirma > 0
                        ? `${op.diasFirma}d a firma`
                        : op.diasFirma === 0
                        ? 'firma hoy'
                        : `firmado hace ${Math.abs(op.diasFirma)}d`}
                    </span>
                    <span>·</span>
                    <span>{op.barrio}</span>
                  </div>
                </button>
                <button
                  onClick={() => removeTask(opId)}
                  data-testid={`task-remove-${opId}`}
                  title="Quitar de mi día"
                  className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:text-destructive hover:bg-destructive-soft transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block shrink-0" />
              </li>
            );
          })}
        </ol>
      )}

      {visibleTasks.length > 0 && (
        <div className="text-[10.5px] text-muted-foreground mt-3 flex items-center gap-2">
          <GripVertical className="w-3 h-3" />
          Arrastrá los items para reordenar · {visibleTasks.length} en tu día
        </div>
      )}
    </div>
  );
};
