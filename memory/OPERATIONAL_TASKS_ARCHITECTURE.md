# Arquitectura de tareas operativas, seguimientos y automatizaciones (propuesta)

> **Estado: documento de diseño, no implementado.**
> Ningún store, componente ni tipo de dato descrito acá existe todavía en el código.
> `dayTasksStore.js` sigue siendo, hoy, el único store real (`pending`/`done` como `string[]` de `op.id`).
> Este documento es la guía para cuando se implemente — no reemplaza ni documenta el código actual.

## 1. Por qué este documento existe

Surgió al diseñar la Fase 2 de "Próximo paso" (vista Lista de Legajos): la primera idea fue modelar todo lo custom como
**"seguimiento"**. Al pensar en automatizaciones/IA (sugerencias de WhatsApp, recordatorios, etc.) quedó claro que
"seguimiento" es un caso particular de algo más general — una **tarea operativa** — y que mezclar ambos conceptos
en el mismo modelo limitaría cualquier implementación futura de automatizaciones.

Este documento fija el vocabulario y las relaciones **antes** de tocar `dayTasksStore.js`, `Kanban.jsx` o
`TasksBoard.jsx`, para que esa implementación (cuando se apruebe) tenga un modelo de datos coherente desde el día 1
en vez de ir parchando.

## 2. Modelo conceptual (capas)

```
┌─────────────────────────────────────────────────────────────────┐
│ Checklist / flow duro                                            │
│   Pasos estructurados del legajo. Avanzan el estado formal.      │
│   Hoy: implícito en op.estado + HITOS (Kanban.jsx).               │
│   Futuro: ChecklistItem.                                          │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Línea de pases                                                    │
│   Responsabilidad formal: quién tiene la pelota y cómo llegó ahí. │
│   Hoy: op.bloqueoActor + op.lineaDePases (SoccerBloqueoTrigger).   │
│   No cambia con tareas operativas custom.                         │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Tareas operativas custom (OperationalTask)                        │
│   Creadas por la escribanía o por el sistema para mover/destrabar  │
│   un legajo. "Seguimiento" es UN subtipo posible, no el modelo.    │
│   Pueden referenciar al checklist/actor/documento/pago, pero no    │
│   están obligadas a ser hijas de un checklist item.                │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Automatizaciones / IA (AutomationSuggestion + MessageDraft)        │
│   Acciones sugeridas o ejecutables asociadas a una tarea operativa,│
│   nunca equivalentes a completarla.                                │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Tareas del día                                                    │
│   Bandeja operativa diaria. Es una VISTA de tareas operativas      │
│   existentes (filtradas/seleccionadas para hoy), no el lugar       │
│   donde las tareas nacen conceptualmente.                          │
│   Hoy: dayTasksStore.pending/done (acopla "existe" con "está hoy"). │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Timeline                                                          │
│   Registro de eventos relevantes (creación/completado/envío).      │
│   Es bitácora, no flow duro — no decide nada, solo registra.       │
└─────────────────────────────────────────────────────────────────┘
```

**Principio central**: las tareas operativas custom *no son parte* del checklist/flow duro, pero *pueden estar
contextualizadas* por él (un checklist item, un actor, un documento, un pago, una observación) sin depender
estructuralmente de ninguno.

## 3. Entidades propuestas

### 3.1 `ChecklistItem` (ya existe conceptualmente, no formalizado como entidad)

Hoy vive disperso entre `op.estado`, `HITOS` (`Kanban.jsx`) y `timelineChecklist.js` (`STAGES_TEMPLATE`). Este
documento no propone migrarlo todavía — solo lo nombra para ubicar las relaciones de `OperationalTask`.

```js
{
  id,
  opId,
  label,
  status,                 // pendiente | completo | bloqueado, etc.
  responsibleActorRole,   // mismo vocabulario que bloqueoLabel
  requiredDocumentId,
}
```

### 3.2 `OperationalTask` — entidad nueva, núcleo de este documento

```js
{
  id,                        // propio, NO op.id — permite N tareas por legajo
  opId,                      // legajo relacionado
  title,                      // texto, custom o generado
  type: 'operational_task',
  subtype:                    // "seguimiento" es UN valor posible, no el tipo base
    'follow_up'              // ej. "Llamar al vendedor"
    | 'internal_task'        // nota interna sin actor externo
    | 'document_follow_up'   // seguimiento de un documento puntual
    | 'call'
    | 'whatsapp'
    | 'review'
    | 'other',
  status: 'pending' | 'done' | 'cancelled',
  origin: 'manual' | 'system' | 'ai',
  relatedChecklistItemId,    // opcional
  relatedActorId,            // opcional — bloqueoActor en el momento de creación
  relatedActorRole,          // opcional — snapshot del label
  relatedDocumentId,         // opcional
  relatedPaymentId,          // opcional
  assignedTo,                // opcional (a futuro, multi-usuario)
  dueAt,                      // opcional
  createdAt,
  completedAt,                // opcional
}
```

Todas las `related*` son **opcionales e independientes entre sí** — una tarea puede estar asociada solo al legajo
(sin checklist item, sin actor, sin documento), o a varias a la vez. Ninguna relación es obligatoria.

### 3.3 `AutomationSuggestion`

```js
{
  id,
  opId,
  taskId,                    // OperationalTask que la originó o a la que aplica
  type: 'whatsapp_message' | 'email' | 'call_reminder' | 'document_request',
  status: 'draft' | 'approved' | 'sent' | 'dismissed' | 'failed',
  confidence,                 // opcional, score del modelo
  requiresApproval,           // boolean — en contexto notarial, default true
  reason,                      // explicación legible de por qué se sugiere
}
```

### 3.4 `MessageDraft` / `Communication`

```js
{
  id,
  opId,
  taskId,
  automationSuggestionId,    // opcional — puede crearse manualmente sin sugerencia
  channel: 'whatsapp' | 'email',
  toActorId,
  body,
  status: 'draft' | 'sent' | 'failed' | 'delivered',
  sentAt,
}
```

## 4. Relaciones entre entidades

```
ChecklistItem  ←─(relatedChecklistItemId, opcional)─  OperationalTask
Actor          ←─(relatedActorId, opcional)──────────  OperationalTask
Document       ←─(relatedDocumentId, opcional)───────  OperationalTask
Payment        ←─(relatedPaymentId, opcional)────────  OperationalTask
OperationalTask ──(taskId)──────────────────────────→  AutomationSuggestion
AutomationSuggestion ──(automationSuggestionId, opcional)──→ MessageDraft
OperationalTask ──(taskId)──────────────────────────→  MessageDraft (directo, sin pasar por sugerencia)
OperationalTask ──(subset filtrado por el usuario)──→  "Tareas del día" (vista, no entidad)
OperationalTask / Communication ──(evento)──────────→  Timeline (registro, no flow duro)
```

`Línea de pases` y `op.estado` **no aparecen como destino de ninguna flecha** — ninguna entidad de este modelo
escribe sobre ellos. Esa es la regla no-negociable de la sección 5.

## 5. Reglas no negociables

1. Crear una `OperationalTask` **no** cambia `op.estado`.
2. Completar una `OperationalTask` **no** mueve la pelota (`op.bloqueoActor`) automáticamente.
3. Crear una `OperationalTask` **no** modifica `op.lineaDePases`.
4. Una `AutomationSuggestion` puede sugerir una acción, pero **nunca equivale** a completar la tarea — completar
   sigue siendo una acción explícita del usuario sobre la `OperationalTask`.
5. En contexto notarial/legal, **los envíos sensibles (WhatsApp/email) inician como `draft` o requieren aprobación
   humana** (`requiresApproval: true` por default) antes de pasar a `sent`.
6. El `Timeline` puede registrar creación/completado/envío, pero es **registro, no flow duro** — no se lee como
   fuente de verdad de ningún estado, solo se escribe a él.
7. "Seguimiento" (`subtype: 'follow_up'`) es un valor más de `subtype`, nunca el nombre del modelo base
   (`OperationalTask`).

## 6. Relación con el código actual (mapa, sin migrar todavía)

| Concepto del modelo | Implementación actual | Notas |
|---|---|---|
| Checklist / flow duro | `op.estado`, `HITOS` (`Kanban.jsx`), `timelineChecklist.js` | Sin cambios propuestos en este documento |
| Línea de pases | `op.bloqueoActor`, `op.lineaDePases`, `SoccerBloqueoTrigger` | Sin cambios; ninguna `OperationalTask` debe escribir acá |
| Tareas del día (vista) | `dayTasksStore.js` (`pending`/`done` = `string[]` de `op.id`) | Hoy **es** el dato, no una vista — ver sección 7 |
| Tarea operativa | No existe como entidad | A crear (`OperationalTask`), separado de `dayTasksStore` |
| Automatización / IA | No existe | A crear, fuera de alcance inmediato |
| Timeline | `OperacionDetail.jsx` tab Timeline (eventos mock) | Reusable como registro de `OperationalTask`/`Communication` a futuro |

## 7. Implicancia clave para `dayTasksStore.js` (a futuro, no ahora)

Hoy `dayTasksStore.pending/done` mezcla dos cosas que el modelo separa:

- **"Esta tarea existe"** → debería ser responsabilidad de una colección de `OperationalTask` (o, para la tarea
  formal del checklist, del propio checklist).
- **"Esta tarea está seleccionada para hoy"** → debería ser la única responsabilidad de "Tareas del día".

Cuando se implemente, la migración recomendada (no ejecutar todavía) es:
- Mantener `dayTasksStore.pending/done` funcionando como está para no romper sesiones existentes en localStorage.
- Agregar una colección nueva y separada para `OperationalTask` (con su propia clave de persistencia).
- "Tareas del día" se redefine como una *vista* que combina: tareas formales en `pending` + `OperationalTask` con
  algún criterio de "seleccionada para hoy" (podría ser simplemente "todas las `pending`" en una primera iteración).
- Ningún dato existente se borra ni se reinterpreta — es una adición, no una migración destructiva.

## 8. Qué NO resuelve este documento (a propósito)

- No define el store ni los componentes de UI (eso es implementación, fase posterior).
- No decide si `OperationalTask` vive en memoria, localStorage o backend — hoy todo el panel es mock/localStorage,
  así que por continuidad probablemente arranque igual, pero esa decisión se toma al implementar.
- No define la UI de creación de seguimientos (popover/modal/menú) — eso quedó esbozado en la conversación de
  producto, no en este documento de arquitectura de datos.
- No toca automatizaciones reales de WhatsApp/email (`MessageDraft`/`Communication`) más allá del modelo de datos —
  no hay integración real de envío en este prototipo.
