# Demo Readiness — qué falta para una demo 100% funcional

> Documento **accionable y con fecha de vencimiento** (a diferencia de la arquitectura, que es permanente).
> Mapea, pantalla por pantalla, qué existe / qué falta / con qué prioridad para que la demo se sienta completa.
> Para el mapa conceptual ver [`SYSTEM_OVERVIEW.md`](SYSTEM_OVERVIEW.md).

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
| T1 | **`documentos` y `eventos` son listas mock globales**, no filtradas por `op.id`: cada legajo muestra los mismos documentos y el mismo timeline | Abrir dos legajos revela que es maqueta al instante | **P0** |
| T2 | **Tab Resumen hardcodeado**, no derivado de `op`: "Solicitar inhibición del vendedor", conteos 6/1/1 de documentos son fijos | El resumen no concuerda con el legajo abierto | **P0** |
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
| Resumen | Hardcodeado, no derivado de `op` (T2) | **P0** |
| Partes e inmueble | Datos reales de `op`; botones teléfono/mail stub | P2 |
| Documentos | Lista mock **global** (T1); Subir/Descargar stub | **P0** + P1 |
| Actividad | Timeline mock **global** (T1); TimelineProceso sí deriva de `op`; Exportar log stub | **P0** |
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

**P0 — sin esto la demo se nota maqueta (arreglar primero):**
1. Filtrar `documentos` por legajo (T1)
2. Filtrar `eventos`/timeline por legajo (T1)
3. Derivar el tab Resumen de `op` en vez de hardcodear (T2)

**P1 — interacciones esperadas que hoy no responden:**
4. Resolver alerta → **crear una `OperationalTask`** (tie-in IA, ver §5)
5. Programar firma → feedback/estado coherente
6. Subir documento → agregar al listado del legajo (mock persistente)
7. Nuevo legajo → alta mínima
8. Búsqueda global ⌘K (T4)

**P2 — puede esperar / se narra:**
9. Agenda interactiva · Partes detalle · notificaciones · exportar · paginación · "Ver sugerencias"

---

## 5. Recomendación de próximo paso

El gap de mayor ROI para la demo **y** alineado con la tesis del producto es el **P1 #4: "Resolver alerta →
crear OperationalTask"**. Hoy ya existe `getOpAlert(op)` (una detección/*finding*) y la capa Operativa funciona —
conectar ambos materializa en vivo la cadena **event-informed, task-driven** (`Finding → OperationalTask`) sin
construir backend ni IA. Es la demostración más barata de la tesis central.

Pero **antes** conviene cerrar los **P0 (T1/T2)**: si los documentos y el timeline son idénticos en todo legajo,
cualquier recorrido de dos legajos delata la maqueta y le quita credibilidad a lo demás. Orden sugerido:

1. **P0** (legajo-scoping de documentos/eventos + Resumen derivado) — credibilidad base.
2. **P1 #4** (Resolver alerta → OperationalTask) — muestra la tesis.
3. Resto de P1 según tiempo.

Decisión abierta para la próxima sesión: ¿avanzar con **cierre de gaps de demo** (este documento) o con
**backend-readiness** (futuro `DOMAIN_MODEL.md`)? La recomendación es **demo primero**: es más barato, da algo
mostrable, y al cerrar gaps se entiende mejor el dominio real antes de modelar el backend.
