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
  typeLabel: 'Seguimiento'|'Revisión'|'Tarea',  // texto base de tipo — usado SOLO en title/aria-label del ícono (§3), no visible
  title,                                // task.title normalizado (sin punto final), SIN rol integrado
  displayTitle,                         // título a renderizar — title + rol integrado (ver §2), lo único que pinta TaskCard
  addressLine,                          // op.direccion
  legajoId,                             // op.id
  severity: 'critica'|'media'|null,     // deriva de sourceLabel (review+alert); si no, null
  roleLabel: string|null,               // rol corto del responsable (ver §2) — insumo de displayTitle, no se pinta directo
  status: 'pending'|'done'|'cancelled', // task.status
  detail: {                             // NO se renderiza en F1 (reservado a expand C5)
    origin, sourceLabel, createdAt, completedAt
  }
}
```

- 🟢 **(Revisión F2) Tipo = forma del ícono, sin badge textual visible.** `typeLabel` ya no se pinta como
  badge; viaja en el view-model y se usa únicamente para componer el `title`/`aria-label` accesible del ícono
  (ver §3). **Prohibido** `"Revisión · Alerta crítica"` como texto visible.
- 🟢 **(Revisión F3) `displayTitle` es lo único que `TaskCard` pinta como título.** `title` sigue viajando en el
  view-model (texto base sin rol), pero la card renderiza `displayTitle` (título con rol integrado, ver §2).
- Subtype desconocido → `type:'tarea'`, `typeLabel:'Tarea'` (nunca string técnico).
- `roleLabel` = rol corto derivado de `relatedActorLabel`/`bloqueoActor` (ver §2); puede ser `null`. Ya no se
  pinta como pill — solo es insumo de `displayTitle`.
- `detail.*` viaja en el view-model pero **no se pinta** en F1.

---

## 2. Rol / responsable en la compacta (`roleLabel` → `displayTitle`)

🟢 **(Revisión F3)** El responsable **ya no se muestra como pill separado**. Se integra al **título visible**
(`view.displayTitle`), generado por `buildDisplayTitle(title, roleLabel)` en `taskCardPresentation.js`.

- **Sin role pill, sin "Resp.", sin metadata de responsable separada.** El único lugar donde el rol aparece es
  dentro del texto del título.
- `buildDisplayTitle`:
  - No muta `task.title` (dato fuente intacto); genera un string nuevo solo de presentación.
  - Patrón: `[título base] + [conector] + [roleLabel]`.
  - Conectores: `Gestoría → "a Gestoría"` · `Escribanía → "a Escribanía"` · `Comprador → "al Comprador"` ·
    `Vendedor → "al Vendedor"` · `Banco → "al Banco"` · `Tercero → "al Tercero"`.
  - Si el título base **ya menciona** el `roleLabel` (ej. el dato fuente ya viene como "Enviar WhatsApp a
    Gestoría"), **no duplica** el conector — lo deja igual.
  - Si no hay `roleLabel` (o no tiene conector mapeado) → `displayTitle` es solo el título base.
  - Quita el punto final del resultado (`stripTrailingDot`), igual que el título base.
- `roleLabel` **se mantiene en el view-model** (no se elimina del shape) porque es el insumo de
  `buildDisplayTitle` — pero `TaskCard.jsx` ya no lo lee directamente para pintar nada.
- 🟢 **Animación de rol eliminada por ahora.** No hay tratamiento animado de "Escribanía" en F1 (no hay pill que
  animar). Si a futuro se quisiera señalar foco operativo de escribanía, se diseña de nuevo — no asumir que la
  animación previa sigue vigente en otra forma.

---

## 3. Tipo + severidad: un solo ícono, sin badge textual ni badge de alerta

🟢 **(Revisión F2)** No hay badge visible de tipo ni de severidad. **Tipo = forma del ícono · severidad = color/
tono del ícono.** Cuando la task nació de una **alerta crítica/media**, **no** se reutiliza el badge completo de
alerta — se reutiliza **solo el ícono** que esa misma severidad usa en la card de Alertas (`Dashboard.jsx`).

- **Mapa de ícono por tipo** (`iconForType(type, severity)` en `TaskCard.jsx`):
  - `revision` + `severity:'critica'` → `ShieldAlert` (mismo ícono que Alertas crítica).
  - `revision` + `severity:'media'` o `null` → `AlertTriangle` (mismo ícono que Alertas no-crítica/media).
  - `seguimiento` → `MessageCircle` (hoy fijo, porque hoy `seguimiento` siempre llega con `severity:null`).
  - `tarea` (fallback) → `ClipboardList` (hoy fijo, porque hoy `tarea` siempre llega con `severity:null`).
  - **No inventar íconos nuevos** para revisión — siempre reusar los de Alertas.
- Usar **solo el ícono** (no el contenedor/pill, no el sombreado, no el fondo coloreado fuerte).
- **No** escribir "Alerta crítica" como texto visible. **No** badge compuesto "Revisión · Alerta crítica". **No**
  badge textual de tipo (ni "Revisión", ni "Seguimiento", ni "Tarea" visibles en la card).
- **Accesibilidad obligatoria:** el ícono lleva `title`+`aria-label` con el texto que antes era el badge:
  "Revisión crítica" · "Revisión media" · "Revisión" · "Seguimiento" · "Tarea". Sin texto visible, pero sin
  pérdida semántica para lector de pantalla / tooltip.
- La severidad se expresa con: **forma del ícono (revisión) + color del ícono** (rojo crítica / ámbar media / sky
  neutro). **Sin acento lateral** (eso es identidad de tarea formal, §0) — ver §3.1 para el border de perímetro
  (que no es acento lateral).
- **Persistencia:** mismos tokens de severidad en pending/done/cancelled. En **done/cancelled** el ícono
  **persiste atenuado** (por `opacity` del contenedor), sin badge sombreado ni fondo fuerte.

### 3.1 Border de perímetro — solo `severity === 'critica'`

🟢 **(Revisión F4)** Para que una task crítica se identifique de inmediato sin recurrir a badge/texto, las
`OperationalTask` con `severity === 'critica'` llevan **border de perímetro rojo** (no lateral — distinto del
acento de tarea formal, §0):

- **Aplica solo a:** `OperationalTask` con `severity === 'critica'`. **No** aplica a `media` ni a `null`
  (seguimiento/tarea sin severidad), **no** aplica a tareas formales/proceso.
- **Pending:** `border-red-300` (perímetro completo) + `ring-1 ring-red-100` + `bg-red-50/30`. Si en pantalla se
  ve débil, escalar a `border-red-400` (decisión visual, no de contrato).
- **Done/cancelled:** se mantiene `border-red-300` (mismo tono); la atenuación la da la `opacity-80` ya existente
  del contenedor — **no** se usa un tono de borde distinto para "atenuar", la opacidad general alcanza.
- **`media`:** sin border por decisión de diseño (evita ruido visual) — la severidad media se expresa solo con el
  ícono `AlertTriangle` ámbar. Si a futuro se necesitara reforzar, usar un tratamiento **más leve** que crítica
  (ej. `border-amber-200`/`ring-amber-100`), nunca igual o más fuerte que el de crítica.
- **No** es badge textual, no es badge sombreado completo de alerta, no escribe "Alerta crítica", no es acento
  lateral (`absolute left-0 ...`, eso sigue reservado a `FormalTaskRow`, §0).
- 🔴 Regla dura (fix B1): una `review` de Alerta crítica **completada** sigue leyéndose crítica (`ShieldAlert`
  rojo atenuado), nunca vuelve a `AlertTriangle`/sky.
- 🟢 **Regla de diseño (no acoplar tipo a un único portador de severidad):**
  - Tipo = forma del ícono. Severidad = color/tratamiento visual del ícono. Son dos ejes independientes.
  - Hoy la severidad aparece principalmente en `revision` porque es el único tipo que hoy la produce
    (`taskCardPresentation.js` deriva `severity` de `sourceLabel`/alerta, y eso hoy solo ocurre en revisiones).
  - El renderer **no debe impedir** que otros tipos tengan severidad a futuro: `iconForType` resuelve forma por
    `type` y `ICON_TONE` resuelve color por `severity` como pasos separados, no como una tabla cerrada
    `revision-only`.
  - Si mañana `seguimiento` o `tarea` reciben `severity:'critica'|'media'`, el modelo visual debe poder expresarlo
    (forma del tipo + color de severidad) **sin rediseñar la card** — a lo sumo, sumar un caso en `iconForType`
    para esa combinación puntual, no repensar el contrato.

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

🟢 **(Revisión F3)** Estructura única para los tres — sin badge de tipo visible (§3) y sin role pill (§2); el rol
vive integrado en `displayTitle`:
```
[ícono tipo/severidad] Título visible (con rol integrado si corresponde)
Dirección · MP-ID
[acciones icon-only según estado]
```

| Estado | Diferencia visual | Acciones |
|---|---|---|
| **pending** | tono pleno | completar · cancelar |
| **done** | `opacity` reducida + **título tachado** | reabrir |
| **cancelled** | (oculto por defecto, §6) | reabrir (futuro) |

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

🟢 **(Revisión F2)** Ya no hay badge de tipo visible — el tipo+severidad viven en el ícono (forma+color), con
texto accesible solo en `title`/`aria-label` (entre corchetes abajo, no se pinta). **(Revisión F3)** Tampoco hay
role pill: el rol va integrado en el título visible (`displayTitle`, §2).

**pending crítica (rol Gestoría → integrado al título):**
```
[ícono ShieldAlert rojo, title="Revisión crítica"] Solicitar nuevo certificado de dominio a Gestoría
Av. Libertador 123 · MP-328552
[✓] [✕]
```
**done crítica (mismo rol, título tachado, ícono crítico atenuado):**
```
[ícono ShieldAlert rojo atenuado, title="Revisión crítica"] Solicitar nuevo certificado de dominio a Gestoría
Av. Libertador 123 · MP-328552
[↺]
```
Done = misma estructura, atenuada, sin "Eliminar". Cancelled no se muestra por defecto.

> Las acciones son **icon-only**: en la card solo se ve el ícono (`[✓]` `[✕]` `[↺]`). Los textos "Completar tarea",
> "Cancelar tarea" y "Reabrir tarea" existen **solo en `aria-label`/`title`**, nunca visibles en la card. Lo mismo
> aplica al ícono de tipo/severidad: el texto ("Revisión crítica", "Seguimiento", "Tarea", …) vive solo en
> `title`/`aria-label`.

---

## 9. Qué NO incluir en la compacta (⛔)

**badge textual de tipo** ("Revisión"/"Seguimiento"/"Tarea" visibles) · **role pill / "Resp." / responsable como
metadata separada** (el rol va integrado al título, §2) · origen como pill · `sourceLabel` como pill · "Manual"
como badge protagonista · "Alerta crítica" como texto en el badge · badge compuesto "Revisión · Alerta crítica" ·
historial · eventos relacionados · documentos · evidencia · expand · acciones contextuales múltiples ·
`needs_review` · `DocumentRequirement` · **subtasks · mini-checklist interno · grouping por legajo**.

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
- 🟢 **(Revisión F3)** Animación de rol eliminada de F1: el keyframe CSS (`task-role-pulse` en `index.css`) puede
  quedar sin uso en el código — no se elimina el CSS por este cambio (fuera del alcance de archivos de F3), solo
  se deja de aplicar la clase desde `TaskCard.jsx`.
- Nada más.

---

## 12. Criterios de aceptación

- [ ] `review·crítica` se ve igual (`ShieldAlert` rojo + border de perímetro rojo, §3.1) en pending **y** done
      (atenuada). Nunca sky/`AlertTriangle`, nunca sin border.
- [ ] Border rojo de crítica es de **perímetro**, no lateral; no aplica a `media`/`null` ni a tareas formales.
- [ ] `review·media` mantiene `AlertTriangle` ámbar en ambos estados.
- [ ] `follow_up` (`MessageCircle`) y `tarea` fallback (`ClipboardList`) neutro/sky en ambos estados.
- [ ] Sin badge textual de tipo visible (ni "Revisión", ni "Seguimiento", ni "Tarea"); nunca "· Alerta crítica" ni
      strings técnicos. Tipo desconocido → ícono `ClipboardList` (mismo que fallback "Tarea").
- [ ] Ícono de tipo/severidad tiene `title`+`aria-label` con el texto equivalente ("Revisión crítica" / "Revisión
      media" / "Revisión" / "Seguimiento" / "Tarea").
- [ ] Sin role pill / "Resp." / metadata de responsable separada. El rol (si existe) aparece integrado en
      `displayTitle` con el conector correcto (a/al + rol), sin duplicar si el título fuente ya lo incluye.
- [ ] `TaskCard` renderiza `view.displayTitle` (no `view.title`) como título visible.
- [ ] Sin animación de rol en F1 (eliminada junto con el pill).
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
