# Demo Readiness — qué falta para una demo 100% funcional

> Documento **accionable y con fecha de vencimiento** (a diferencia de la arquitectura, que es permanente).
> Mapea, pantalla por pantalla, qué existe / qué falta / con qué prioridad para que la demo se sienta completa.
> Para el mapa conceptual ver [`SYSTEM_OVERVIEW.md`](SYSTEM_OVERVIEW.md).
>
> **Estado:** los dos **P0** (integridad de demo) y el **P1 #1** (Resolver alerta → OperationalTask) están
> **cerrados** en la rama `demo-integrity-claude`. Quedan pendientes el resto de P1 y los P2. Ver §0 (resueltos)
> y §5 (próximo paso).

---

## 0. Cerrado en `demo-integrity-claude`

Los dos gaps P0 (integridad de demo) y el primer P1 (Resolver alerta → OperationalTask) ya están resueltos:

| Gap | Resuelto por | Cómo |
|---|---|---|
| **T1 — `documentos` y `eventos` globales** (idénticos en todo legajo) | `ecf8bb6` *"Scope legajo documents and events by operation"* | `legajoDocsEventos.js`: generadores stage-aware por `op` (`getDocumentosByOp` / `getEventosByOp`), determinísticos. Conteos coherentes en Documentos y Resumen; IDs correctos en eventos; montos económicos variables por operación |
| **T2 — Resumen hardcodeado** (no derivado de `op`) | `4e4efa9` *"Derive legajo summary from operation data"* | Próxima acción ← `op.proximoPaso`/fallback · Responsable ← `bloqueoActor`/`proximoPaso` · Condición ← estado/riesgo/`bloqueoMotivo` (color correcto) · snapshot "Próxima" alineado con la card · hardcodes principales eliminados |
| **P1 #1 — Resolver alerta → OperationalTask** (verbo "Resolver" era stub) | `3940b93` *"Create operational tasks from legajo alerts"* | El botón **Resolver** de una alerta crea una `OperationalTask` `subtype: 'review'` con `sourceType/sourceId/sourceLabel` (procedencia de la alerta) · **dedup por alerta** (no duplica; el botón pasa a "Tarea creada") · aparece en **Tareas del día** (sección generalizada a "Tareas operativas", todo subtype) y en **Operativa**, con la severidad como señal visual principal · la **alerta sigue visible** y **no** cambia `op.estado`, `bloqueoActor` ni línea de pases (event-informed, task-driven) |

Quedan **fuera** de este cierre (siguen pendientes): la card "Responsables" del snapshot (equipo notarial, genérica, P2), el resto de verbos stub de T3 (Programar firma, Subir documento, Nuevo legajo, Nota, Exportar, copiar ID) y el search/notifs (T4).

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
| T3 | **Verbos primarios son stubs visuales** (sin `onClick`): Programar firma, Subir documento, Nuevo legajo, Nota, Exportar, copiar ID. (~~Resolver alerta~~ ✅ resuelto, ver §0) | Las acciones centrales del producto no responden | **P1** |
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
| Alertas | ✅ "Resolver" crea `OperationalTask` `review` desde la alerta (P1 #1 resuelto, ver §0) | **listo** |
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

**✅ CERRADO** (rama `demo-integrity-claude`, ver §0):
- ~~P0: Filtrar `documentos` por legajo~~ · ~~Filtrar `eventos`/timeline por legajo~~ · ~~Derivar el Resumen de `op`~~
- ~~P1 #1: Resolver alerta → crear `OperationalTask`~~

**P1 — interacciones esperadas que hoy no responden (siguiente foco):**
1. Programar firma → feedback/estado coherente ← **próximo paso recomendado**
2. Subir documento → agregar al listado scoped del legajo (mock persistente)
3. Nuevo legajo → alta mínima
4. Búsqueda global ⌘K (T4)

**P2 — puede esperar / se narra:**
5. Agenda interactiva · Partes detalle · card "Responsables" del Resumen · notificaciones · exportar · paginación · "Ver sugerencias"

---

## 5. Recomendación de próximo paso

Con los P0 y el P1 #1 cerrados, la base de credibilidad está y la tesis del producto ya se demuestra en vivo
(alerta → `OperationalTask` → Operativa → Tareas del día). El gap de mayor ROI ahora es **Programar firma**
(verbo del header del detalle de legajo).

Por qué Programar firma antes que Subir documento / Nuevo legajo / búsqueda ⌘K:
- **Es el verbo más prominente y esperado del detalle:** botón primario destacado (`btn-programar-firma`), el que
  un evaluador clickea primero en un legajo próximo a firmar. Hoy es un stub puro.
- **Conecta con superficies que ya existen:** firma tentativa (`op.firma`/`op.diasFirma`), "Próximas firmas" del
  Dashboard y la Agenda — hay dónde reflejar el efecto, aunque sea un estado mock persistente.
- **Alto impacto narrativo, scope acotable:** una primera versión puede limitarse a confirmar/registrar la firma
  (feedback + estado coherente) sin tocar backend ni la Bóveda.

Candidatos siguientes, en orden: **Subir documento** (agregar al listado scoped, ya tenemos `legajoDocsEventos`),
**Nuevo legajo** (alta mínima), **búsqueda global ⌘K** (T4). Cada uno es un stub independiente; el orden puede
ajustarse según qué se quiera mostrar.

Decisión abierta (sin cambios): ¿seguir con **cierre de gaps de demo** o arrancar **backend-readiness**
(`DOMAIN_MODEL.md`)? La recomendación sigue siendo **demo primero** — y dentro de demo, Programar firma como
próximo gap.
