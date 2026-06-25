// Store local de "documentos incorporados al legajo" (demo Fase E). Aditivo: NO
// toca el generador derivado legajoDocsEventos.js ni el mock global `documentos`.
// Acá viven las cargas registradas desde "Subir documentos", por legajo (opId).
// La UI mergea: documento derivado del requisito + carga (si existe). Persiste
// en localStorage. Mismo patrón que signaturesStore / operationalTasksStore.
//
// NO sube nada a un servidor ni lee el contenido de los archivos: del
// <input type="file"> se usa solo metadata (name, size, type).

import { useSyncExternalStore } from 'react';

const KEY = 'mp_notary_document_uploads';

let seq = 0;
const nextId = (p) => `${p}_${Date.now()}_${seq++}`;

// Backward compatibility:
// - una carga vieja con `nombre` único se normaliza a `archivos: [{ nombre }]`.
// - una carga sin `aportadoPor` recibe un fallback (origen no especificado).
const normalizeUpload = (u) => {
  if (!u || typeof u !== 'object') return u;
  const aportadoPor = u.aportadoPor || 'No especificado';
  const estado = u.estado || 'en_revision';
  const categoria = u.categoria || 'otros';
  if (Array.isArray(u.archivos)) return { ...u, aportadoPor, estado, categoria };
  const { nombre, ...rest } = u;
  const archivos = nombre
    ? [{ id: `${u.id || 'leg'}_a0`, nombre, size: null, type: null, addedAt: u.uploadedAt || null }]
    : [];
  return { ...rest, aportadoPor, estado, categoria, archivos };
};

const read = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeUpload) : [];
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

// Fecha/hora local 'DD/MM' + 'HH:MM' para la bitácora (mismo formato que los
// eventos derivados).
const nowParts = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return { fecha: `${dd}/${mm}`, hora: `${hh}:${mi}` };
};

export const documentUploads = {
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,

  // Registra una carga documental (demo). `archivos` = metadata del file input
  // (name/size/type). `requisitoId` mapea a un documento derivado (doc.id) cuando
  // la carga satisface un requisito existente; null cuando es "Otro documento".
  add(opId, { requisitoId = null, requisito = '', categoria = 'otros', aportadoPor = '', aportadoPorOtro = '', archivos = [], nota = '', declaraciones = null }) {
    if (!opId || !archivos.length) return null;
    const { fecha, hora } = nowParts();
    const upload = {
      id: nextId('du'),
      opId,
      requisitoId: requisitoId ?? null,
      requisito,
      categoria: categoria || 'otros',
      aportadoPor: aportadoPor || 'No especificado',
      aportadoPorOtro: aportadoPorOtro || '',
      estado: 'en_revision',
      archivos: archivos.map((a) => ({
        id: nextId('a'),
        nombre: a.nombre,
        size: typeof a.size === 'number' ? a.size : null,
        type: a.type || null,
        addedAt: new Date().toISOString(),
      })),
      nota,
      declaraciones: declaraciones || { legiblesYCompletos: false, autorizacionCarga: false },
      origin: 'upload',
      responsable: 'Esc. Lagos',
      fecha,
      hora,
      uploadedAt: new Date().toISOString(),
      reviewedAt: null,
    };
    setState([...state, upload]);
    return upload;
  },

  // Validar: marca una carga (en revisión u observada) como revisada/validada.
  approve(id) {
    const { fecha, hora } = nowParts();
    setState(
      state.map((u) =>
        u.id === id && (u.estado === 'en_revision' || u.estado === 'observado')
          ? { ...u, estado: 'revisado', reviewedAt: new Date().toISOString(), reviewedFecha: fecha, reviewedHora: hora }
          : u
      )
    );
  },

  // Poner en observación (desde en revisión). Guarda la observación + timestamp.
  observe(id, note = '') {
    const { fecha, hora } = nowParts();
    setState(
      state.map((u) =>
        u.id === id && u.estado === 'en_revision'
          ? { ...u, estado: 'observado', observacion: note, observedAt: new Date().toISOString(), observedFecha: fecha, observedHora: hora }
          : u
      )
    );
  },

  // Rechazar (desde en revisión u observada). Guarda el motivo + timestamp.
  reject(id, reason = '') {
    const { fecha, hora } = nowParts();
    setState(
      state.map((u) =>
        u.id === id && (u.estado === 'en_revision' || u.estado === 'observado')
          ? { ...u, estado: 'rechazado', rechazoMotivo: reason, rejectedAt: new Date().toISOString(), rejectedFecha: fecha, rejectedHora: hora }
          : u
      )
    );
  },

  // Elimina una carga completa (la UI lo habilita solo para estado en_revision).
  remove(id) {
    setState(state.filter((u) => u.id !== id));
  },

  // Elimina un archivo de una carga. Si era el último archivo, elimina la carga
  // completa (preferencia para demo).
  removeArchivo(uploadId, archivoId) {
    const next = [];
    state.forEach((u) => {
      if (u.id !== uploadId) { next.push(u); return; }
      const archivos = u.archivos.filter((a) => a.id !== archivoId);
      if (archivos.length === 0) return; // último archivo → se elimina la carga
      next.push({ ...u, archivos });
    });
    setState(next);
  },

  byOpId(opId) {
    return state.filter((u) => u.opId === opId).map(normalizeUpload);
  },
};

// Origen a mostrar: si es "Otro" y hay texto libre, usa ese texto; si no, el
// valor seleccionado; fallback para cargas viejas sin el campo.
export const aportadoPorDisplay = (u) => {
  if (!u) return 'No especificado';
  if (u.aportadoPor === 'Otro' && u.aportadoPorOtro) return u.aportadoPorOtro;
  return u.aportadoPor || 'No especificado';
};

export const useDocumentUploads = () =>
  useSyncExternalStore(documentUploads.subscribe, documentUploads.getSnapshot, documentUploads.getSnapshot);
