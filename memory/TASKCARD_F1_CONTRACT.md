# TaskCard F1 — Checklist de contrato (cerrada)

> **Contrato de implementación de F1** (card compacta) — la lección del snowball: el código implementa un contrato
> ya cerrado, **no lo descubre**. Cualquier desvío se discute **antes** de codear, no durante.
> Fuentes: `UI_SEMANTIC_SYSTEM.md §4A` + `TASK_CARD_ACTION_SURFACE_SPEC.md`.
>
> **Alcance F1:** un renderer compacto único de OperationalTask en **TasksBoard** (pending/done/cancelled) +
> un micro-ajuste mínimo de la tarea formal completada (§7). No expand · no Operativa · no migrar formal completo.
>
> **Frase guía:** *unificar gramática visual NO significa unificar fuentes, secciones ni responsabilidades.*

---

## 0. Separación de secciones (no fusionar)

🟢 "Renderer unificado" = **misma gramática visual**, NO una sola lista de todo. Se mantienen separadas:

- **"Tareas del día"** → tareas **formales / proceso / escribanía**.
- **"Tareas operativas"** → **OperationalTasks** (desde alertas, revisiones, seguimientos, memoria operativa).
- **TaskCard F1 aplica principalmente a "Tareas operativas".**
- La tarea **formal** recibe solo un **micro-ajuste visual mínimo** (badge muted "Proceso", §7); **no** se migra al
  modelo OperationalTask, **no** adapter formal completo.

⛔ No fusionar secciones · no convertir "Tareas del día" en lista única de todo · no cambiar la semántica de los
conteos · no cambiar stores.

---

## 1. View-model exacto (lo único que consume `TaskCard`)

`taskCardPresentation(task, op)` → ViewModel puro (sin React, sin store):

```
{
  id,                                   // task.id
  kind: 'operational',                  // F1: solo operacional (formal = micro-ajuste §7)
  type: 'seguimiento'|'revision'|'tarea',       // tipo (NO compuesto con severidad)
  typeLabel: 'Seguimiento'|'Revisión'|'Tarea',  // label del badge (TIPO solo)
  title,                                // task.title (texto crudo, sin prefijos)
  addressLine,                          // op.direccion
  legajoId,                             // op.id
  severity: 'critica'|'media'|null,     // deriva de sourceLabel (review+alert); si no, null
  roleLabel: string|null,               // rol corto del responsable (ver §2) — ej. "Gestoría"
  status: 'pending'|'done'|'cancelled', // task.status
  detail: {                             // NO se renderiza en F1 (reservado a expand C5)
    origin, sourceLabel, createdAt, completedAt
  }
}
```

- **Badge = tipo.** `typeLabel` nunca incluye severidad/origen. **Prohibido** `"Revisión · Alerta crítica"`.
- Subtype desconocido → `type:'tarea'`, `typeLabel:'Tarea'` (nunca string técnico).
- `roleLabel` = rol corto derivado de `relatedActorLabel`/`bloqueoActor` (ver §2); puede ser `null`.
- `detail.*` viaja en el view-model pero **no se pinta** en F1.

---

## 2. Rol / responsable en la compacta (`roleLabel`)

🟢 El responsable **sí se muestra** en la compacta, pero como **rol corto**, no texto largo.

- Valores: `Gestoría` · `Escribanía` · `Comprador` · `Vendedor` · `Banco` · `Tercero` (rol corto, 1 palabra).
- **Rendering:** texto simple, **semibold**, neutral (slate). **Sin pill, sin badge, sin color semántico fuerte.**
- **Sin prefijo "Resp."** salvo ambigüedad real.
- **Ubicación:** zona estable de metadata, **arriba a la derecha** (misma fila que el badge de tipo).
- No debe competir con el badge de tipo ni reemplazar la severidad.
- Si no hay rol → no se muestra nada (sin placeholder).

### 2.1 Animación del rol (solo Escribanía)
🟢 La animación sutil de opacidad **solo** aplica cuando `roleLabel === 'Escribanía'` y la task está
**pending/active**:
- opacidad oscilante ~**72%–100%**, duración **2.8s–3.2s**, **ease-in-out**.
- **Respetar `prefers-reduced-motion`** (si está activo, texto estable).
- Cualquier otro rol (Gestoría/Comprador/Vendedor/Banco/…) → **texto estable, sin animar**.
- **Done y cancelled → nunca animan**, aunque el rol sea Escribanía.

Motivo: la animación señala **acción interna de escribanía / foco operativo propio** — no responsabilidad externa,
no severidad, no loading.

---

## 3. Severidad: ícono de criticidad, NO el badge de alerta

🟢 Cuando la task nació de una **alerta crítica/media**, **no** se reutiliza el badge completo de alerta. Se
reutiliza **solo el ícono de criticidad** que vive dentro de ese badge.

- Usar **solo el ícono** (no el contenedor/pill, no el sombreado, no el fondo coloreado fuerte).
- **No** escribir "Alerta crítica" en la compacta. **No** badge compuesto "Revisión · Alerta crítica".
- La severidad se expresa con: **ícono de criticidad + acento lateral + tratamiento visual sutil** (rojo crítica /
  ámbar media). El **badge sigue siendo solo el tipo** (Revisión / Seguimiento / Proceso / Tarea).
- **Persistencia:** mismos tokens de severidad en pending/done/cancelled. En **done/cancelled** el ícono de
  criticidad **persiste atenuado** (por `opacity`), sin badge sombreado ni fondo fuerte.
- 🔴 Regla dura (fix B1): una `review` de Alerta crítica **completada** sigue leyéndose crítica (rojo atenuado),
  nunca vuelve a sky/neutro.

---

## 4. Acciones icon-only

🟢 Sin labels de texto visibles en la card. Solo iconos.

| Estado | Acciones (icon-only) |
|---|---|
| **pending** | ícono **completar** (→ `complete`) · ícono **cancelar** (→ `cancel`) |
| **done** | ícono **reabrir** (→ `reopen`) |
| **cancelled** | no se muestra por defecto en Tareas del día (§6); si a futuro se mostrara, ícono **reabrir** (nunca eliminar) |

**Accesibilidad obligatoria** en cada botón icon-only:
- `aria-label` + `title`, con texto: "Completar tarea" · "Cancelar tarea" · "Reabrir tarea".
- Ese texto **no** se muestra visible en la card.

**Semántica cerrada:**
- 🟢 **Cancelar NO borra** → cambia `status` a `cancelled` (`operationalTasks.cancel`).
- 🟢 **`remove()` no se invoca desde TasksBoard.** Sin hard delete en F1.
- 🟢 **Done no tiene "Eliminar".** Cancelled no tiene "Eliminar".

---

## 5. Qué renderiza cada estado (misma estructura, no reordenar)

Estructura única para los tres:
```
[acento sev.] [ícono sev. si aplica] [BADGE-tipo]            [rol corto]
Título de acción
Dirección · MP-ID
[acciones icon-only según estado]
```

| Estado | Diferencia visual | Acciones | Rol animado |
|---|---|---|---|
| **pending** | tono pleno | completar · cancelar | sí, solo si rol = Escribanía |
| **done** | `opacity` reducida + **título tachado** | reabrir | **no** |
| **cancelled** | (oculto por defecto, §6) | reabrir (futuro) | **no** |

- Done/cancelled **no** reordenan ni cambian tamaños; solo atenúan/tachan + cambian acción.

---

## 6. Cancelled — comportamiento

🟢
- `cancel` **saca la task del flujo activo** sin borrar memoria (sigue en el store).
- **No** aparece por defecto en la vista principal de Tareas del día.
- **No** se crea sección visible "Canceladas" en F1 (queda para fase futura / superficie secundaria).
- 🟢 **Cancelled no cambia el ícono de la card:** el tipo permanece, la severidad permanece, el ícono de
  criticidad (si existía) persiste atenuado. **No** usar un ícono de "cancelado" como ícono principal.
- Cancelar ≠ remove/hard delete.
- 🟢 **`TaskCard` debe soportar `pending`/`done`/`cancelled` como estados del view-model, pero en TasksBoard F1 las
  tareas `cancelled` se filtran fuera del flujo visible principal.** (El renderer sabe dibujar cancelled; el board
  F1 simplemente no le pasa esas tareas por defecto.)

(Recordatorio: pending → tareas activas; done → "Completadas hoy"; cancelled → fuera del flujo visible principal.)

---

## 7. Micro-ajuste permitido: tarea formal en "Completadas hoy"

🟢 F1 es principalmente para OperationalTasks, pero para que "Completadas hoy" no mezcle dos lenguajes:
- **Permitido:** agregar a `DoneItem` formal un badge **muted "Proceso"** y alinear lo mínimo con la gramática de
  `TaskCard`.
- ⛔ **No** crear adapter formal completo · **no** `ProcessNode` · **no** expand formal · **no** tocar stores ·
  **no** migrar toda la tarea formal al nuevo renderer.

---

## 8. Jerarquía visual (ejemplos cerrados)

**pending crítica (rol Escribanía → rol animado):**
```
[ícono crítico] [Revisión]                         Escribanía
Solicitar nuevo certificado de dominio
Av. Libertador 123 · MP-328552
[✓] [✕]
```
**done crítica (rol Gestoría → estable, ícono crítico atenuado):**
```
[ícono crítico atenuado] [Revisión]                Gestoría
Solicitar nuevo certificado de dominio
Av. Libertador 123 · MP-328552
[↺]
```
Done = misma estructura, atenuada, sin "Eliminar". Cancelled no se muestra por defecto.

> Las acciones son **icon-only**: en la card solo se ve el ícono (`[✓]` `[✕]` `[↺]`). Los textos "Completar tarea",
> "Cancelar tarea" y "Reabrir tarea" existen **solo en `aria-label`/`title`**, nunca visibles en la card.

---

## 9. Qué NO incluir en la compacta (⛔)

origen como pill · `sourceLabel` como pill · "Manual" como badge protagonista · "Alerta crítica" como texto en el
badge · badge compuesto "Revisión · Alerta crítica" · responsable como pill · historial · eventos relacionados ·
documentos · evidencia · expand · acciones contextuales múltiples · `needs_review` · `DocumentRequirement` ·
**subtasks · mini-checklist interno · grouping por legajo**.

---

## 10. Prohibiciones vigentes (fuera de F1) ⛔

expand · `needs_review` · `DocumentRequirement` · evidencia · eventos relacionados · Avance del proceso · Bitácora ·
backend · cambios de shape de stores · migrar Operativa al renderer · refactor grande de TasksBoard · tie-in con
Programar firma · tie-in con Subir documento · **subtasks · grouping por legajo · collapse/expand de grupos ·
`parentTaskId` · `childTaskIds` · `relationType` · task sets · templates · bulk actions · agrupar por hito ·
convertir Avance en TaskBoard**.

---

## 11. Archivos (alcance esperado)

- **Nuevos:** `taskCardPresentation.js` (adapter puro) · `TaskCard.jsx` (renderer compacto).
- **Modificado:** `TasksBoard.jsx` — reemplazar `FollowUpItem` + `FollowUpDoneItem` por **un** `TaskCard`
  (pending/done/cancelled); X → `cancel`; badge muted "Proceso" en `DoneItem` formal (§7).
- (Posible) CSS/keyframe para la animación de opacidad del rol Escribanía (si no hay uno reutilizable).
- Nada más.

---

## 12. Criterios de aceptación

- [ ] `review·crítica` se ve igual (ícono crítico + acento rojo) en pending **y** done (atenuada). Nunca sky.
- [ ] `review·media` mantiene ámbar en ambos estados.
- [ ] `follow_up` neutro/sky en ambos estados.
- [ ] Badge = solo tipo; nunca "· Alerta crítica" ni strings técnicos; desconocido → "Tarea".
- [ ] **Rol corto** visible (semibold, neutral, sin pill), arriba a la derecha; sin "Resp." salvo ambigüedad.
- [ ] Animación de opacidad **solo** en rol Escribanía + pending; respeta `prefers-reduced-motion`; nunca en done/cancelled.
- [ ] Acciones **icon-only** con `aria-label`+`title`; sin texto visible.
- [ ] "✕" cancela (no borra): la task sigue en el store (visible como cancelada en Operativa).
- [ ] Done sin "Eliminar"; cancelled fuera del flujo principal; cancelled conserva ícono de tipo/severidad.
- [ ] "Completadas hoy" formal muestra badge muted "Proceso" (gramática alineada).
- [ ] `CI=true npx yarn@1.22.22 build` → verde · `git diff` limpio (solo archivos de §11).

---

## 13. Consecuencias conscientes (decididas, no bugs)

- **Done deja de tener "Eliminar"** (solo "Reabrir"); la baja se hace por `cancel` (desde pending) o roll-off del
  día. Memoria preservada (Operativa = memoria, no descartable).
- **Cancelled desaparece del flujo principal** en F1 (sin sección visible); su memoria queda en el store para una
  vista/filtro futuro.

---

## 14. Portabilidad del renderer (futuro grouping / subtasks)

🔵 Hipótesis futura: si se incorporan subtasks o múltiples tareas por legajo, la vista global de Tareas del día
podría **agruparse por legajo** con collapse/expand por grupo. **Queda fuera de F1.**

🟢 Pero `TaskCard` debe diseñarse **portable** desde ya:
- Puede vivir hoy en una **lista plana**; debe poder vivir mañana dentro de un `OperationTaskGroup`/`LegajoTaskGroup`.
- **No** debe depender de que el board sea plano, **no** asumir que la card está sola.
- **No** debe contener lógica de **agrupación** ni de **subtasks** dentro del renderer (el renderer solo dibuja una
  card a partir del view-model; la agrupación, si llega, vive afuera).

⛔ En F1: no implementar agrupación por legajo · no collapse/expand de grupos · no subtasks · no `parentTaskId` ·
no `childTaskIds` · no `relationType` · no `TaskGroup` · no cambiar stores.

**Concepto futuro (no implementar):** `OperationTaskGroup`/`LegajoTaskGroup` podría agrupar por `operationId` /
dirección / MP-ID / cantidad / severidad máxima / próxima acción / responsable dominante, con estado
collapsed/expanded local de UI. **Subtasks** es una fase distinta (no es lo mismo que agrupar por legajo): requiere
modelo de relación (`parentTaskId`/`childTaskIds`/`relationType`) y subtipos de relación (`follow_up`, `dependency`,
`split_action`, `review_after_upload`) — fuera de F1.

---

## 15. Future ProcessNode Task Sets (fuera de F1)

🔵 A futuro, **Avance del proceso** podría exponer sets de tareas sugeridas por hito/requisito. **Fuera de F1.**

Concepto:
- Un `ProcessNode`/Hito puede definir **`TaskSetTemplates`** — **no son tareas vivas**.
- Una `OperationalTask` es la **instancia** creada desde una plantilla, evento, alerta o acción manual.
- Avance puede mostrar **acciones sugeridas / tareas relacionadas**; el **TaskBoard** muestra tareas **instanciadas**.
- `TaskCard` F1 debe ser portable para vivir dentro de grupos por legajo o hito en el futuro (§14).

⛔ Prohibido en F1: crear task sets · crear templates · bulk actions · agrupar por hito · convertir Avance en
TaskBoard · crear `parentTaskId`/`childTaskIds`/`relationType`.
