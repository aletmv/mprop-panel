# MProp Panel — Marco de trabajo hacia demo funcional

## Propósito

Este documento define el marco de trabajo para llevar el mock actual de `mprop-panel` hacia una demo funcional coherente.

La prioridad no es agregar features aisladas, sino ordenar el modelo mental del legajo para que cada nueva pieza tenga un lugar claro.

El objetivo es evitar que el proyecto avance con pantallas bonitas pero conceptualmente incoherentes.

## Principio rector

El producto debe separar claramente cinco conceptos:

- El estado vive en el nodo del proceso.
- El evento explica cambios.
- La task acciona.
- El documento prueba.
- La responsabilidad operativa rutea.

Esto significa:

- Un evento no es el estado.
- Una task no es el documento.
- Una task no debería avanzar por sí sola el workflow formal.
- Un documento no es una acción.
- La responsabilidad operativa no es el checklist.
- La bitácora explica cómo llegamos al estado actual, pero no reemplaza al Avance del proceso.

## Definición de demo funcional

Una demo funcional no necesita backend completo ni automatización real.

Debe permitir demostrar esta narrativa:

1. Entro a un legajo.
2. Veo su estado actual.
3. Entiendo qué falta para avanzar.
4. Veo qué está bloqueado u observado.
5. Identifico quién debe actuar.
6. Creo una tarea operativa desde una alerta o bloqueo.
7. Esa tarea aparece en las superficies correctas.
8. La tarea se entiende como acción contextual sobre un requisito, documento o evento.
9. Puedo explicar cómo esto escalaría luego a documentos reales, backend, reglas e IA.

## Fases de trabajo

### Fase A — Cerrar PR semantic cleanup

Objetivo: cerrar el PR actual sin agregar cambios conceptuales nuevos.

Alcance:

- Reemplazo visible de “pelota” y “línea de pases”.
- Uso de “Responsable actual”, “Responsabilidad operativa” e “Historial de responsabilidad”.
- Clarificación de copy.
- Neutralización visual de responsabilidad actual.
- Documentación semántica existente.

No hacer:

- No rediseñar Task Cards.
- No mover Avance del proceso.
- No rediseñar Actividad.
- No tocar stores.
- No tocar backend.
- No renombrar variables legacy como `op.lineaDePases`.

### Fase B — PROCESS_ACTIVITY_UX_MODEL

Objetivo: definir cómo conviven Avance del proceso y Actividad / Bitácora.

Problema:

A nivel infraestructura tiene sentido separarlos, pero en UI pueden parecer dos líneas de tiempo paralelas.

Tesis:

- No unificar infraestructura.
- Sí rediseñar la experiencia.
- Avance del proceso debe ser el mapa operativo del estado.
- Actividad debe ser una bitácora cronológica auditable.
- Los eventos pueden proyectarse dentro de cada hito/requisito como contexto.

Entregable:

- `memory/PROCESS_ACTIVITY_UX_MODEL.md`

### Fase C — Task Card Grammar / Action Surface

Objetivo: definir Task Cards como superficies de acción contextual sobre el modelo definido en Fase B.

Tesis:

La task no es la fuente de verdad.

La task actúa sobre algo:

- requisito
- documento
- evento
- alerta
- bloqueo
- responsabilidad pendiente

Entregable sugerido:

- `memory/TASK_CARD_ACTION_SURFACE_SPEC.md`

### Fase D — Demo functional gaps

Objetivo: elegir qué feature concreta cierra más valor de demo.

Candidatas principales:

- Programar firma
- Subir documento

Criterio:

Elegir una sola feature y definir qué narrativa de demo habilita.

Entregable sugerido:

- `memory/DEMO_FUNCTIONAL_GAPS.md`

### Fase E — DOMAIN_MODEL.md

Objetivo: definir entidades backend-ready antes de diseñar tablas, APIs o workers.

Entidades candidatas:

- Operation
- Party
- Document
- DocumentRequirement
- ChecklistItem / ProcessNode
- OperationalResponsibility
- ActivityEvent / OperationalEvent
- OperationalTask / WorkItem
- AutomationSuggestion
- MessageDraft / Communication
- PaymentEvent
- AgendaEvent

Entregable:

- `memory/DOMAIN_MODEL.md`

### Fase F — AI_AUTOMATION_RULES.md

Objetivo: definir arquitectura futura de eventos, reglas, sugerencias, aprobación humana y autoavance controlado.

Tesis:

No construir un mindmap rígido de todos los casos.

Construir una arquitectura:

- event-informed
- rule-driven
- task-driven
- human-approved

Regla crítica:

Una task no avanza el workflow formal por sí misma.

Una regla del workflow, bajo política explícita, puede avanzar un requisito o hito cuando se cumplen condiciones verificables.

Entregable:

- `memory/AI_AUTOMATION_RULES.md`

### Fase G — Backend real

Objetivo: implementar backend real una vez que el modelo de dominio y las reglas estén claras.

Alcance futuro:

- APIs
- base de datos
- permisos
- auditoría
- eventos
- workers
- archivos reales
- roles
- notificaciones
- integración frontend mediante adapters

## Orden recomendado

1. Fase A — cerrar semantic cleanup.
2. Fase B — PROCESS_ACTIVITY_UX_MODEL.
3. Fase C — Task Card Grammar / Action Surface.
4. Fase D — Demo functional gaps.
5. Fase E — DOMAIN_MODEL.md.
6. Fase F — AI_AUTOMATION_RULES.md.
7. Fase G — Backend real.

## Regla de avance

No abrir una fase de implementación si la fase conceptual anterior todavía no está clara.

Especialmente:

- No hacer TaskCard F1 antes de resolver Avance del proceso vs Bitácora.
- No hacer backend antes de Domain Model.
- No hacer IA antes de AI Automation Rules.
- No meter cambios conceptuales nuevos en el PR semantic cleanup.

## Próximo paso

Cerrar Fase A completamente.

Luego abrir Fase B con foco exclusivo en `PROCESS_ACTIVITY_UX_MODEL`.
