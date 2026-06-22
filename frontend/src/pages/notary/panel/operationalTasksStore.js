// Store de OperationalTask — ver memory/OPERATIONAL_TASKS_ARCHITECTURE.md.
//
// Separado de dayTasksStore.js a propósito: dayTasks.pending/done modela
// "tarea formal del checklist está en el repo de hoy" (string[] de op.id).
// Este store modela "existe una tarea operativa custom" (subtype: 'follow_up'
// por ahora), que puede o no estar agendada para hoy (scheduledForDate).
// "Tareas del día" filtra por scheduledForDate === hoy; no es el único lugar
// donde una OperationalTask puede existir a futuro.
//
// Crear/completar una OperationalTask NUNCA toca op.estado, op.bloqueoActor
// ni op.lineaDePases — eso sigue siendo responsabilidad exclusiva del flow
// duro / línea de pases, no de este store.

import { useSyncExternalStore } from 'react';

const KEY = 'mp_notary_operational_tasks';

// Fecha local YYYY-MM-DD de un Date dado (por defecto, ahora).
const localDateString = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const todayDateString = () => localDateString();

// Convierte un completedAt (ISO) a fecha local YYYY-MM-DD — usado para decidir
// si una OperationalTask completada corresponde a "hoy", en vez de reusar
// scheduledForDate (que es la agenda de cuándo se planeó trabajarla, no
// cuándo efectivamente se completó).
export const dateStringFromISO = (iso) => (iso ? localDateString(new Date(iso)) : null);

const read = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (tasks) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
};

let state = read();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const setState = (next) => {
  state = next;
  persist(state);
  emit();
};

let seq = 0;
const nextId = () => `ot_${Date.now()}_${seq++}`;

export const operationalTasks = {
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,

  // Crea una OperationalTask. `subtype` es el único dato que distingue un
  // "seguimiento" de cualquier otro tipo futuro — el store no le da
  // tratamiento especial.
  create({
    opId,
    title,
    subtype = 'follow_up',
    origin = 'manual',
    relatedChecklistItemId = null,
    relatedActorId = null,
    relatedActorRole = null,
    relatedActorLabel = null,
    relatedDocumentId = null,
    relatedPaymentId = null,
    scheduledForDate = todayDateString(),
    // Procedencia (finding que informó la tarea). Aditivo y opcional: las tareas
    // viejas en localStorage quedan con estos campos undefined sin romperse.
    // Ej: una tarea creada desde "Resolver" de una alerta lleva sourceType:'alert'.
    sourceType = null,
    sourceId = null,
    sourceLabel = null,
  }) {
    if (!opId || !title) return null;
    const now = new Date().toISOString();
    const task = {
      id: nextId(),
      opId,
      title,
      type: 'operational_task',
      subtype,
      status: 'pending',
      origin,
      relatedChecklistItemId,
      relatedActorId,
      relatedActorRole,
      relatedActorLabel,
      relatedDocumentId,
      relatedPaymentId,
      scheduledForDate,
      addedToTodayAt: scheduledForDate === todayDateString() ? now : null,
      sourceType,
      sourceId,
      sourceLabel,
      createdAt: now,
      completedAt: null,
    };
    setState([...state, task]);
    return task;
  },

  complete(id) {
    setState(
      state.map((t) => (t.id === id ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t))
    );
  },

  // Restaurar = volver a poner la tarea en el día de hoy, no solo marcarla
  // pending — por eso reagenda scheduledForDate/addedToTodayAt. Si no se
  // reagendara, una tarea restaurada en un día distinto al que tenía
  // agendado quedaría pending en el dato pero invisible en "Tareas del día"
  // (que filtra por scheduledForDate === hoy).
  reopen(id) {
    const now = new Date().toISOString();
    setState(
      state.map((t) =>
        t.id === id
          ? { ...t, status: 'pending', completedAt: null, scheduledForDate: todayDateString(), addedToTodayAt: now }
          : t
      )
    );
  },

  cancel(id) {
    setState(state.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t)));
  },

  remove(id) {
    setState(state.filter((t) => t.id !== id));
  },

  // Selector aditivo — no agrega estado nuevo, solo conveniencia para vistas
  // que muestran la memoria operativa de un legajo puntual (ej. OperacionDetail).
  byOpId(opId) {
    return state.filter((t) => t.opId === opId);
  },
};

export const useOperationalTasks = () =>
  useSyncExternalStore(operationalTasks.subscribe, operationalTasks.getSnapshot, operationalTasks.getSnapshot);

// Helper de presentación (puro, no toca estado): badge compuesto para una task.
// Los datos siguen separados en el modelo (subtype / sourceType / sourceLabel);
// esto solo decide qué etiqueta única mostrar para no apilar pills.
// - review + alert → "Revisión · Alerta crítica/media" (con severidad para el tono)
// - review        → "Revisión"
// - follow_up     → "Seguimiento"
export const operationalTaskBadge = (task) => {
  if (task.subtype === 'review' && task.sourceType === 'alert') {
    const severity = /crít/i.test(task.sourceLabel || '') ? 'critica' : 'media';
    return { label: `Revisión · ${task.sourceLabel || 'Alerta'}`, severity };
  }
  if (task.subtype === 'review') return { label: 'Revisión', severity: null };
  if (task.subtype === 'follow_up') return { label: 'Seguimiento', severity: null };
  return { label: task.subtype, severity: null };
};
