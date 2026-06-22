# Demo Readiness — qué falta para una demo 100% funcional

> Documento **accionable y con fecha de vencimiento** (a diferencia de la arquitectura, que es permanente).
> Mapea, pantalla por pantalla, qué existe / qué falta / con qué prioridad para que la demo se sienta completa.
> Para el mapa conceptual ver [`SYSTEM_OVERVIEW.md`](SYSTEM_OVERVIEW.md).
>
> **Estado:** los dos **P0** (integridad de demo) están **cerrados** en la rama `demo-integrity-claude`.
> Quedan pendientes P1/P2. Ver §0 (resueltos) y §5 (próximo paso).

---

## 0. Cerrado en `demo-integrity-claude`

Los dos gaps P0 que rompían la ilusión de demo ya están resueltos:

| Gap | Resuelto por | Cómo |
|---|---|---|
| **T1 — `documentos` y `eventos` globales** (idénticos en todo legajo) | commit *"Scope legajo documents and events by operation"* | `legajoDocsEventos.js`: generadores stage-aware por `op` (`getDocumentosByOp` / `getEventosByOp`), determinísticos. Conteos coherentes en Documentos y Resumen; IDs correctos en eventos; montos económicos variables por operación |
| **T2 — Resumen hardcodeado** (no derivado de `op`) | commit *"Derive legajo summary from operation data"* | Próxima acción ← `op.proximoPaso`/fallback · Responsable ← `bloqueoActor`/`proximoPaso` · Condición ← estado/riesgo/`bloqueoMotivo` (color correcto) · snapshot "Próxima" alineado con la card · hardcodes principales eliminados |

Quedan **fuera** de este cierre (siguen pendientes): la card "Responsables" del snapshot (equipo notarial, genérica, P2) y todos los verbos stub (T3) y el search/notifs (T4).

---

## 1. Cómo se prioriza

| Nivel | Criterio | Pregunta |
|---|---|---|
| **P0** | Rompe la ilusión de la demo | ¿Un evaluador descubre en 30s que es una maqueta? |
| **P1** | Interacción esperada que no responde | ¿Un botón visible no hace nada al clickearlo? |
| **P2** | Puede esperar / no se toca en la demo | ¿Se puede explicar con palabras en vez de mostrar? |

**Qué significa "funcional" acá:** el prototipo es 100% frontend con persistencia en `localStorage`
(`dayTasks`, `operationalTasks`, `mercadoprop_state_v1`). El backend FastAPI existe pero **no se usa**.
"Funcional para demo" = el clic produce una respuesta coherente y persistente en el navegador, **no** que haya
backend real. La ausencia de backend es un gap de *backend-readiness* (futuro `DOMAIN_MODEL.md`), no de demo.

---

## 2. Gaps transversales (cruzan varias pantallas) — los más importantes

| # | Gap | Impacto | Prioridad |
|---|---|---|---|
| ~~T1~~ | ~~`documentos` y `eventos` listas mock globales~~ | — | ✅ **RESUELTO** (ver §0) |
| ~~T2~~ | ~~Tab Resumen hardcodeado, no derivado de `op`~~ | — | ✅ **RESUELTO** (ver §0) |
| T3 | **Verbos primarios son stubs visuales** (sin `onClick`): Programar firma, Subir documento, Resolver alerta, Nuevo legajo, Nota, Exportar, copiar ID | Las acciones centrales del producto no responden | **P1** |
| T4 | **Búsqueda global (⌘K) y campana de notificaciones**: inputs/botones decorativos sin comportamiento | Dos elementos prominentes del topbar no hacen nada | **P1** |

---

## 3. Gap matrix por pantalla

### Dashboard (`/escribanos/panel`)
| | Estado |
|---|---|
| Existe y funciona | Tareas del día (DnD + seguimientos, persistente) · Kanban/Lista (filtros, orden, DnD) · Alertas (links) · Próximas firmas (toggle) |
| Falta del mock | "Por estado" usa conteos semi-fijos · card Resumen IA ("Ver sugerencias") es ilustrativa |
| Falta funcional | Botón "Ver sugerencias" stub (P2) · búsqueda global (T4) |
| Prioridad | Mayormente **listo**. Es la pantalla más sólida para abrir la demo. |

### Lista de Legajos (`/escribanos/operaciones`)
| | Estado |
|---|---|
| Existe y funciona | Filtro pills por estado · búsqueda local · tabla · filtro por `?hito=` |
| Falta funcional | **Filtros** (botón) stub · **Exportar** stub · **Nuevo legajo** stub · **paginación** estática (Anterior/Siguiente/números) |
| Prioridad | "Nuevo legajo" **P1** (verbo clave) · resto **P2** |

### Detalle de Legajo (`/escribanos/operaciones/:id`)
| Tab | Estado y gap | Prioridad |
|---|---|---|
| Header | copiar ID, Nota, Exportar, **Programar firma** → todos stub | Programar firma **P1**, resto P2 |
| Alertas | "Resolver" stub | **P1** (tie-in IA, ver §5) |
| Resumen | ✅ Derivado de `op` (T2 resuelto). Pendiente menor: card "Responsables" genérica | listo · resto **P2** |
| Partes e inmueble | Datos reales de `op`; botones teléfono/mail stub | P2 |
| Documentos | ✅ Lista scoped por `op` (T1 resuelto); Subir/Descargar aún stub | scoping **listo** · verbos **P1** |
| Actividad | ✅ Eventos scoped por `op` (T1 resuelto); TimelineProceso ya derivaba; Exportar log stub | scoping **listo** · export **P2** |
| **Operativa** | **Funciona** (completar/cancelar/reabrir, persistente). Creación solo desde Kanban/Lista | **listo** |
| Bóveda | **Funciona**, derivada de datos económicos de `op`; toggle vivienda única | **listo** |

### Agenda (`/escribanos/agenda`)
| | Estado |
|---|---|
| Existe | Calendario mensual + sidebar, **completamente estático** (0 interacciones) |
| Prioridad | **P2** — se narra; no es el foco de la demo operativa |

### Partes (`/escribanos/partes`, `/escribanos/partes/:id`)
| | Estado |
|---|---|
| Existe | Listado y detalle, casi estáticos |
| Prioridad | **P2** |

---

## 4. Priorización consolidada

**P0 — ✅ CERRADO** (rama `demo-integrity-claude`, ver §0):
- ~~Filtrar `documentos` por legajo~~ · ~~Filtrar `eventos`/timeline por legajo~~ · ~~Derivar el Resumen de `op`~~

**P1 — interacciones esperadas que hoy no responden (siguiente foco):**
1. Resolver alerta → **crear una `OperationalTask`** (tie-in IA, ver §5) ← **próximo paso recomendado**
2. Programar firma → feedback/estado coherente
3. Subir documento → agregar al listado scoped del legajo (mock persistente)
4. Nuevo legajo → alta mínima
5. Búsqueda global ⌘K (T4)

**P2 — puede esperar / se narra:**
6. Agenda interactiva · Partes detalle · card "Responsables" del Resumen · notificaciones · exportar · paginación · "Ver sugerencias"

---

## 5. Recomendación de próximo paso

Con los P0 cerrados, la base de credibilidad ya está: dos legajos distintos se ven distintos. El gap de mayor ROI
ahora es **P1 #1: "Resolver alerta → crear OperationalTask"**.

Por qué es el siguiente paso lógico:
- **Conecta la cadena central del producto** end-to-end y visible: alerta/problema detectado (`getOpAlert(op)`,
  un *finding*) → acción → `OperationalTask` → tab Operativa → Tareas del día. Es la demostración en vivo de
  **event-informed, task-driven** (ver [`SYSTEM_OVERVIEW.md` §5](SYSTEM_OVERVIEW.md)).
- **Reusa lo que ya existe y funciona:** `getOpAlert(op)` ya detecta; `operationalTasks.create(...)` ya crea y
  persiste; la Operativa y Tareas del día ya renderizan. No requiere backend ni IA.
- **Convierte un stub (T3 "Resolver") en el momento más narrable de la demo:** el botón pasa de decorativo a
  disparar la tesis del producto.

Costo bajo, impacto narrativo alto, cero arquitectura nueva.

Decisión abierta (sin cambios): ¿seguir con **cierre de gaps de demo** o arrancar **backend-readiness**
(`DOMAIN_MODEL.md`)? La recomendación sigue siendo **demo primero** — y dentro de demo, P1 #1 antes que el resto.
