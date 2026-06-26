// Store local de "solicitudes de documento pendiente" (demo Fase E). Espejo de
// documentCorrectionsStore, pero para requisitos PENDIENTES (sin carga): la
// escribanía pide el documento al aportante. Se ancla a `requisitoId` (no hay
// uploadId). Pensado para que un futuro panel de partes lea estas solicitudes.
//
// NO envía email/WhatsApp ni nada a un servidor: los canales son intención.
// Persiste en localStorage. Mismo patrón useSyncExternalStore.

import { useSyncExternalStore } from 'react';

const KEY = 'mp_notary_document_requests';

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

const persist = (list) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
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
const nextId = () => `dr_${Date.now()}_${seq++}`;

const nowParts = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return { fecha: `${dd}/${mm}`, hora: `${hh}:${mi}` };
};

export const documentRequests = {
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,

  // Registra una solicitud de documento para un requisito pendiente.
  add(opId, {
    requisitoId,
    requisito = '',
    categoria = 'otros',
    aportadoPor = '',
    aportadoPorOtro = '',
    mensaje = '',
    canalSugerido = { email: false, whatsapp: false },
    operationalTaskId = null,
  }) {
    if (!opId || !requisitoId) return null;
    const { fecha, hora } = nowParts();
    const request = {
      id: nextId(),
      opId,
      requisitoId,
      requisito,
      categoria: categoria || 'otros',
      aportadoPor: aportadoPor || 'No especificado',
      aportadoPorOtro: aportadoPorOtro || '',
      mensaje,
      canalSugerido: {
        email: Boolean(canalSugerido && canalSugerido.email),
        whatsapp: Boolean(canalSugerido && canalSugerido.whatsapp),
      },
      status: 'solicitada',
      operationalTaskId: operationalTaskId || null,
      requestedAt: new Date().toISOString(),
      fecha,
      hora,
      responsable: 'Esc. Lagos',
    };
    setState([...state, request]);
    return request;
  },

  // Linkea la tarea operativa de seguimiento creada para la solicitud.
  attachOperationalTask(requestId, operationalTaskId) {
    setState(state.map((r) => (r.id === requestId ? { ...r, operationalTaskId } : r)));
  },

  byOpId(opId) {
    return state.filter((r) => r.opId === opId);
  },

  byRequisitoId(requisitoId) {
    return state.filter((r) => String(r.requisitoId) === String(requisitoId));
  },
};

export const useDocumentRequests = () =>
  useSyncExternalStore(documentRequests.subscribe, documentRequests.getSnapshot, documentRequests.getSnapshot);
