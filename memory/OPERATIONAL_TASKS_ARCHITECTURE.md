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

## 9. Framing de producto: `OperationalTask` no es una feature de tareas custom

> Ajuste conceptual posterior a la Fase 2a (creación manual de seguimientos). No invalida lo implementado —
> lo recontextualiza antes de seguir con Fase 2b.

### 9.1 Por qué no debemos depender de la carga manual

El supuesto de producto de partida es que **los escribanos van a cargar manualmente pocas tareas**. Si el valor de
`OperationalTask` dependiera de que el usuario sea disciplinado creando seguimientos a mano, el modelo tendría
poco impacto real — la mayoría de los legajos nunca tendrían una `OperationalTask` asociada, y la arquitectura
quedaría subutilizada. La carga manual ("+ seguimiento") es una **puerta de entrada inicial y una herramienta de
demo/prototipo**, útil para mostrar el concepto y para casos puntuales donde el escribano sí quiere anotar algo —
pero no es, ni debe ser, el centro del modelo.

### 9.2 `OperationalTask` como unidad operativa del sistema

`OperationalTask` representa **una acción necesaria para destrabar o avanzar un legajo**, sin importar quién o qué
la generó. Es la unidad mínima sobre la que el sistema (humano, regla de negocio, o IA) puede:
- decidir que algo hay que hacer,
- opcionalmente sugerir o ejecutar una acción concreta (`AutomationSuggestion`/`MessageDraft`),
- mostrarla en "Tareas del día" si requiere atención hoy,
- dejarla como memoria operativa visible en el legajo aunque no esté en la bandeja de hoy,
- registrar su ciclo de vida en el `Timeline`.

Sigue sin modificar por sí misma el flow duro, la línea de pases ni `op.estado` — esa regla (sección 5) no cambia.

### 9.3 Posibles orígenes (`origin`)

| `origin` | Quién/qué la crea | Estado en este prototipo |
|---|---|---|
| `manual` | El escribano, vía "+ seguimiento" | Implementado (Fase 2a) |
| `system` | Una regla determinística (ej. "venció un plazo", "faltan 3 días para la firma") | No implementado |
| `ai` | Un modelo que detecta una situación y sugiere actuar | No implementado |
| `workflow_rule` | Disparada por una transición del checklist/flow duro (ej. al entrar a "Pre-cierre") | No implementado |
| `communication_event` | Disparada por una comunicación previa (ej. el vendedor respondió un WhatsApp) | No implementado |

El `origin: 'manual'` ya soportado por el store no cambia de shape — los demás son valores futuros del mismo
campo, no una entidad distinta.

### 9.4 Tarea operativa vs. comunicación vs. evento de timeline vs. checklist duro

- **Tarea operativa (`OperationalTask`)**: la unidad de "hay que hacer algo". Puede no requerir nunca un mensaje.
- **Comunicación (`MessageDraft`/`Communication`)**: el mensaje concreto (WhatsApp/email) que puede originarse a
  partir de una tarea operativa (vía `AutomationSuggestion` o directo), pero no es la tarea — es una de las formas
  posibles de resolverla.
- **Evento de timeline**: el registro de que algo pasó (se creó una tarea, se completó, se envió un mensaje). Es
  bitácora — no decide nada, no es accionable por sí mismo.
- **Checklist duro (`ChecklistItem`)**: el paso formal del proceso. Una `OperationalTask` puede *referenciar* un
  `ChecklistItem` (`relatedChecklistItemId`) para dar contexto, pero completarla nunca completa el paso formal.

### 9.5 Qué implica para Fase 2b

- Priorizar **visibilidad/memoria operativa en el legajo** (que una `OperationalTask` se pueda ver asociada a su
  legajo aunque no esté agendada para "hoy") antes que seguir invirtiendo en UI manual de creación.
- **No sobre-invertir todavía en UI manual compleja** (multi-step, edición avanzada, categorización fina) — la
  creación manual ya cumple su rol de puerta de entrada/demo con lo que existe.
- Mantener la creación manual **mínima**, tal como está, mientras se evalúa de dónde va a venir el volumen real de
  `OperationalTask` (reglas, eventos, IA) en fases posteriores.

### 9.6 Qué implica para automatización futura

Cadena conceptual esperada, ninguno de estos pasos implementado todavía:

```
Finding (detección/regla/evento)
  → OperationalTask (se decide que hay que actuar)
    → AutomationSuggestion (se sugiere cómo, opcionalmente con aprobación requerida)
      → MessageDraft / Communication (el mensaje concreto, draft o enviado)
        → Timeline (queda registrado lo que pasó)
```

Cada flecha es una decisión propia (humana o de negocio) — ninguna etapa salta directo a la siguiente sin pasar
por la unidad `OperationalTask` que les da contexto y trazabilidad.

### 9.7 Anti-patterns a evitar

- **Task inflation**: generar una `OperationalTask` por cada micro-evento, hasta que la bandeja operativa se vuelva
  ruido y pierda señal.
- **Burocracia manual**: diseñar fases futuras asumiendo que el escribano va a mantener disciplinadamente un
  registro manual completo — contradice el supuesto de producto de la sección 9.1.
- **Convertir cada llamada o gestión menor en una tarea formal** cuando no aporta memoria operativa real ni
  contexto reutilizable.
- **Enviar WhatsApp/email directamente** sin pasar por una `OperationalTask` (que da contexto) ni por la
  aprobación humana que ya exige la sección 5, regla 5 — un envío automático nunca debe saltarse la unidad
  operativa ni el `requiresApproval`.

## 10. `OperationalEvent` vs `OperationalTask`: event-informed, task-driven

> Decisión cerrada tras evaluar si convenía invertir el modelo hacia "todo es un evento, la tarea es una
> proyección derivada". **No se reemplaza `OperationalTask` por `OperationalEvent`.** La dirección es un modelo
> híbrido: *event-informed, task-driven*. Esta sección documenta esa decisión — no implementa nada.

### 10.1 Qué es `OperationalEvent`

Un **hecho, detección o registro inmutable**: algo que pasó o algo que el sistema detectó, en un momento dado, sin
estado propio que evolucione. Ejemplos: "el DNI del vendedor está vencido", "el comprador respondió un WhatsApp",
"venció el plazo de un certificado", "el legajo entró a Pre-cierre". Un `OperationalEvent` no se completa, no se
reabre, no se cancela — ocurrió o se detectó, y eso no cambia.

### 10.2 Qué es `OperationalTask` / `OperationalWorkItem`

La **unidad accionable con estado**: lo que organiza qué hay que hacer, qué está pendiente, qué se completó, qué
se canceló, qué está agendado para hoy. Es exactamente el modelo ya definido en la sección 3.2 — esta sección no
le cambia el shape, solo aclara su relación con `OperationalEvent`. `OperationalWorkItem` es un nombre alternativo
para el mismo concepto (no una entidad distinta) — se usa indistintamente según convenga al hablar de "trabajo
pendiente" vs "tarea".

### 10.3 Por qué no hacemos event-only

Si todo fuera `OperationalEvent` y la "tarea" fuera solo una proyección/función derivada en el momento de
consultarla, se perdería la capacidad de responder con un dato simple y persistente preguntas como "¿esto ya
está pendiente, completado o cancelado?", "¿está agendado para hoy?", "¿quién lo marcó como hecho y cuándo?".
Esas respuestas requieren un registro que **vive y se actualiza in place**, no una proyección recalculada sobre
un log de eventos inmutables. Un modelo event-only también complica innecesariamente lo simple: completar una
tarea pasaría a ser "agregar un evento de tipo completado y inferir el estado actual reconstruyendo el historial",
en vez de "cambiar un campo `status`".

### 10.4 Por qué `OperationalTask` no puede ser solo una función derivada sin estado

Una función derivada (ej. "calcular qué tareas existen a partir de los eventos") no tiene identidad propia ni
puede persistir decisiones humanas como "completé esto", "lo cancelé", "lo reagendé para hoy" — esas son
mutaciones de estado que necesitan vivir en algún lado entre una consulta y la siguiente. Sin una entidad con
estado persistido, cada acción del usuario (completar, reabrir, eliminar) no tendría dónde escribirse.

### 10.5 Cómo una función/regla/IA puede sugerir o crear tasks

Una regla de negocio, un detector del sistema, o un modelo de IA puede **leer `OperationalEvent`s** y, a partir de
ahí, **crear una `OperationalTask`** (con `origin: 'system'` o `'ai'`, ver sección 9.3) o una `AutomationSuggestion`
asociada a una tarea ya existente. El evento informa la decisión; la tarea es la decisión materializada con
estado propio. De ahí "event-informed, task-driven": los eventos alimentan la inteligencia que decide qué hacer,
pero lo que efectivamente hay que hacer (y su ciclo de vida) vive en la tarea.

### 10.6 Por qué una task necesita identidad y lifecycle

```
status: 'pending' | 'done' | 'cancelled'
scheduledForDate   // cuándo se planeó trabajarla — separado de "existe"
completedAt        // cuándo efectivamente se resolvió — separado de "está agendada"
```

Estos campos (ya implementados en `operationalTasksStore.js`, sección 7) son exactamente lo que un evento
inmutable no puede ofrecer: una tarea puede pasar por varios estados a lo largo del tiempo, reagendarse,
reabrirse — un evento no.

### 10.7 Relación futura

```
Finding / OperationalEvent
  → OperationalTask / OperationalWorkItem   (se decide que hay que actuar, con estado propio)
    → AutomationSuggestion                   (se sugiere cómo, opcionalmente con aprobación)
      → MessageDraft / Communication         (el contacto real, draft/enviado/fallido)
        → Timeline                            (queda registrado lo que pasó)
```

(Misma cadena de la sección 9.6, con `OperationalEvent` ahora explícito como el primer eslabón — "Finding" y
"OperationalEvent" son, en la práctica, el mismo concepto.)

### 10.8 Separación de responsabilidades

| Entidad | Responde a |
|---|---|
| `OperationalEvent` | ¿Qué pasó? ¿Qué se detectó? |
| `OperationalTask` / `OperationalWorkItem` | ¿Qué hay que hacer? ¿Qué está pendiente? |
| `Communication` / `MessageDraft` | ¿Hubo (o habrá) contacto real con alguien? |
| `Timeline` | ¿Cuál es la narrativa/auditoría de todo esto? |
| "Tareas del día" | ¿Qué de todo lo pendiente está seleccionado para trabajar hoy? (vista filtrada, no entidad) |

### 10.9 Backend futuro orientativo (no implementar)

Si esto migra a backend real, la separación de tablas/colecciones sugerida es:

- `operational_events` — append-only, inmutable.
- `operational_tasks` / `operational_work_items` — mutable, con `status`/`scheduledForDate`/`completedAt`.

El `Timeline` que consume la UI se construye **a partir de** `operational_events` (y de los cambios de estado de
tasks/communications que se quieran narrar), pero **nunca es la fuente de verdad operativa** — es una vista de
lectura/auditoría, igual que "Tareas del día" es una vista filtrada sobre tasks.

### 10.10 Anti-patterns (extienden la lista de la sección 9.7)

- **Todo es timeline**: tratar el log de eventos como si fuera el lugar donde vive el estado operativo — el
  Timeline es narrativa, no fuente de verdad (sección 10.8).
- **Todo es evento**: el extremo opuesto — modelar la tarea como una proyección derivada sin estado propio
  (sección 10.3/10.4). Ninguno de los dos extremos reemplaza al modelo híbrido.
- **Task inflation** (ya en 9.7): generar una `OperationalTask` por cada `OperationalEvent` sin criterio.
- **IA que manda WhatsApp directo** sin pasar por una `OperationalTask` ni por aprobación humana — un
  `OperationalEvent` detectado por IA puede sugerir, nunca ejecutar una comunicación real por su cuenta.
- **`follow_up` como entidad base**: sigue siendo un `subtype` de `OperationalTask`, nunca el modelo (regla 7,
  sección 5, reafirmada acá).
- **`dayTasks` (pending/done) como fuente de verdad**: sigue siendo una vista/selección de hoy sobre tareas
  formales del checklist — no es ni debe convertirse en el almacén general de "qué hay que hacer" del sistema.
