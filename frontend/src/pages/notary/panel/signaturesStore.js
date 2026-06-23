// Store mínimo para "firmas programadas" del panel de escribanías (demo Fase D).
// Aditivo: NO toca op.firma (que sigue siendo la firma tentativa mock). Acá vive
// la firma PROGRAMADA por legajo. Fuente de verdad de "programada"; la UI lee
// "programada ?? tentativa". Persiste en localStorage. Mismo patrón que
// dayTasksStore / operationalTasksStore (useSyncExternalStore).

import { useSyncExternalStore } from 'react';

const KEY = 'mp_notary_programmed_signatures';

const read = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const persist = (map) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
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

export const signatures = {
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,

  // Programa (o reprograma) la firma de un legajo.
  set(opId, { fecha, hora, modalidad, lugar = '', nota = '' }) {
    if (!opId || !fecha || !hora) return null;
    const entry = {
      fecha,
      hora,
      modalidad: modalidad || 'Presencial',
      lugar,
      nota,
      status: 'programada',
      scheduledAt: new Date().toISOString(),
    };
    setState({ ...state, [opId]: entry });
    return entry;
  },

  clear(opId) {
    if (!state[opId]) return;
    const next = { ...state };
    delete next[opId];
    setState(next);
  },

  getByOp(opId) {
    return state[opId] || null;
  },
};

export const useSignatures = () =>
  useSyncExternalStore(signatures.subscribe, signatures.getSnapshot, signatures.getSnapshot);
