# Process / Activity UX Model — Avance del proceso vs Bitácora

> **Fase B del roadmap** ([`MPROP_DEMO_FUNCTIONAL_ROADMAP.md`](MPROP_DEMO_FUNCTIONAL_ROADMAP.md)). Documento
> conceptual de UX/producto/arquitectura. **No es implementación.** Define cómo deben convivir el **Avance del
> proceso** (mapa de estado) y la **Actividad / Bitácora** (log cronológico) sin que la UI los haga competir como
> dos timelines paralelos.
>
> **Cómo leer los marcadores de este doc:**
> - 🟢 **Decisión conceptual** — acordado; rige el diseño de aquí en más.
> - 🔵 **Recomendación futura / hipótesis fuerte** — dirección propuesta, todavía no instrucción de implementación.
> - 🚧 **WIP** — depende de entidades/infra que aún no existen; a validar antes de backend.
> - ⛔ **No implementar todavía** — explícitamente fuera de alcance ahora.
>
> Bases: [`SYSTEM_OVERVIEW.md`](SYSTEM_OVERVIEW.md) · [`OPERATIONAL_TASKS_ARCHITECTURE.md`](OPERATIONAL_TASKS_ARCHITECTURE.md)
> · [`UI_SEMANTIC_SYSTEM.md`](UI_SEMANTIC_SYSTEM.md).

---

## 1. Principio rector

Cinco conceptos, cinco responsabilidades que no se pisan:

- **El estado vive en el nodo del proceso.**
- **El evento explica cambios.**
- **La task acciona.**
- **El documento prueba.**
- **La responsabilidad operativa rutea.**

Corolarios: un evento no es el estado · una task no es el documento · una task no avanza por sí sola el workflow
formal · un documento no es una acción · la responsabilidad operativa no es el checklist · la bitácora explica cómo
llegamos al estado, pero no reemplaza al Avance del proceso.

---

## 2. 🟢 Separación a nivel modelo (no negociable)

Avance del proceso y Actividad/Bitácora son entidades con ciclo de vida y dueño distintos:

| | Avance del proceso | Actividad / Bitácora |
|---|---|---|
| Qué es | **Mapa de estado** del legajo (nodos/requisitos) | **Log append-only** de hechos |
| Mutabilidad | Mutable (un nodo cambia de estado) | Inmutable (un evento ocurrió) |
| Fuente de verdad de | **el estado actual** ("¿qué falta?") | **la historia** ("¿qué pasó?") |
| Pregunta | ¿Dónde estoy y qué me bloquea? | ¿Cómo llegué acá? (auditoría) |
| Rol | **operar** | **auditar** |

**No se unifica la infraestructura.** Si se fusionaran: o el Avance se llena de ruido histórico (se vuelve otro
log) o la Bitácora gana estados/acciones (se vuelve otro checklist). Lo que se rediseña es la **experiencia**.

---

## 3. El problema en UI (estado actual)

Hoy, en el detalle de legajo, **el tab "Actividad" contiene las dos cosas**: la Card "Línea de tiempo" (eventos,
`getEventosByOp`) **y** "Avance del proceso" (`TimelineProceso`/`buildTimelineChecklist`). Se ven como **dos listas
verticales cronológicas** → el usuario no distingue "lo que tengo que hacer" (estado) de "lo que ya pasó" (historia).
Compiten por el mismo significante visual.

> ⛔ **No implementar todavía:** no se mueve `TimelineProceso` ni se reestructuran los tabs en esta fase.

---

## 4. 🟢 Modelo de proyección de eventos (un store, dos vistas)

El evento se **autora una sola vez**; las dos vistas son **proyecciones por filtro**, nunca copias.

```
ActivityEvent { id, opId, ts, tipo, actor, descripcion,
                relatedProcessNodeId?, relatedDocumentId?, relatedTaskId? }   ← autorado UNA vez
        │
        ├─ Proyección GLOBAL (Bitácora):    todos los eventos del opId, orden cronológico
        └─ Proyección CONTEXTUAL (en nodo): eventos con relatedProcessNodeId == ese nodo (resumidos)
```

- **Bitácora (global):** apertura, uploads, validaciones, observaciones, eventos de Bóveda/pago, task creada /
  completada, traspasos de responsabilidad, agenda. Todo, plano y cronológico.
- **Contextual (dentro del nodo, en Avance):** solo el subconjunto del nodo, **colapsado** (1-3 relevantes +
  "ver todo" que salta a la Bitácora filtrada).

**Reglas derivadas:**
- 🟢 Anti-duplicación: un solo store; la diferencia entre vistas es el **encuadre** (cronológico-completo vs
  nodo-filtrado-resumido), no el dato.
- 🟢 Anti "Avance = log": el nodo muestra **estado** (señal principal) + eventos como contexto colapsado, no la
  historia completa.
- 🟢 Anti "Bitácora = checklist": la Bitácora **no** tiene estado ni acciones que muten; solo hechos pasados y
  deep-links de navegación.

---

## 5. Mapa de referencia del legajo (flexible, no proceso rígido)

🔵 Estructura de referencia (no un workflow cerrado):

```
Hito (ProcessNode de nivel etapa)
  └─ Requisito (ProcessNode / ChecklistItem)
       estado:             pendiente | en curso | observado | completo | no_aplica
       bloquea_firma:      sí | no
       responsable_actual: <rol>                  (Responsabilidad operativa)
       evidencia:          [Document/Evidence]     (vía DocumentRequirement)
       eventos_relacionados:[ActivityEvent]        (relatedProcessNodeId)
       tasks:              [OperationalTask]        (relatedProcessNodeId / relatedDocumentRequirementId)
       acciones_posibles:  [subir doc · solicitar a <actor> · crear seguimiento · observar · validar]
```

Ejemplo:
```
Due diligence
  └─ Certificado de dominio
       estado: Observado · bloquea_firma: Sí · responsable_actual: Gestoría
       evidencia: cert_dominio.pdf
       eventos: [Gestoría subió certificado · Sistema detectó vencimiento previo a firma · Escribanía observó]
       tasks:   [Revisión] Solicitar nuevo certificado de dominio
       acciones: Solicitar nuevo certificado · Subir documento · Crear seguimiento
```

El mismo evento, dos proyecciones:
- **A. Bitácora global:** `23/06 10:31 · Gestoría subió certificado de dominio`
- **B. Contextual:** `Due diligence → Certificado de dominio → eventos relacionados`

---

## 6. Modelo conceptual (entidades y fuente de verdad)

🚧 Varias de estas entidades **no existen aún** como tales en el código (hoy: `buildTimelineChecklist` produce
nodos; `getEventosByOp` da eventos; `operationalTasks` las tasks; `op.bloqueoActor`/`op.lineaDePases` la
responsabilidad — legacy). Acá se definen como modelo objetivo.

| Entidad | Dueño de | Referencias |
|---|---|---|
| **ProcessNode / ChecklistItem** | el **estado** del requisito/hito, "bloquea firma" | — |
| **ActivityEvent** | el **registro** de un hecho (inmutable) | `relatedProcessNodeId?`, `relatedDocumentId?`, `relatedTaskId?` |
| **DocumentRequirement** | qué documento se necesita y su cumplimiento | `processNodeId` |
| **Document / Evidence** | el archivo real (prueba) | satisface un `DocumentRequirement` |
| **OperationalTask** | la **acción** para resolver/empujar/monitorear | `relatedProcessNodeId?`, `relatedDocumentRequirementId?` |
| **OperationalResponsibility** | **quién** debe actuar ahora + historial | legajo/nodo |

### Diferencias que el modelo mantiene nítidas
- **Estado actual** → ProcessNode (no se infiere de eventos).
- **Evento histórico** → ActivityEvent (no determina estado por sí solo).
- **Acción pendiente** → OperationalTask (no es el estado ni el documento).
- **Evidencia** → Document (prueba, no acción).
- **Responsabilidad actual** → OperationalResponsibility (rutea, no es checklist).

---

## 7. 🔵 UX del Avance del proceso (dirección: vista operativa primaria)

> 🔵 **Hipótesis fuerte / dirección UX futura.** El Avance del proceso debería ser la **vista operativa central**
> del legajo (candidato a Resumen o a primera pestaña operativa). **No es instrucción de mover tabs todavía** — la
> reubicación es F3 y se decide después.

- **Muestra:** hitos agrupando requisitos; por requisito → estado (señal principal), "bloquea firma", responsable
  actual, evidencia disponible, eventos relacionados (colapsados), acciones contextuales.
- **No muestra:** la historia cronológica completa (eso es Bitácora), ni economía (Bóveda).
- **Agrupa** por hito; cada requisito expandible.
- **Bloqueos** como señal fuerte a nivel requisito, propagada al hito.
- **Acciones** habilitadas desde el requisito (punto de anclaje de la Task Card expandida).

---

## 8. UX de la Actividad / Bitácora

- **Muestra:** todos los eventos, orden cronológico descendente (actor/fecha/tipo).
- 🔵 **Naming (recomendación para F2):** renombrar **"Actividad" → "Bitácora"** ("Actividad" es ambiguo;
  "Bitácora" comunica registro/auditoría y deja de competir con "Avance"). **No se renombra ahora** — es F2.
- **Filtros:** por hito/requisito, actor, documento, task, tipo de evento.
- **Auditoría:** exportable, inmutable.
- **Sin estructura de estado:** los hitos pueden ser *filtro*, no secciones con estado/acciones. La Bitácora no
  agrupa por "lo que falta".

---

## 9. 🟢 Relación entre ambas vistas

- **Evento global → requisito:** clic en un evento con `relatedProcessNodeId` salta al requisito en Avance.
- **Requisito → eventos:** "ver todo" en el nodo abre la Bitácora pre-filtrada por ese nodo.
- **Sin doble lectura confusa:** Bitácora completa pero "tonta" (solo hechos); Avance selectivo (estado + contexto
  resumido). Se distinguen por su **forma** (mapa por hitos vs log plano).
- **Primaria para operar:** Avance. **Primaria para auditar:** Bitácora.

---

## 10. Relación con Task Cards

🚧 (Depende de §4B de `UI_SEMANTIC_SYSTEM` y del modelo de nodo de este doc.)

- La **Task Card expandida** es una **lente sobre un ProcessNode / DocumentRequirement**:
  - del **nodo:** label del requisito, estado, "bloquea firma", responsable actual, evidencia.
  - del **evento:** eventos relacionados (mismos `relatedProcessNodeId`, proyección — sin re-loguear).
  - de la **OperationalTask:** tipo, severidad, origen, acciones.
- **No duplica la bitácora:** muestra eventos del nodo como contexto, no un log propio.

---

## 11. Relación con Responsabilidad operativa

- **Responsable actual:** en el **requisito** dentro de Avance + en el **header del legajo** (pill neutral, ya hecho).
- **Historial de responsabilidad:** en el **popover "Responsabilidad operativa"** (ya renombrado) y como eventos de
  tipo "traspaso de responsabilidad" en la **Bitácora**.
- **En Task expandida:** el responsable actual del nodo asociado (no se reescribe en la card compacta).
- **Orienta** (a quién contactar/esperar/escalar), **no** determina el estado ni que un requisito esté satisfecho.

---

## 12. Relación con documentos

🚧 (Requiere `DocumentRequirement`, futuro.)

- `DocumentRequirement.processNodeId` conecta el requisito documental al nodo.
- **Evidencia** se muestra en Avance dentro del requisito — referenciada del dominio Documentos, no copiada.
- **Uploads / validaciones / rechazos** generan `ActivityEvent`s (`document_uploaded/validated/rejected`) → aparecen
  en Bitácora (global) y en el nodo (contextual).
- **Rechazo/observación** cambia el **estado del ProcessNode** (a "observado") — el evento informa; la transición la
  hace la regla del proceso, no la task.

---

## 13. 🔵 Propuesta de UI futura (dirección, no instrucción)

- **Detalle de legajo:** Avance del proceso como vista operativa central (candidato a Resumen / primera pestaña).
- **Bitácora** como pestaña secundaria de auditoría (renombrada desde "Actividad" en F2).
- Hoy el tab "Actividad" mezcla ambas; el rediseño las separa por rol.
- **Copy futuro:** "Actividad" → "Bitácora" (F2); mantener "Avance del proceso".
- ⛔ **No tocar todavía:** estructura de tabs, ubicación de `TimelineProceso`, naming en UI.

---

## 14. Infraestructura conceptual futura

- 🚧 **Entidades nuevas:** `ProcessNode`/`ChecklistItem` formalizado, `ActivityEvent` con `relatedProcessNodeId`,
  `DocumentRequirement`, `OperationalResponsibility` (con historial).
- 🚧 **Referencias cruzadas:** `ActivityEvent.relatedProcessNodeId`, `DocumentRequirement.processNodeId`,
  `OperationalTask.relatedProcessNodeId / relatedDocumentRequirementId`.
- **Se puede simular hoy (sin backend):** `buildTimelineChecklist` ya da nodos; `getEventosByOp` ya da eventos
  scoped. Con un campo de relación mock (`relatedProcessNodeId` en eventos mock) se prototipa la proyección
  contextual sin backend.
- **Requiere backend real:** store de eventos append-only, sync requirement→nodo→task, validaciones reales,
  exportación auditable.

---

## 15. Riesgos

- **Super-timeline confuso** → separar "mapa por hitos" (Avance) de "log plano" (Bitácora) con formas distintas.
- **Duplicar eventos** → un store + dos proyecciones por filtro (nunca copia).
- **Mezclar estado con auditoría** → regla "Avance = operar / Bitácora = auditar".
- **Ocultar eventos importantes dentro de hitos** → la Bitácora global siempre los tiene completos; el nodo resume
  + linkea.
- **Legajo demasiado complejo** → Avance primario simple (estado + acción); el detalle fino vive en el expand y la
  Bitácora.

---

## 16. Fases recomendadas

| Fase | Qué | Estado |
|---|---|---|
| **F1** | Documentación / modelo conceptual (este documento) | 🟢 en curso |
| **F2** | Copy/naming: "Actividad" → "Bitácora" | 🔵 recomendación, no ahora |
| **F3** | Reubicación visual: Avance como vista operativa primaria | 🔵 dirección, no ahora |
| **F4** | Eventos relacionados dentro de requisitos (proyección contextual) | 🚧 requiere `relatedProcessNodeId` |
| **F5** | Integración con Task Card expandida (lente sobre nodo) | 🚧 |
| **F6** | Event model real / backend | 🚧 |

---

## 17. Qué pasa antes de la Task Card (relación con Fase C del roadmap)

- La **Task Card compacta** puede usar una **gramática visual simple** (badge=tipo / severidad=tratamiento /
  origen=detalle, ver `UI_SEMANTIC_SYSTEM §4A`). **Su implementación queda posterior al cierre de este documento** —
  no se abre implementación de TaskCard (ni compacta ni expandida) antes de cerrar `PROCESS_ACTIVITY_UX_MODEL.md`.
- La **Task Card expandida** depende directamente de este doc: necesita el **modelo de nodo** + el **contrato de
  referencias** (`relatedProcessNodeId`, `relatedDocumentRequirementId`) + la decisión Avance-primario/Bitácora-
  secundario. Eso debe quedar resuelto acá antes de abrir la action surface (Fase C).

---

## 18. Qué NO se implementa todavía (resumen)

⛔ Nada de código en esta fase. En particular: **no** renombrar "Actividad"→"Bitácora" en UI · **no** mover
`TimelineProceso` ni reestructurar tabs · **no** agregar `relatedProcessNodeId` a eventos · **no** la proyección
contextual · **no** la Task Card (compacta ni expandida) · **no** stores/rutas/componentes/backend. Esta fase es
**solo este documento**.
