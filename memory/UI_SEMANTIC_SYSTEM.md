# UI Semantic System — panel de escribanías

> **Contrato de semántica visual.** Define cómo el UI usa colores, pills, cards, acciones y naming para
> **comunicar la arquitectura del producto**, no solo para verse bien. Es la referencia que cualquier cambio de
> UI futuro debe respetar (o justificar por qué se aparta).
>
> **No es** un inventario de lo que el código hace hoy — varias reglas de acá **aún no se cumplen** en el código
> (marcadas con ⚠️). Es el estado *objetivo*, derivado de la auditoría visual/semántica.
>
> Bases (no se duplican acá): capas y vocabulario en [`SYSTEM_OVERVIEW.md`](SYSTEM_OVERVIEW.md); modelo operativo
> en [`OPERATIONAL_TASKS_ARCHITECTURE.md`](OPERATIONAL_TASKS_ARCHITECTURE.md); estado de demo en
> [`DEMO_READINESS.md`](DEMO_READINESS.md); producto/economía/vocabulario en [`PRD.md`](PRD.md).

---

## 1. Principio central

El UI es la **representación visible de las capas del modelo**. Cada señal visual (color, pill, card, verbo) debe
mapear a **una** capa de [`SYSTEM_OVERVIEW.md`](SYSTEM_OVERVIEW.md) y no contradecir su separación:

| Capa | Pregunta que responde | Nunca debe confundirse con |
|---|---|---|
| Flow duro / Checklist | ¿en qué paso formal está? | bitácora, tareas operativas |
| Responsabilidad operativa | ¿quién debe actuar ahora? ¿cómo llegó esa responsabilidad ahí? | etapa |
| Actividad / Bitácora | ¿qué pasó? (registro) | flow duro, tareas accionables |
| Bóveda / Economía | ¿estado de pagos? | tareas operativas |
| Operativa | ¿qué acciones hay/hubo para destrabar? | checklist formal |
| Tareas del día | ¿qué se atiende hoy? (vista) | almacén / fuente de verdad |
| Alertas | ¿qué problema se detectó? | estado resuelto |

**Regla raíz:** si el usuario no puede inferir a qué capa pertenece algo por su señal visual, la señal está mal.

> **Responsabilidad operativa** (antes "Línea de pases" / "la pelota"; legacy en código: `op.bloqueoActor`,
> `op.lineaDePases`, `SoccerBloqueoTrigger`). Indica **quién tiene la responsabilidad actual** de destrabar/avanzar
> un requisito y **cómo llegó** esa responsabilidad ahí (responsable actual · historial de responsabilidad · motivo
> de asignación · actor responsable). Es una **capa de ruteo/responsabilidad** dentro del sistema operativo del
> legajo, **ya no el centro del workflow**.
> **No es fuente de verdad de:** estado del checklist · existencia/validez del documento · estado de una
> `OperationalTask` · timeline/bitácora. **Orienta** (a quién contactar/esperar/escalar, cuándo crear una subtarea
> de seguimiento, qué actor mostrar como responsable), pero **no determina** por sí sola que una tarea esté resuelta
> ni que un requisito esté satisfecho. La metáfora futbolera ("pelota") queda como naming legacy, no conceptual.

---

## 2. Colores

Cada familia pertenece a un eje semántico. **Un color no puede comunicar dos cosas contradictorias en la misma
tarjeta.**

| Familia | Significado único | Usos válidos | Prohibido |
|---|---|---|---|
| **Rojo** (`destructive`) | Severidad alta / peligro | riesgo alto, alerta crítica, firma observada, condición observada | acciones benignas (⚠️ hoy "Quitar de mi día" usa rojo) |
| **Ámbar** (`warning`) | Precaución / atención | riesgo medio, alerta media, firma tentativa, "Requiere revisión" | confirmaciones positivas |
| **Verde** (`success`/emerald) | Estado positivo **o** acción completar — **diferenciar por forma** | riesgo bajo, firma confirmada, parte verificada (estado, en *pill/dot*); completar tarea (acción, en *botón con ícono*) | mezclar verde-estado y verde-acción sin que la **forma** los distinga |
| **Sky / Azul** | Marca/primary **y** dominio Bóveda | botones primary, links, trazabilidad económica (Bóveda) | ⚠️ color genérico de "tarea operativa"/subtype; el sky no es el default de todo |
| **Gris / Slate** | Neutro / metadata / sin señal | "Sin observaciones", labels secundarios, metadata (origin), **responsable/actor** | comunicar un estado que sí importa |
| **Stage colors** (`--stage-*`) | **Solo etapa del flow** | borde de columna Kanban, celda Etapa de Lista, barra de progreso | ⚠️ teñir el pill de responsable (hoy lo hace → lee como etapa, no actor) |
| **(Rol / actor)** | **No existe familia de color de rol** | — | dar a Comprador/Vendedor/Gestoría/Tercero/Escribanía un color propio |

**El color responde "¿qué tan urgente/crítico?", "¿en qué etapa?", "¿completado?", "¿es alerta?", "¿es acción
primaria?" — nunca "¿quién es el actor?".** Los roles se identifican por **label/copy** (ver §3), no por color.

**Reglas de color:**
1. Rojo y ámbar se **reservan** a severidad/riesgo/alerta. No decorativos.
2. Stage colors comunican **solo** etapa. Responsable, riesgo y tarea usan tokens propios.
3. Verde requiere cuidado: estado-positivo y acción-completar pueden coexistir solo si la **forma** los separa
   (pill/dot = estado; botón con ✓ = acción).
4. Sky pertenece a Bóveda + primary. Las tareas operativas toman color de su **severidad/origen**, no sky por defecto.
5. **Los roles no se codifican por color.** Ningún actor tiene color semántico propio (Comprador ≠ azul,
   Vendedor ≠ naranja, Gestoría ≠ violeta, etc.). El responsable / responsabilidad actual usa tratamiento **neutral**; se distingue
   por el copy ("Responsable: Vendedor", "Acción: Comprador"). **Excepción controlada:** "Escribanía" / acción
   propia puede llevar un **énfasis leve** (borde más marcado, fondo neutral algo destacado, ícono sutil) porque
   comunica accionabilidad propia — nunca un color fuerte que compita con alerta/riesgo/etapa.

---

## 3. Pills / badges

**Menos es más.** Demasiados pills en una fila destruyen la jerarquía.

**Reglas:**
1. **Tope blando: 2 pills "fuertes" por fila** + a lo sumo un marcador contextual (ej. "En tu día"). Más que eso → comprimir.
2. **Badge compuesto** cuando dos datos están fuertemente acoplados: `Revisión · Alerta crítica` en **un** badge,
   no dos pills `[Revisión][Alerta crítica]`. (Ya aplicado para review-de-alerta.)
3. **Metadata no va como pill principal.** `origin: 'manual'` es metadata: texto secundario, no un Pill que compita
   con la severidad. ⚠️ Hoy "Manual" se muestra como Pill en Operativa.
4. **subtype / severity / origin / scheduling no compiten:** jerarquía fija → severidad/subtype (principal) >
   scheduling ("En tu día") > origin (metadata, tenue).
5. **Roles se identifican por label, no por color** (ver §2 regla 5). El pill de responsable / responsabilidad actual es **neutral**;
   el dato lo da el copy ("Responsable: Gestoría", "Acción: Comprador"). Excepción: "Escribanía"/acción propia con
   énfasis leve (borde/fondo neutral algo destacado), nunca color fuerte.

---

## 4. OperationalTask cards

La misma entidad debe verse **igual en toda pantalla** (⚠️ hoy se renderiza con dos lenguajes: primitives del
detalle vs bespoke de TasksBoard — ver §8). Especificación objetivo:

**Jerarquía de un item de OperationalTask:**
1. **Badge principal** — subtype, o compuesto subtype·severidad si nació de alerta.
2. **Título** — la acción concreta (`task.title`).
3. **Contexto** — legajo (`opId` · dirección) y, si aplica, "desde {sourceLabel}".
4. **Responsable** — "Responsable: {label}" (no "relacionado:").
5. **Acción disponible** — completar / cancelar / reabrir (botón, a la derecha).

**Tratamiento por tipo/estado:**

| Caso | Señal principal | Acento/ícono |
|---|---|---|
| `follow_up` | badge "Seguimiento", neutro/sky | sky · ícono mensaje |
| `review` desde **Alerta crítica** | badge "Revisión · Alerta crítica" | rojo suave · ícono alerta |
| `review` desde **Alerta media** | badge "Revisión · Alerta media" | ámbar suave · ícono alerta |
| agendada **hoy** | + marcador "En tu día" (info, tenue) | — |
| **completada** | título tachado, atenuado, badge intacto | acción "Reabrir para hoy" |
| **cancelada** | atenuada, baja prioridad visual, colapsable | acción "Reabrir para hoy" |

La **severidad es la señal principal** de la tarjeta cuando la task nació de una alerta; el azul genérico de tarea
operativa no debe dominar en ese caso.

> ⚠️ **El enfoque de "badge compuesto" (`Revisión · Alerta crítica`) de esta sección quedó superado.** La gramática
> vigente para implementar está en **§4A** (separa tipo / severidad / origen). Esta §4 queda como referencia previa.

---

## 4A. Task Card Grammar — gramática compacta (dirección PARA IMPLEMENTAR · F1)

> **Estado: decisión para implementar (F1).** La **gramática compacta** y el **contrato de view-model** de esta
> sección son la dirección acordada para el refactor `TaskCard`. (El **expand** y el puente con Avance del proceso /
> Documentos siguen WIP — ver §4B.) Aun así, validar en UI real antes de cerrarla como definitiva.

**Decisión:** `badge = tipo` · `severidad = tratamiento visual` · `origen = detalle`.

Tres dimensiones, tres canales separados (el badge compuesto de §4 las mezclaba):

| Dimensión | Canal |
|---|---|
| **Tipo** de tarea | **Badge** (única función del badge) |
| **Severidad** (crítica/media/none) | **Tratamiento de tarjeta**: acento lateral + ícono + borde/fondo suave + tono |
| **Origen/procedencia** | **Solo vista expandida/detalle** (no compacta) |

**Reglas (F1):**
- Badge = **solo tipo**: `Proceso` · `Seguimiento` · `Revisión` · `Tarea` (fallback). Subtype desconocido → `Tarea`,
  **nunca** el string técnico.
- El badge **no** mezcla tipo + origen + severidad. **No** usar `[Revisión · Alerta crítica]` como badge base.
- Para una `review` desde alerta crítica/media: badge `Revisión` + severidad por **acento lateral / ícono /
  borde-fondo suave** (rojo crítica, ámbar media); el origen va al **detalle/expand**.
- **Responsable**: en detalle/expand, **no** en el título ni como pill principal.
- **Tarjeta compacta** centrada en la acción:
  ```
  [BADGE]  Acción concreta
           Dirección simplificada
           MP-ID
  ```
- La compacta **no** muestra: Responsable como pill · origin/manual como pill · sourceLabel como pill · metadata de más.
- **pending / done / cancelled** mantienen la **misma estructura**; difieren solo por **atenuación/tachado** y la
  acción primaria (completar vs reabrir). **No reordenar.** La severidad **persiste atenuada** en done/cancelled
  (una `review` crítica completada se sigue leyendo crítica, no revierte a neutro).
- Formal (`Proceso`) y operativa comparten **gramática visual mínima** si conviven en una sección (ej. "Completadas hoy").

**Contrato de arquitectura de render (F1):** un **view-model normalizado** + **un** renderer. Dos modelos de datos
distintos (formal = `dayTasks`/checklist; operativa = `OperationalTask`) producen el **mismo** view-model vía
adapters puros; el renderer no sabe de cuál proviene. Comparten *presentación*, no *store* (no se fusionan modelos).

```
TaskFormal (dayTasks + op)  ─┐
OperationalTask (store)      ─┼─► taskCardPresentation(x) ─► ViewModel ─► <TaskCard/>
                             ─┘   (fromFormalTask / fromOperationalTask)

ViewModel ≈ { id, kind:'formal'|'operational',
              type:'proceso'|'seguimiento'|'revision'|'tarea', typeLabel,
              title, addressLine, legajoId,
              severity:'critica'|'media'|null, status:'pending'|'done'|'cancelled',
              detail:{ origen, responsable, origin, sourceType, sourceId, createdAt, completedAt } }
```

**Fases del refactor:**
- **F1 — gramática compacta + view-model + `TaskCard` base** (esta sección). Primero wired solo a OperationalTasks.
- **F2 — adapter de tarea formal** → misma `TaskCard` (unifica "Completadas hoy").
- **F3 — expand** como lente de Avance del proceso / DocumentRequirement (§4B, WIP).
- **F4 — subtareas asociadas** (`parentTaskId`, §4B, WIP).
- **F5 — eventos/documentos/panel de partes/resolución automática** (§4B, WIP · backend).

**No** implementar como parche en el PR de cleanup semántico actual; F1 va en una rama/fase de refactor propia.

---

## 4B·WIP — Task Card expandida como superficie contextual de resolución

> 🚧 **WIP / hipótesis futura — NO es diseño final, NO es modelo actual.** Cubre F3–F5. El expand no está
> implementado; los campos de referencia (`relatedChecklistItemId`, `relatedDocumentRequirementId`, `parentTaskId`,
> `resolutionCondition`, estado `needs_review`, eventos `document_*`) son **hipótesis** a validar antes de backend.

**Regla arquitectónica:** la Task Card expandida **no** es un mini-repositorio ni una fuente de verdad paralela.
Es una **lente accionable** sobre tres capas, cada una dueña de su dato:

```
Avance del proceso (checklist formal)   ← fuente de verdad del PASO y su estado
  └─ ChecklistItem / nodo
       └─ DocumentRequirement / Documentos   ← fuente de verdad del DOCUMENTO
            ▲ referencia (no copia)
       OperationalTask                        ← superficie ACCIONABLE (resolver/empujar/monitorear)
            └─ Task Card expandida            ← LENTE enfocada del nodo (proyección, no repo)
```

- **Avance del proceso** = checklist formal completo del legajo.
- **Task expandida** = vista **enfocada** de un requisito accionable dentro de ese checklist.
- **DocumentRequirement / Documentos** = fuente de verdad documental.
- **OperationalTask** = superficie accionable para resolver/empujar/monitorear ese requisito.

**Qué dato viene de dónde (en el expand):**

| Dato | Fuente |
|---|---|
| Label del requisito, estado del nodo, "¿bloquea firma?", evidencia, próximo responsable | **ChecklistItem** (Avance del proceso, hoy `buildTimelineChecklist`) — read-only |
| Documento requerido, estado documental, vencimiento | **DocumentRequirement / Documentos** — fuente de verdad |
| Tipo, severidad, origen, `sourceType/Id`, referencias, estado de la task | **OperationalTask** |

**Ejemplo:**
```
Avance del proceso:  Due diligence › Certificado de dominio
                     Estado: observado · Bloquea firma · Próximo responsable: Gestoría

Task (compacta):     [Revisión] Solicitar nuevo certificado de dominio
                     Av. Santa Fe 1234, 4° B · MP-673033   (acento rojo)

Task (expandida):
  Requisito del proceso asociado: Certificado de dominio
  Estado actual del requisito: observado
  Evidencia disponible · Próximo responsable: Gestoría · Bloquea firma
  Acciones:  Subir documento · Solicitar a Gestoría · Crear seguimiento asociado
```

**Reglas del expand (WIP):**
- **No duplicar repos/formularios:** el upload reusa **el mismo componente/lógica** que el tab Documentos; el bloque
  de nodo reusa componentes de Avance del proceso (extraer un sub-componente de `TimelineProceso`). El expand
  **orquesta** piezas existentes, no las reimplementa.
- La task **referencia** (`relatedChecklistItemId`, `relatedDocumentRequirementId`); no almacena el documento ni el nodo.

**Resolución por acción externa (WIP):** una task puede resolverse por una acción del actor correcto. Si el comprador
carga el documento desde un futuro **panel de partes**, la transición del `DocumentRequirement` actualiza la task de
la escribanía:
- → **done**, si el requisito no exige validación notarial;
- → **`needs_review`** ("Lista para revisión"), si la escribanía debe validar.

La task **reacciona** vía eventos (`document_requested · document_uploaded · document_validated · document_rejected`);
**nunca** es la fuente de verdad del documento. Una sola `DocumentRequirement` se **proyecta** a dos vistas
(acción de escribanía / pedido a la parte) — **no** se crean tasks gemelas.

**Subtareas (WIP):** una subtask = otra `OperationalTask` con `parentTaskId` + `relationType`. Completar la subtask
**no** auto-completa la madre; completar la madre **no** cascada. Se crean solo desde el expand de la madre y se
muestran anidadas en expand/Operativa — **nunca** en la lista plana de "Tareas del día" (evita Trello).

**No implementar todavía:** nada de §4B (expand, referencias, resolución, eventos, `needs_review`, partes, subtasks).
Sigue WIP hasta validarse con UI real y, para la resolución/eventos, con backend.

---

## 5. Alertas

Una alerta es un **problema detectado** (un *finding*), no un estado mutable del legajo.

**Reglas:**
1. El botón de una alerta **no debe prometer resolución** si solo crea una tarea. **"Resolver" es anti-pattern**
   cuando la alerta no se marca resuelta ni se oculta. ⚠️ Hoy el botón dice "Resolver".
2. Verbo literal: **"Crear tarea"** / **"Generar acción"** / **"Atender"** — lo que realmente hace.
3. La alerta **permanece visible** tras crear la tarea (no se oculta, no cambia estado / responsable actual / responsabilidad operativa).
4. Tras crear, el control refleja el estado real ("Tarea creada", dedup) — eso ya es correcto.

---

## 6. Acciones — jerarquía visual

| Nivel | Qué es | Tratamiento |
|---|---|---|
| **Primaria** | acción real, central, que funciona | botón sólido/primary |
| **Secundaria** | acción real, de apoyo | ghost/outline |
| **Destructiva** | borra/cancela de forma relevante | rojo, pero **reservado** a destrucción real (no a "quitar de hoy") |
| **Stub / no implementada** | aún no hace nada | **degradada** a secundario/ghost — nunca primary |

**Reglas:**
1. **Un botón dice exactamente lo que hace.** Si crea una tarea, dice "crear"; si no resuelve, no dice "resolver".
2. **Un stub no puede tener peso visual de acción crítica.** ⚠️ Hoy "Programar firma" (stub) es primary destacado.
3. "Destructivo" (rojo) se reserva a destrucción real. "Quitar de mi día" / "Cancelar seguimiento" no son destructivos en el mismo sentido que eliminar.

---

## 7. Naming / copy

Criterio: **¿este nombre es para el escribano o es interno?** Los de cara al usuario deben ser de su vocabulario,
no del nuestro.

| Término | Tipo | Veredicto |
|---|---|---|
| **Actividad** | usuario | OK como "qué pasó" / bitácora |
| **Línea de tiempo** | usuario | OK para la bitácora de eventos |
| **Timeline de la operación** | usuario | ⚠️ **confuso**: en realidad es el *checklist/avance del proceso* (flow duro), no una timeline. Renombrar (ej. "Proceso del legajo" / "Avance del proceso") |
| **Operativa** | usuario | aceptable, pero roza con "Tareas operativas" |
| **Tareas operativas** | usuario | aceptable; cuidar que no se confunda con "Operativa" y "Tareas del día" |
| **Tareas del día** | usuario | claro |
| **Seguimiento** | usuario | claro (contactar/destrabar) |
| **Revisión** | usuario | claro (atender algo detectado) |
| **Responsable** | usuario | claro; preferido sobre "relacionado:" |
| **Acción** (pill "Acción: X") | usuario | aceptable como "quién debe accionar" |
| **En espera / Acción requerida / En tu día** | usuario | claros y bien diferenciados |
| **OperationalTask / WorkItem / subtype / origin / sourceType** | **interno** | nunca de cara al usuario |

**Reglas:**
1. Términos internos (`OperationalTask`, `subtype`, `sourceType`, `follow_up`) **no aparecen** en UI.
2. "Timeline" se reserva a bitácora cronológica. El avance del proceso formal **no** se llama timeline.
3. Evitar que tres nombres parecidos ("Operativa", "Tareas operativas", "Tareas del día") convivan sin distinción
   clara — revisar si alguno puede simplificarse.

---

## 8. Cards y filas — consistencia por superficie

| Superficie | Sistema visual | Nota |
|---|---|---|
| Dashboard cards | `card-surface-lg`, rounded-2xl | base del panel |
| TasksBoard items | bespoke (rounded-2xl, hex) | ⚠️ renderiza OperationalTask distinto al detalle |
| Kanban cards | bespoke + stage accents | OK |
| Lista rows | tabla + stage accent | OK |
| Operativa items | `Card`/`Pill`/`SectionLabel` (primitives) | ⚠️ misma entidad, otro lenguaje que TasksBoard |
| Alertas | banda lateral por severidad | OK |
| Bóveda | `Card` + sky económico | OK, no tocar |
| Documentos | filas con dot de estado | OK |

**Regla:** **una entidad = un lenguaje de card en todas las pantallas.** Si `OperationalTask` aparece en TasksBoard
y en Operativa, debe verse igual (ver refactor §11 / quick wins).

---

## 9. Separación conceptual (qué nunca se mezcla)

1. **Checklist formal ≠ Operativa.** El avance del proceso (hitos) no se renderiza como tareas accionables del repo.
2. **Actividad/bitácora ≠ task accionable.** Un evento es registro; una tarea tiene estado y acciones. No se
   muestran como lo mismo. ⚠️ Hoy el tab "Actividad" mezcla bitácora (Línea de tiempo) + checklist (Timeline de la operación).
3. **Bóveda ≠ tarea operativa.** La economía es su propio dominio (sky); no se cruza con Operativa.
4. **Responsabilidad operativa (responsable actual) ≠ etapa.** Distintos ejes. El responsable es **neutral** (no
   toma color de etapa ni color de rol); la etapa tiene su propio color en columnas/barras/labels.
5. **Alerta ≠ estado resuelto.** Crear una tarea desde una alerta no la resuelve.

---

## 10. Anti-patterns

Los conceptuales viven en [`OPERATIONAL_TASKS_ARCHITECTURE.md` §9.7 / §10.10](OPERATIONAL_TASKS_ARCHITECTURE.md)
(todo-es-timeline, todo-es-event, follow_up-catch-all, task-inflation, Trello manual, IA sin aprobación,
backend-copiando-React). **Acá se suman los visuales/semánticos:**

- **Demasiados pills** apilados que matan la jerarquía.
- **Colores con significados cruzados** (un color = dos cosas contradictorias en la misma card).
- **Acciones que prometen más de lo que hacen** (verbo > efecto, ej. "Resolver").
- **Stubs con peso visual primario** (parecen funcionales y no responden).
- **Stage color usado para no-etapa** (responsable teñido por etapa).
- **Codificar roles por color** (dar a Comprador/Vendedor/Gestoría/Tercero/Escribanía un color semántico propio):
  multiplica los códigos de color y compite con severidad/etapa. Los roles se identifican por **label**, no por color.
- **Una entidad con dos lenguajes de card** según pantalla.

---

## 11. Primeras reglas accionables (para después, no ahora)

En orden sugerido — todas derivadas de la auditoría:

1. ✅ **Renombrar "Resolver"** (alerta) → "Crear tarea" (QW1, hecho).
2. ✅ **Renombrar "Timeline de la operación"** → "Avance del proceso" (QW2, hecho).
3. ✅ **Neutralizar el pill de responsable / responsabilidad actual** (QW4, hecho): no usa color de etapa **ni** color de rol — tono
   neutral; el actor lo comunica el copy. Excepción leve para "Escribanía"/acción propia (borde/fondo neutral algo
   destacado, sin color fuerte).
4. **Despromover stubs** (Programar firma, etc.) a secundario hasta que funcionen. *Visual.*
5. ✅ **Quitar "Manual" como Pill** en Operativa → metadata secundaria (QW5, hecho).
6. **Unificar el rendering de `OperationalTask`** en un primitive compartido (TasksBoard + Operativa) y un helper
   único de "tono por severidad". *Refactor — mayor scope, hacer con cuidado.*

---

## Decisiones que este documento deja abiertas

- **Nombre final** de "Resolver" y de "Timeline de la operación".
- **Estructura del tab "Actividad":** ¿renombrar el bloque de checklist, separarlo en otro tab, o reordenar?
- **Tono propio del pill de responsable** (qué neutral exacto).
- **Una sola representación de riesgo** (barras vs pill) para Lista y Detalle.
- **Alcance del primitive `OperationalTaskCard`** compartido (¿reemplaza ambos renders o solo unifica tokens?).
- **Simplificación de la tríada de nombres** "Operativa / Tareas operativas / Tareas del día".
