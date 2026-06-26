// Store local de "solicitudes de corrección documental" (demo Fase E). Entidad
// separada de documentUploadsStore: una solicitud es auditable y tiene su propio
// ciclo de vida (hoy 'solicitada'; futuro 'respondida' cuando la parte recargue).
// Pensado para que un futuro panel simplificado de partes lea estas solicitudes.
//
// NO envía email/WhatsApp ni nada a un servidor: los canales sugeridos son solo
// intención/configuración para la demo. Persiste en localStorage. Mismo patrón
// que documentUploadsStore / signaturesStore (useSyncExternalStore).

import { useSyncExternalStore } from 'react';

const KEY = 'mp_notary_document_corrections';

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
const nextId = () => `dc_${Date.now()}_${seq++}`;

const nowParts = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return { fecha: `${dd}/${mm}`, hora: `${hh}:${mi}` };
};

export const documentCorrections = {
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,

  // Registra una solicitud de corrección para una carga observada/rechazada.
  add(opId, {
    uploadId,
    requisitoId = null,
    requisito = '',
    categoria = 'otros',
    aportadoPor = '',
    aportadoPorOtro = '',
    estadoOrigen,
    motivo,
    mensaje = '',
    canalSugerido = { email: false, whatsapp: false },
    operationalTaskId = null,
  }) {
    if (!opId || !uploadId || !motivo) return null;
    const { fecha, hora } = nowParts();
    const correction = {
      id: nextId(),
      opId,
      uploadId,
      requisitoId: requisitoId ?? null,
      requisito,
      categoria: categoria || 'otros',
      aportadoPor: aportadoPor || 'No especificado',
      aportadoPorOtro: aportadoPorOtro || '',
      estadoOrigen,
      motivo,
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
    setState([...state, correction]);
    return correction;
  },

  // Linkea la tarea operativa de seguimiento creada para una corrección.
  attachOperationalTask(correctionId, operationalTaskId) {
    setState(state.map((c) => (c.id === correctionId ? { ...c, operationalTaskId } : c)));
  },

  byOpId(opId) {
    return state.filter((c) => c.opId === opId);
  },

  byUploadId(uploadId) {
    return state.filter((c) => c.uploadId === uploadId);
  },

  // Elimina las correcciones asociadas a una carga (al borrar esa carga, la
  // solicitud ya no tiene objeto documental al que apuntar). Devuelve las
  // correcciones eliminadas (para cancelar tareas operativas vinculadas).
  removeByUploadId(uploadId) {
    const eliminadas = state.filter((c) => c.uploadId === uploadId);
    if (eliminadas.length) setState(state.filter((c) => c.uploadId !== uploadId));
    return eliminadas;
  },
};

export const useDocumentCorrections = () =>
  useSyncExternalStore(documentCorrections.subscribe, documentCorrections.getSnapshot, documentCorrections.getSnapshot);
