# Task Card Action Surface — SPEC

> **Fase C del roadmap** ([`MPROP_DEMO_FUNCTIONAL_ROADMAP.md`](MPROP_DEMO_FUNCTIONAL_ROADMAP.md)). Documento
> conceptual de producto/arquitectura. **No es implementación.** Define la **Task Card como superficie de acción
> contextual** apoyada en el modelo de proceso/actividad ya documentado.
>
> **Marcadores:** 🟢 decisión conceptual (rige) · 🔵 recomendación/dirección futura · 🚧 WIP (depende de
> entidades/infra que aún no existen) · ⛔ no implementar todavía.
>
> Bases: [`PROCESS_ACTIVITY_UX_MODEL.md`](PROCESS_ACTIVITY_UX_MODEL.md) ·
> [`UI_SEMANTIC_SYSTEM.md`](UI_SEMANTIC_SYSTEM.md) (§4A gramática compacta, §4B expand) ·
> [`OPERATIONAL_TASKS_ARCHITECTURE.md`](OPERATIONAL_TASKS_ARCHITECTURE.md).

---

## 0. Tesis

La Task Card **no** es una tarjeta suelta, **no** es la fuente de verdad documental, **no** define el estado formal
del legajo. La Task Card **acciona sobre algo**: un `ProcessNode`/requisito, un `DocumentRequirement`, un
`ActivityEvent`, una alerta, un bloqueo o una responsabilidad operativa pendiente.

Principio heredado: *el estado vive en el nodo · el evento explica cambios · la task acciona · el documento prueba ·
la responsabilidad operativa rutea.*

---

## 1. Qué es una OperationalTask

🟢 Una **unidad accionable con estado** que representa algo que hay que hacer para resolver, empujar o monitorear un
requisito del legajo. Tiene identidad propia, ciclo de vida (§14) y referencias opcionales a lo que acciona.
(Modelo de datos: `OPERATIONAL_TASKS §3.2`.)

## 2. Qué NO es una OperationalTask

🟢
- No es la **fuente de verdad del estado** (eso es el `ProcessNode`/`ChecklistItem`).
- No es el **documento** ni su validez (eso es `DocumentRequirement`/Documentos).
- No es la **bitácora** (eso es `ActivityEvent`).
- No es el **checklist formal** ni lo avanza por sí misma.
- No es la **responsabilidad operativa** (la task orienta/empuja; no define quién tiene la responsabilidad).

---

## 3. 🟢 Decisión central — Task compacta vs expandida (modelo HÍBRIDO)

- **Compacta:** superficie de **escaneo**. Vive en Tareas del día y en Operativa. Gramática de `UI_SEMANTIC §4A`.
- **Expandida:** superficie de **resolución contextual**, resuelta de forma **híbrida** según dónde estás:
  - **En Tareas del día (fuera del legajo)** → **expand liviano**: la card abre una vista expandida que *proyecta*
    datos del nodo/requisito (estado, responsable, evidencia, eventos relevantes) + acciones. No reemplaza al nodo;
    lo proyecta para no obligar a salir de la bandeja diaria.
  - **En Operativa / Avance del proceso (ya estás en el legajo)** → la card **rutea al requisito en Avance del
    proceso** (la superficie de detalle canónica). No se crea una tercera superficie de detalle compitiendo.

🟢 Regla anti-"tercera superficie": el detalle canónico del estado es el **nodo en Avance**. El expand liviano de
Tareas del día es una **proyección de lectura + acciones**, nunca una fuente de verdad paralela.

---

## 4. Qué debe mostrar una Task compacta

🟢 (`UI_SEMANTIC §4A`)
```
[BADGE-tipo]  Acción concreta
              Dirección simplificada
              MP-ID
```
- Badge = **tipo** (Proceso · Seguimiento · Revisión · Tarea fallback).
- Severidad = **tratamiento visual** (acento/ícono/tono: rojo crítica, ámbar media, neutro si no).
- Estado (pending/done/cancelled/`needs_review`) = atenuación/tachado/marcador, **misma estructura**.

## 5. Qué NO debe mostrar una Task compacta

🟢 Responsable como pill · origin/manual como pill · sourceLabel como pill · metadata secundaria de más · el log de
eventos · el documento embebido. Todo eso es de la **expandida/detalle**.

## 6. Qué debe mostrar una Task expandida

🚧 (lente sobre el nodo; depende del campo de referencia, §15)
- **Del ProcessNode/requisito:** label, estado actual, "¿bloquea firma?", responsable actual, evidencia disponible.
- **De ActivityEvent:** **solo eventos relacionados relevantes** (no el log completo — eso es Bitácora). Ver §8/§9.
- **De la OperationalTask:** tipo, severidad, origen, estado, acciones.
- **Acciones contextuales:** §13.

---

## 7. 🟢 Relación con Avance del proceso

La task **referencia** un `ProcessNode`/requisito (`relatedProcessNodeId`, 🚧 futuro). El requisito en Avance es la
**superficie de detalle canónica**; la task aporta **acción** sobre ese nodo. En modo "rutea al nodo" (Operativa/
Avance) la task lleva ahí; en modo "expand liviano" (Tareas del día) proyecta el nodo. **La task nunca cambia el
estado del nodo por sí misma** (§14).

## 8. 🟢 Relación con Bitácora / Eventos

- La **Bitácora** conserva el **historial completo** de `ActivityEvent` (proyección global, cronológica).
- La **Task expandida** muestra **solo eventos relacionados relevantes** al nodo/requisito (proyección contextual,
  resumida) — **nunca** el log completo, **nunca** un log propio. Es la misma proyección por filtro de
  `PROCESS_ACTIVITY §4` (un store, dos vistas).

## 9. 🟢 Regla arquitectónica — Evento vs Estado

- **`ActivityEvent` no es el estado.** Puede **causar o explicar** un cambio de estado, pero no lo *es*.
- **`ProcessNode`/`ChecklistItem` conserva el estado actual.**
- **Avance del proceso** muestra el **estado actual** + una **selección contextual** de eventos relacionados.
- **Bitácora** muestra el **historial completo**.

### 9.1 🟢 Clasificación de eventos

**Categoría 1 — pueden disparar cambio de estado mediante regla/proyección** (no por la task, sino por la regla del
workflow):
`document_uploaded` · `document_validated` · `document_rejected` · `requirement_observed` ·
`requirement_completed` · `signature_scheduled` · `payment_confirmed`.

> ⚠️ **Aclaración clave:**
> - `document_uploaded` **no** completa automáticamente un requisito → puede llevar a **`needs_review`** / pendiente
>   de validación.
> - `document_validated` **sí** puede permitir marcar un requisito como **completo**, si la regla lo permite.

**Categoría 2 — explican el estado pero no lo cambian solos:**
`document_requested` · `reminder_sent` · `actor_assigned` · `comment_added` · `follow_up_created`.

**Categoría 3 — puramente auditables:**
`user_opened_case` · `preview_generated` · `minor_internal_note_edited` · `ui_preference_changed`.
🟢 Estos viven **principalmente en Bitácora** y **no deben contaminar el Avance del proceso** (ni la Task expandida).

### 9.2 🟢 Qué eventos ve la Task expandida
Categorías **1 y 2 relevantes al nodo** (explican estado / pueden cambiarlo) — **nunca** categoría 3. Y siempre
resumido + "ver todo" → Bitácora filtrada.

---

## 10. 🟢 Relación con DocumentRequirement / Evidencia

🚧 (requiere `DocumentRequirement`, futuro)
- `DocumentRequirement.processNodeId` conecta el requisito documental al nodo.
- La task **referencia** (`relatedDocumentRequirementId`), no posee el documento.
- La evidencia se **proyecta** desde el dominio Documentos; el upload **delega** al mismo componente del tab
  Documentos (§13).
- `document_uploaded` → `needs_review`; `document_validated` → puede completar el requisito (§9.1).

## 11. 🟢 Relación con Responsabilidad operativa

- **Responsable actual:** se muestra en la **expandida/detalle** (y en el nodo en Avance), **no** como pill en la
  compacta ni integrado al título.
- **Historial de responsabilidad:** en el popover "Responsabilidad operativa" y como eventos `actor_assigned`
  (categoría 2) en la Bitácora.
- La responsabilidad **orienta** a quién contactar/esperar/escalar; **no** define el estado ni resuelve la task.

## 12. 🟢 Tipo / severidad / origen / responsable (cómo tratarlos)

(`UI_SEMANTIC §4A`)
- **Tipo** → badge (única función del badge).
- **Severidad** → tratamiento visual (acento/ícono/tono); persiste atenuada en done/cancelled.
- **Origen** → detalle/expand, nunca pill en la compacta.
- **Responsable** → detalle/expand, nunca pill principal ni título.

## 13. Anti-duplicación: "referencia, proyecta, delega"

🟢 La task **nunca** duplica checklist, documentos ni bitácora:
- **Referencia** el nodo/requirement/evento por id.
- **Proyecta** (lee) su estado/eventos/evidencia; no los copia.
- **Delega** las acciones al dominio dueño (ver §14).

## 14. Acciones que puede exponer (y a quién delega)

🟢 La task **expone** acciones, pero **delega** la ejecución al dominio correspondiente:

| Acción | Delega a | Nota |
|---|---|---|
| Subir documento | **dominio Documentos** (mismo componente del tab Documentos) | genera `document_uploaded` |
| Solicitar a `<actor>` | 🚧 Communication/MessageDraft (futuro) | genera `document_requested`/`reminder_sent` |
| Crear seguimiento | crea otra `OperationalTask` (`subtype: follow_up`) | genera `follow_up_created` |
| Completar / Reabrir / Cancelar | el propio store de tasks | cambia status de la task, **no** del nodo |
| Observar / Validar | 🚧 regla del workflow sobre el `ProcessNode` (futuro) | genera `requirement_observed`/`document_validated` |

🟢 Regla "expone, no posee": la task no es un mini-CRM ni un repo. Si una acción muta el dominio, la ejecuta el
dominio; la task solo la **ofrece** en su contexto.

## 15. Estados de la task (ciclo de vida)

🟢 Actuales: `pending` · `done` · `cancelled`.
🚧 Futuro: **`needs_review`** — cuando un **evento externo satisface parcialmente** una condición que **requiere
validación humana** (ej. una parte sube el documento → `document_uploaded` → la task queda "lista para revisión",
no "done"). Reglas:
- 🟢 La task **no cambia el estado formal** del nodo por sí misma.
- 🟢 La task **reacciona a eventos**: un evento de categoría 1 (§9.1) sobre su nodo/requirement puede llevarla a
  `needs_review` (si requiere validación) o habilitar `done` (si la regla lo permite, p. ej. tras
  `document_validated`).
- 🟢 La dirección es **evento del dominio → la task reacciona**; nunca task → estado del nodo.

---

## 16. Qué se puede simular hoy (sin backend)

- **Compacta:** la gramática de `UI_SEMANTIC §4A` es 100% simulable con el `operationalTasks` store actual.
- **Expand (degradado):** se puede mostrar lo que la task ya tiene (`sourceLabel`, alerta, op) — pero **no** la
  lente real al nodo, porque hoy **las tasks no referencian nodos**.

## 17. Qué requiere cambio de modelo / backend

🚧
- `relatedProcessNodeId` / `relatedDocumentRequirementId` en la OperationalTask (cambio **aditivo** de shape → es
  implementación, fuera de esta fase).
- `ProcessNode`/`ChecklistItem` y `DocumentRequirement` como entidades formales.
- `ActivityEvent` con `relatedProcessNodeId` + las categorías de §9.1.
- La **regla/proyección** evento→estado y la reacción evento→task (`needs_review`/`done`).
- `needs_review`, validaciones reales, Communication/MessageDraft, panel de partes.

## 18. ⛔ Qué NO implementar todavía

Nada de código en esta fase. En particular: no Task Card (compacta ni expandida) · no expand · no `relatedProcessNodeId`
· no `needs_review` · no reacción a eventos · no acciones (upload/solicitar/observar/validar) · no refactor de
TasksBoard · no stores/rutas/componentes/backend. Esta fase es **solo este documento**.

---

## 19. Fases recomendadas (spec → UI)

| Fase | Qué | Estado |
|---|---|---|
| **C1** | Este SPEC (modelo conceptual de la action surface) | 🟢 en curso |
| **C2** | Implementar **Task Card compacta** (view-model + renderer, `UI_SEMANTIC §4A`) | 🔵 después de cerrar C1 |
| **C3** | Adapter de tarea formal → mismo renderer (gramática compartida) | 🔵 |
| **C4** | Agregar `relatedProcessNodeId`/`relatedDocumentRequirementId` (cambio aditivo de shape) | 🚧 |
| **C5** | **Expand híbrido** (proyección en Tareas del día · ruteo al nodo en Operativa/Avance) | 🚧 |
| **C6** | Acciones contextuales con delegación al dominio (upload, seguimiento, etc.) | 🚧 |
| **C7** | Reacción a eventos + `needs_review` (regla evento→task) | 🚧 backend |

---

## 20. Cierre

🟢 **Decidido:** la task es una superficie de acción que referencia/proyecta/delega; compacta = escaneo, expandida =
resolución contextual **híbrida** (expand liviano en Tareas del día, ruteo al nodo en Operativa/Avance); el estado
formal vive en el `ProcessNode`; la task reacciona a eventos pero nunca avanza el workflow por sí misma; los eventos
se clasifican en disparadores-de-estado / explicativos / auditables, y solo los dos primeros (relevantes al nodo)
aparecen en la expandida.
🔵 **Dirección futura:** C2-C3 (compacta) cuando se abra implementación; C5-C7 cuando haya campo de referencia y,
para la reacción, backend.
⛔ **Ahora:** solo este documento. No se abre implementación de Task Card hasta cerrar este SPEC.
