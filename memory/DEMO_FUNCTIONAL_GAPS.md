# Demo Functional Gaps — Fase D

> **Fase D del roadmap** ([`MPROP_DEMO_FUNCTIONAL_ROADMAP.md`](MPROP_DEMO_FUNCTIONAL_ROADMAP.md)). Documento de
> producto/decisión. **No es implementación.** Elige qué feature concreta cierra mejor el valor de la demo
> funcional, con el mínimo footprint técnico y sin adelantar el Domain Model (Fase E).
>
> **Marcadores:** 🟢 decisión · 🔵 dirección futura · 🚧 WIP (requiere entidades/infra futuras) · ⛔ no implementar.
>
> Bases: [`PROCESS_ACTIVITY_UX_MODEL.md`](PROCESS_ACTIVITY_UX_MODEL.md) ·
> [`TASK_CARD_ACTION_SURFACE_SPEC.md`](TASK_CARD_ACTION_SURFACE_SPEC.md) · [`DEMO_READINESS.md`](DEMO_READINESS.md).

---

## 1. Contexto

La demo funcional no necesita backend ni automatización real. Necesita poder demostrar la narrativa del roadmap:
entro a un legajo → veo su estado → entiendo qué falta → quién debe actuar → acciono → la acción aparece en las
superficies correctas. Fase D elige **una sola feature** que cierre valor de demo respetando el orden del roadmap
(no abrir implementación que dependa de fases conceptuales aún no cerradas).

Candidatas del roadmap: **Programar firma** vs **Subir documento**.

---

## 2. Comparativa

| Criterio | Subir documento | Programar firma |
|---|---|---|
| Valor demo comercial | Medio-alto (riesgo de "upload falso" hueco) | **Alto** — clímax visible del proceso notarial |
| Coherencia arquitectónica | **Máxima** (cadena Documento→Evento→Requisito→Avance→Task→needs_review) | Media-alta (`signature_scheduled` ∈ categoría 1; completa task "Coordinar firma") |
| Pantallas que toca | Documentos + Avance + Bitácora + OperationalTask + Operativa | Header legajo + Próximas firmas + Agenda + 1 task |
| Scope creep | **Alto** | Medio (riesgo = Agenda/calendario) |
| Duplicar fuente de verdad | **Alto**: hoy no hay store de documentos (se generan con `getDocumentosByOp`) | Bajo-medio: `op.firma` existe; override en store chico |
| Simulable con mock hoy | Solo versión degradada (append); la cadena real **no** | Sí, acotado (fijar fecha+estado + reflejarla) |
| Requiere modelo/backend | `DocumentRequirement` + `relatedProcessNodeId` + `needs_review` + **checklist mutable** + file storage | Calendario/notificaciones (evitables en demo) |
| Conexión OperationalTask | Vía `needs_review` → **futuro** | Vía completar "Coordinar firma" → **disponible hoy** |
| Conexión Avance / Bitácora | Fuerte (requiere nodo mutable) / `document_uploaded` | Media (hito pre-cierre) / `signature_scheduled` |

### Por qué Subir documento NO es la elección de Fase D
Es arquitectónicamente la más representativa, y **precisamente por eso** depende de piezas que pertenecen a Fases
E/F: `DocumentRequirement`, `relatedProcessNodeId`, `needs_review` real, **checklist mutable**, file/document store y
reglas evento→estado. Hacerla "bien" obliga a adelantar el Domain Model (viola el orden del roadmap); hacerla
"shallow" (append a la lista) no valida nada. Dato que lo sella: hoy el **Avance del proceso es generado**
(`buildTimelineChecklist` deriva nodos de `op.estado`), **no es mutable ni persistido** — para que un upload cambie
un requisito a `needs_review` primero hay que convertir el checklist en entidad mutable real, que **es** Fase E.

---

## 3. 🟢 Decisión

**Fase D = Programar firma.** Mejor relación valor-demo / footprint técnico:
- usa un CTA visible existente (`btn-programar-firma`, hoy stub);
- alto valor comercial (clímax del proceso);
- simulable con datos mock actuales (`op.firma`/`op.diasFirma`);
- puede emitir un evento `signature_scheduled` (categoría 1 del modelo de eventos);
- se refleja en header / Próximas firmas / (Agenda);
- se conecta con una OperationalTask "Coordinar firma" **hoy** (no vía `needs_review` futuro);
- no requiere backend real ni modelo documental nuevo.

### 🔵 Subir documento — diferida explícitamente
Queda reconocida como la **feature insignia de validación arquitectónica**, reprogramada para **después de Fase E
(Domain Model)**. Ahí se vuelve la prueba viva de Fases E/F (`DocumentRequirement`/`needs_review`/checklist mutable
ya definidos). No se descarta; se ordena.

---

## 4. Alcance mínimo de Programar firma

🟢 Vertical slice acotado:
- El botón "Programar firma" abre un control simple para **fijar/confirmar fecha + estado** (tentativa → confirmada).
- Persistir en un **store nuevo y chico keyed por opId** (patrón `dayTasksStore`/`operationalTasksStore`).
  Fuente de verdad clara: `override ?? op.firma` (override = lo programado; `op.firma` = tentativa por defecto).
- Reflejar en: **header del legajo** + card **"Próximas firmas"** del Dashboard + (opcional) marcar hito pre-cierre.
- Emitir un evento **`signature_scheduled`** visible en **Bitácora**.
- 🔵 (Opcional, alto valor) **completar** una OperationalTask "Coordinar firma" si existe para ese legajo.

---

## 5. Narrativa demo que habilita

> "Entro al legajo MP-328552, en pre-cierre. Veo la firma tentativa. Hago clic en **Programar firma**, confirmo la
> fecha y queda **confirmada**. Se refleja al instante en el header, en **Próximas firmas** del dashboard, y queda
> registrado en la **Bitácora** como evento. Si había una tarea 'Coordinar firma', se marca completada. Puedo
> explicar cómo esto, a futuro, dispararía reglas de proceso y notificaciones reales."

Cierra los pasos 5-7 de la narrativa del roadmap (identifico qué hacer → acciono → aparece en las superficies
correctas) sobre un hito comercialmente legible.

---

## 6. Pantallas tocadas

- **Detalle de legajo — header:** CTA "Programar firma" pasa de stub a funcional + reflejo de fecha/estado.
- **Dashboard — "Próximas firmas":** la fecha programada se refleja.
- **Bitácora:** nuevo evento `signature_scheduled`.
- **Operativa / Tareas del día (opcional):** completar la task "Coordinar firma".
- **Agenda:** reflejo de lectura solamente (sin construir calendario).

---

## 7. Qué se puede simular hoy (sin backend)

- `op.firma`/`op.diasFirma` ya existen como mock por legajo.
- Patrón de store local persistente (localStorage) ya probado en `dayTasksStore`/`operationalTasksStore` → se puede
  crear un store chico de "firmas programadas" sin tocar shape existente.
- El evento `signature_scheduled` se puede simular como entrada en la fuente de eventos (junto a `getEventosByOp`).
- El tie-in con OperationalTask "Coordinar firma" usa el store de tasks actual.

---

## 8. ⛔ Qué NO implementar

- Calendario/Agenda real (slots, conflictos, recurrencia, drag) — solo fijar/mostrar fecha.
- Notificaciones, invitaciones, recordatorios.
- Tocar el checklist como entidad mutable / Avance del proceso (Fase E).
- `DocumentRequirement`, `needs_review` real, file storage (eso es Subir documento, post-Fase E).
- Backend, rutas nuevas, cambios de shape de stores existentes (solo store nuevo aditivo).
- Reglas evento→estado automáticas (Fase F).

---

## 9. Riesgos

- **Scope creep de Agenda:** el mayor riesgo. Mitigación: la firma se fija con un control simple; la Agenda solo
  refleja lectura. Nada de calendario interactivo en esta fase.
- **Duplicar fuente de verdad de la fecha:** `op.firma` (tentativa) vs override programado. Mitigación: regla única
  `override ?? op.firma`; el override es la fuente para "programado/confirmado".
- **Superficialidad percibida:** mitigada con el tie-in al evento `signature_scheduled` (Bitácora) y a la task
  "Coordinar firma" — convierte el clic en una mini-cadena visible, no un cambio de label aislado.
- **Tentación de avanzar el hito formal:** programar firma **no** debe mutar el checklist/Avance como entidad (eso
  es Fase E); a lo sumo refleja visualmente el pre-cierre. La firma programada es un dato operativo, no un avance
  formal del workflow.

---

## 10. Fases posteriores (implementación de Programar firma)

| Fase | Qué | Estado |
|---|---|---|
| **D1** | Este documento (decisión + alcance) | 🟢 en curso |
| **D2** | Store chico de firmas programadas (localStorage, aditivo) | 🔵 al abrir implementación |
| **D3** | CTA "Programar firma" funcional + control de fecha/estado + reflejo en header/Próximas firmas | 🔵 |
| **D4** | Evento `signature_scheduled` en la fuente de eventos / Bitácora | 🔵 |
| **D5** | Tie-in: completar OperationalTask "Coordinar firma" | 🔵 |
| (futuro) | **Subir documento** como feature insignia | 🚧 post-Fase E (Domain Model) |

---

## 11. Cierre

🟢 **Decidido:** Fase D = Programar firma (alto valor demo, footprint mínimo, respeta el orden del roadmap, se
conecta con la capa de tasks hoy). Subir documento se difiere como feature insignia post-Domain Model.
🔵 **Dirección:** implementación en slices D2-D5, en rama propia, cuando se abra Fase D de código.
⛔ **Ahora:** solo este documento. No se abre implementación todavía.
