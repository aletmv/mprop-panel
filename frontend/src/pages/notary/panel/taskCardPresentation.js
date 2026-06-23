// Adapter puro (sin React, sin store) para TaskCard F1 — ver
// memory/TASKCARD_F1_CONTRACT.md §1. Convierte una OperationalTask en el
// view-model que consume <TaskCard/>. Badge = TIPO solo; severidad separada
// (no se reusa el label compuesto de operationalTaskBadge); origen/responsable
// no se pintan en la compacta (van a `detail`, reservado a expand futuro).

import { operationalTaskBadge } from './operationalTasksStore';

const TYPE_LABEL = { follow_up: 'Seguimiento', review: 'Revisión' };
const TYPE_KEY = { follow_up: 'seguimiento', review: 'revision' };

export const taskCardPresentation = (task, op) => ({
  id: task.id,
  kind: 'operational',
  type: TYPE_KEY[task.subtype] || 'tarea',
  typeLabel: TYPE_LABEL[task.subtype] || 'Tarea',   // tipo solo (nunca compuesto/strings técnicos)
  title: task.title,
  addressLine: op?.direccion || '',
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
