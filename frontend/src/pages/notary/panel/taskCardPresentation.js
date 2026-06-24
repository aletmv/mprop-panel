// Adapter puro (sin React, sin store) para TaskCard F1 — ver
// memory/TASKCARD_F1_CONTRACT.md §1. Convierte una OperationalTask en el
// view-model que consume <TaskCard/>. Badge = TIPO solo; severidad separada
// (no se reusa el label compuesto de operationalTaskBadge); origen no se pinta
// en la compacta (va a `detail`, reservado a expand futuro). El responsable no
// se muestra como pill: se integra al título visible (ver buildDisplayTitle).

import { operationalTaskBadge } from './operationalTasksStore';

const TYPE_LABEL = { follow_up: 'Seguimiento', review: 'Revisión' };
const TYPE_KEY = { follow_up: 'seguimiento', review: 'revision' };

// Conector de integración rol→título (ver TASKCARD_F1_CONTRACT.md §2).
const ROLE_CONNECTOR = {
  'Gestoría': 'a Gestoría',
  'Escribanía': 'a Escribanía',
  'Comprador': 'al Comprador',
  'Vendedor': 'al Vendedor',
  'Banco': 'al Banco',
  'Tercero': 'al Tercero',
};

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

// Integra el rol al título visible en vez de mostrarlo como pill separado.
// No muta el título fuente: genera un string nuevo solo para presentación.
// Si el título ya menciona el rol (ej. viene armado desde el origen como
// "Enviar WhatsApp a Gestoría"), no duplica el conector.
export const buildDisplayTitle = (title, roleLabel) => {
  const base = stripTrailingDot(title);
  const connector = roleLabel && ROLE_CONNECTOR[roleLabel];
  if (!connector) return base;
  const yaIncluyeRol = new RegExp(`\\b${roleLabel}\\b`, 'i').test(base);
  return yaIncluyeRol ? base : stripTrailingDot(`${base} ${connector}`);
};

export const taskCardPresentation = (task, op) => ({
  id: task.id,
  kind: 'operational',
  type: TYPE_KEY[task.subtype] || 'tarea',
  typeLabel: TYPE_LABEL[task.subtype] || 'Tarea',   // tipo solo (nunca compuesto/strings técnicos)
  title: stripTrailingDot(task.title),
  displayTitle: buildDisplayTitle(task.title, task.relatedActorLabel || null), // título con rol integrado
  addressLine: shortAddress(op?.direccion),
  legajoId: op?.id || task.opId,
  severity: operationalTaskBadge(task).severity,     // 'critica' | 'media' | null (solo la severidad)
  roleLabel: task.relatedActorLabel || null,         // rol corto; ya no se pinta como pill, solo insumo de displayTitle
  status: task.status,                               // 'pending' | 'done' | 'cancelled'
  detail: {                                          // NO se renderiza en F1
    origin: task.origin,
    sourceLabel: task.sourceLabel,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
  },
});
