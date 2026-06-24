// Adapter puro (sin React, sin store) para TaskCard F1 — ver
// memory/TASKCARD_F1_CONTRACT.md §1. Convierte una OperationalTask en el
// view-model que consume <TaskCard/>. Badge = TIPO solo; severidad separada
// (no se reusa el label compuesto de operationalTaskBadge); origen/responsable
// no se pintan en la compacta (van a `detail`, reservado a expand futuro).

import { operationalTaskBadge } from './operationalTasksStore';

const TYPE_LABEL = { follow_up: 'Seguimiento', review: 'Revisión' };
const TYPE_KEY = { follow_up: 'seguimiento', review: 'revision' };

// Normaliza el título para presentación: quita el punto final si existe.
// No toca el dato fuente (task.title), solo lo que se muestra.
export const stripTrailingDot = (s) => (s || '').replace(/\.\s*$/, '');

// Dirección abreviada (solo presentación): calle + número, sin piso/depto.
// Si tiene coma, muestra lo anterior a la primera coma; si no, tal cual.
export const shortAddress = (a) => {
  if (!a) return '';
  const i = a.indexOf(',');
  return i >= 0 ? a.slice(0, i).trim() : a;
};

export const taskCardPresentation = (task, op) => ({
  id: task.id,
  kind: 'operational',
  type: TYPE_KEY[task.subtype] || 'tarea',
  typeLabel: TYPE_LABEL[task.subtype] || 'Tarea',   // tipo solo (nunca compuesto/strings técnicos)
  title: stripTrailingDot(task.title),
  addressLine: shortAddress(op?.direccion),
  legajoId: op?.id || task.opId,
  severity: operationalTaskBadge(task).severity,     // 'critica' | 'media' | null (solo la severidad)
  roleLabel: task.relatedActorLabel || null,         // rol corto (ej. "Gestoría", "Escribanía")
  status: task.status,                               // 'pending' | 'done' | 'cancelled'
  detail: {                                          // NO se renderiza en F1
    origin: task.origin,
    sourceLabel: task.sourceLabel,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
  },
});
