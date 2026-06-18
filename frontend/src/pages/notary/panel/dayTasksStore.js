// Store mínimo para "Tareas del día" del panel de escribanías.
// Mantiene dos listas (pending / done) y persiste en localStorage.
// Usable desde cualquier componente vía useDayTasks().

import { useSyncExternalStore } from 'react';

const KEY_PENDING = 'mp_notary_my_day_tasks';
const KEY_DONE = 'mp_notary_my_day_done';

const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const persist = (state) => {
  try {
    window.localStorage.setItem(KEY_PENDING, JSON.stringify(state.pending));
    window.localStorage.setItem(KEY_DONE, JSON.stringify(state.done));
  } catch {
    /* ignore */
  }
};

let state = { pending: read(KEY_PENDING, []), done: read(KEY_DONE, []) };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const setState = (next) => {
  state = next;
  persist(state);
  emit();
};

export const dayTasks = {
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  addPending(id) {
    if (!id) return;
    if (state.pending.includes(id) || state.done.includes(id)) return;
    setState({ ...state, pending: [...state.pending, id] });
  },
  removePending(id) {
    setState({ ...state, pending: state.pending.filter((x) => x !== id) });
  },
  reorderPending(from, to) {
    if (from === to || from < 0 || to < 0) return;
    const next = [...state.pending];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setState({ ...state, pending: next });
  },
  complete(id) {
    if (!state.pending.includes(id)) return;
    setState({
      pending: state.pending.filter((x) => x !== id),
      done: [id, ...state.done.filter((x) => x !== id)],
    });
  },
  uncomplete(id) {
    if (!state.done.includes(id)) return;
    setState({
      pending: [...state.pending, id],
      done: state.done.filter((x) => x !== id),
    });
  },
  removeDone(id) {
    setState({ ...state, done: state.done.filter((x) => x !== id) });
  },
  clearPending() {
    setState({ ...state, pending: [] });
  },
  clearDone() {
    setState({ ...state, done: [] });
  },
};

export const useDayTasks = () =>
  useSyncExternalStore(dayTasks.subscribe, dayTasks.getSnapshot, dayTasks.getSnapshot);
