# DEMO_MOCK_MAP.md — Mapa rápido del prototipo MercadoProp

> Documento de referencia interna para iterar sobre el prototipo navegable.
> Toda la lógica del backend está mockeada en frontend (React + Context + localStorage).
> No hay persistencia real ni endpoints reales: cambios sobreviven sólo en el navegador.

---

## 1. Rutas principales de la demo

| Sección | Ruta | Componente | Notas |
|---|---|---|---|
| **Marketplace** | `/` | `pages/Home.jsx` | Hero amarillo + categorías estilo PedidosYa + grilla de propiedades |
| Detalle de propiedad | `/propiedad/:id` | `pages/PropertyDetail.jsx` | Galería, datos, simulador de costos, CTA "Hacer oferta" |
| **Flujo comprador** ||||
| Validación biométrica | `/verificacion` | `pages/Verification.jsx` | Simulada (timeout + estado en context) |
| Coordinar visita | `/visita/:id` | `pages/ScheduleVisit.jsx` | Slots fijos (`TIME_SLOTS`) |
| Hacer oferta | `/oferta/:id` | `pages/MakeOffer.jsx` | Con historial de contraofertas |
| Reserva (escrow) | `/reserva/:id` | `pages/EscrowCheckout.jsx` | 1 % del precio · checkboxes obligatorios |
| Selección de escribanía | `/escribania/:resId` | `pages/NotarySelection.jsx` | Pantalla post-pago = "Reserva acreditada" + timeline + bóveda digital |
| Perfil del usuario | `/perfil` | `pages/Profile.jsx` | Pestañas: Visitas / Ofertas / Reservas / Publicaciones |
| Publicar propiedad | `/publicar` | `pages/Publish.jsx` | Wizard con paso de fotógrafo profesional |
| **Portal de escribanía** ||||
| Login escribanía | `/escribanos` | `pages/notary/NotaryLogin.jsx` | Header amarillo MP, demo sin password real |
| Panel (Inicio) | `/escribanos/panel` | `pages/notary/panel/Dashboard.jsx` | Tareas del día + Alertas + Kanban |
| Lista de Legajos | `/escribanos/operaciones` | `pages/notary/panel/OperacionesList.jsx` | Soporta `?hito=<id>` para filtrar por columna del kanban |
| **Detalle de legajo** | `/escribanos/operaciones/:id` | `pages/notary/panel/OperacionDetail.jsx` | Tabs: Resumen · Partes · Documentos · Timeline · Pagos |
| Agenda de firmas | `/escribanos/agenda` | `pages/notary/panel/Agenda.jsx` | Calendario mensual + sidebar |

---

## 2. Datos mock principales

Dos archivos concentran el mock:

- **`src/data/mock.js`** → catálogo marketplace + escribanías + fotógrafos.
- **`src/pages/notary/panel/mockData.js`** → operaciones / alertas / agenda / documentos del panel.

El **estado dinámico** (visitas, ofertas, reservas, publicaciones, sesión, tareas) vive en:

- `src/context/AppContext.jsx` (persiste en `localStorage` bajo `mercadoprop_state_v1`).
- `src/pages/notary/panel/dayTasksStore.js` (claves `mp_notary_my_day_tasks` y `mp_notary_my_day_done`).
- `localStorage["mp_notary_sidebar_collapsed"]` para la preferencia del sidebar.

### 2.1 Propiedades · `PROPERTIES` (mock.js)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | `p1`..`p6` |
| `title`, `type`, `price`, `expensas`, `neighborhood`, `city`, `address` | string/number | Mostrar tal cual |
| `ambientes`, `dormitorios`, `banos`, `m2`, `m2cub`, `antiguedad`, `cochera`, `publishedDays` | number/bool | Tarjeta y detalle |
| `description`, `features[]` | string[] | Detalle |
| `images[]` | URLs | 3 por propiedad |
| `seller` | `{ name, avatar, verified, rating, sales, memberSince }` | Card de vendedor en el detalle |

**Pantallas que la usan**: Home, PropertyDetail, ScheduleVisit, MakeOffer, EscrowCheckout, NotarySelection, OperacionDetail (vía adapter).

**Evitar en panel de escribanía**: ratings/reviews del vendedor (no aportan al legajo).

### 2.2 Usuarios

- **`CURRENT_USER`** (mock.js) → buyer logueado por defecto. Campos: `id, name, email, avatar, memberSince`. Usado en Profile.jsx, header, EscrowCheckout.
- **`escribania`** (panel/mockData.js) → escribanía logueada. Campos: `nombre, registro, iniciales`. Usado en sidebar y topbar del panel.

### 2.3 Visitas (estado dinámico) · `state.visits`

| Campo | Ejemplo |
|---|---|
| `id` | `v-seed-1` |
| `propertyId` | `p5` |
| `date` | `"Próximo sábado"` (label) |
| `time` | `"11:00"` |
| `iso` | YYYY-MM-DD |
| `status` | `confirmada`, `pendiente`, `cancelada` |

Demo seed: 1 visita confirmada a `p5`. Pantalla: Profile (pestaña Visitas).

### 2.4 Ofertas · `state.offers`

| Campo | Ejemplo |
|---|---|
| `id` | `o-seed-1` |
| `propertyId` | `p4` |
| `amount` | `130000` |
| `status` | `enviada` · `contraoferta` · `aceptada` · `rechazada` |
| `counterAmount` | contraoferta del vendedor |
| `message`, `date` | string |
| `history[]` | `[{ by: 'comprador'\|'vendedor', amount }]` |

Demo seed: 1 oferta en contraoferta a `p4`. Pantalla: Profile (pestaña Ofertas).

### 2.5 Reservas · `state.reservations` + `DEMO_RESERVATIONS`

| Campo | Ejemplo |
|---|---|
| `id` | `res-demo-1` |
| `propertyId` | `p2` |
| `amount` | USD (1 % del precio, mínimo USD 1.000) |
| `paymentId` | `MP-734120985` → también ID de la operación en el panel |
| `date` | `"05/06/2026"` |
| `status` | `escribania_asignada`, `pendiente` |
| `notaryId` | `n1`/`n2`/... apunta a `NOTARIES` |
| `buyer` | nombre del comprador |

Pantallas: Profile (pestaña Reservas), NotarySelection, **adapter del panel** (`operacionesAdapter.js`).
**Cuidado**: en el panel de escribanía no exponer el `amount` exacto si el legajo está en etapa "Apertura" y todavía no se confirmó el cierre.

### 2.6 Operaciones MercadoProp · `operaciones` (panel/mockData.js)

Son los legajos hardcodeados del panel + los que vienen de reservas vía adapter.

| Campo | Ejemplo |
|---|---|
| `id` | `MP-475032` |
| `direccion`, `barrio`, `tipo` | strings |
| `precio`, `moneda` | `130000`, `'USD'` |
| `uc`, `uf` | unidad complementaria / funcional |
| `estado` | `apertura` · `documentos` · `analisis` · `observado` · `en-firma` · `cerrado` |
| `progreso` | 0-100 |
| `pasoActual` | `'Apertura'`..`'Firma'` (ver `pasos`) |
| `tareaEnCurso` | texto **corto** para la card del kanban (ej. `"Esperar certificado"`) |
| `tareaEnCursoFull` | texto **largo** para el board de tareas (ej. `"Esperar nuevo certificado de dominio antes de la firma"`) |
| `firma`, `diasFirma` | fecha + delta en días (negativo si ya firmó) |
| `vendedor`, `comprador` | `{ nombre, dni, verificado, avatar }` |
| `riesgo` | `bajo` · `medio` · `alto` |
| `matricula`, `partida`, `catastro` | identificación registral |

Mock IDs hardcodeados: `MP-475032`, `MP-475011`, `MP-474998`, `MP-474870`, `MP-474812`, `MP-474755`.
IDs derivados de reservas: vienen del `paymentId` de la reserva (`MP-734120985`, etc.) — quedan en estado `apertura` con `tareaEnCurso = "Validar partes"`.

**No mostrar en el kanban**: `matricula`, `partida`, `catastro`, `uc/uf` (sólo en detalle, tab "Partes e inmueble").
**No mostrar en lista**: `tareaEnCursoFull` (es del board), `tareaEnCurso` corta (el kanban sí la muestra).

### 2.7 Escribanías · `NOTARIES` (mock.js)

| Campo | Ejemplo |
|---|---|
| `id` | `n1`..`n4` |
| `name`, `titular`, `registro` | strings |
| `rating`, `reviews`, `distance`, `zone`, `fee`, `days` | datos para card del marketplace de escribanías |
| `image` | URL |

Pantalla: NotarySelection.jsx (selección post-reserva).
**No mostrar dentro del panel**: `fee`, `reviews`, `distance` — son métricas comerciales del marketplace, no del workspace de la escribana.

### 2.8 Invitaciones a escribanía

**Implementación actual**: no existe una entidad explícita "invitación". El flujo se simula así:

1. El comprador paga la reserva (`EscrowCheckout`).
2. Elige escribanía → `r.notaryId = "n1"` y `r.status = "escribania_asignada"`.
3. En el panel de la escribanía, `operacionesAdapter.js` filtra `reservations.filter(r => r.notaryId === notarySession)` y transforma cada reserva en una operación en estado "Apertura".

Si más adelante se quiere modelar invitaciones explícitas, agregar un mock `INVITATIONS` con `{ id, reservationId, notaryId, status: 'pendiente'|'aceptada'|'rechazada', sentAt }`.

### 2.9 Legajos / expedientes

En esta demo "legajo" y "operación MercadoProp" son **la misma entidad** (ver §2.6). Lo que cambia es la vista:

- **Kanban**: 5 columnas (hitos) — ver `Kanban.jsx::HITOS`.
- **Lista**: tabla con filtros por estado y hito (`OperacionesList.jsx`).
- **Detalle**: tabs en `OperacionDetail.jsx`.

Mapping hito → estado(s):

| Hito (kanban) | Estados que agrupa |
|---|---|
| Inicio de operación | `apertura` |
| Expediente documental | `documentos` |
| Due diligence | `analisis`, `observado` |
| Pre-cierre | `en-firma` |
| Cierre y post-cierre | `cerrado` |

### 2.10 Tareas del día · `dayTasksStore.js`

Estructura:
```js
{ pending: ['MP-475032', 'MP-475011'], done: ['MP-474755'] }
```

- `pending[]` ordenable por drag, persistido en `mp_notary_my_day_tasks`.
- `done[]` con strikethrough en sección colapsable, persistido en `mp_notary_my_day_done`.

Acciones (API del store): `addPending`, `removePending`, `reorderPending(from,to)`, `complete`, `uncomplete`, `removeDone`, `clearPending`, `clearDone`.

Sólo guardamos IDs; el texto y meta se resuelven contra `operaciones[]` en render.

### 2.11 Alertas · `alertas` (panel/mockData.js)

| Campo | Ejemplo |
|---|---|
| `id`, `operacionId` | `1`, `MP-475032` |
| `nivel` | `critica` · `media` · `info` |
| `titulo`, `descripcion`, `accion` | strings |
| `impacto` | sólo en alertas críticas |
| `vence`, `firmaTentativa` | fechas (cuando aplica) |
| `responsable` | `Gestoría` · `Esc. Lagos` · `Comprador` · `Vendedor` |
| `prioridad` | `Alta` · `Media` · `Baja` |

Demo: 3 alertas asociadas a `MP-475032`.
**Donde se usan**: card "Alertas" del Dashboard, popover (`AlertChip`) en cards del kanban y board de tareas, alerts-zone del Detalle de legajo.

**Fallback**: si un legajo tiene `riesgo === 'alto'` o `estado === 'observado'` pero no hay entrada en `alertas[]`, `Kanban.jsx::getOpAlert` genera una alerta genérica para que el chip funcione igual.

### 2.12 Eventos · `eventos` (panel/mockData.js)

Línea de tiempo auditable que se muestra en el tab **Timeline** del Detalle de legajo.

| Campo | Ejemplo |
|---|---|
| `fecha`, `hora` | `'23/06'`, `'10:31'` |
| `tipo` | `documento` · `alerta` · `decision` · `pago` · `gestion` · `apertura` |
| `evento` | descripción |
| `responsable` | quien ejecutó la acción |
| `evidencia` | `archivo` · `comprobante` · `alerta` · `cambio` · `solicitud` · `sistema` |

8 eventos demo, todos asociados al recorrido de `MP-475032`.

### 2.13 Otros mocks útiles

- **`documentos`** (panel/mockData.js): checklist documental del legajo (8 items). Tab "Documentos" del Detalle.
- **`proximasFirmas`** (panel/mockData.js): 5 firmas agendadas. Card de agenda secundaria del Dashboard + Agenda.jsx.
- **`cargaMensual`** (panel/mockData.js): **no usado actualmente** (sobrevive de la versión con gráfico, pendiente de eliminar si no se reutiliza).
- **`PHOTOGRAPHERS`** (mock.js): paso opcional del wizard de publicación.
- **`TIME_SLOTS`** (mock.js): franjas horarias de visita.
- **`pasos`** (panel/mockData.js): `['Apertura', 'Documentos', 'Análisis', 'Pre-cierre', 'Firma']` — etiquetas para el stepper del Timeline.
- **`estadoLabel`**, **`riesgoLabel`** (panel/mockData.js): mapping a label + color (`info` · `warning` · `destructive` · `success` · `muted`).

---

## 3. Flujo narrativo de la demo

```
                ┌─────────────────────────┐
                │  Marketplace  (/)       │
                │  PROPERTIES (6 items)   │
                └────────────┬────────────┘
                             │ click "Hacer oferta / Reservar"
                             ▼
                ┌─────────────────────────┐
                │  Validación biométrica  │
                │  /verificacion          │
                │  → state.verified=true  │
                └────────────┬────────────┘
                             ▼
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
   ┌──────────────────┐         ┌──────────────────┐
   │  Visita /visita  │         │  Oferta /oferta  │
   │  state.visits[]  │         │  state.offers[]  │
   └────────┬─────────┘         └────────┬─────────┘
            │ aceptada                   │ aceptada/contraoferta
            └─────────────┬──────────────┘
                          ▼
              ┌─────────────────────────┐
              │  Reserva /reserva/:id   │
              │  state.reservations[] + │
              │  paymentId (MP-XXXXXXX) │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │ Selección de escribanía │
              │  /escribania/:resId     │
              │  → r.notaryId = "nX"    │
              │  → "Reserva acreditada" │
              └────────────┬────────────┘
                           │  ← Invitación implícita
                           │     (se evalúa en el adapter
                           │      del panel por notaryId)
                           ▼
              ┌─────────────────────────┐
              │   Login escribanía      │
              │   /escribanos           │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │   Panel — Inicio        │
              │   /escribanos/panel     │
              │  • Tareas del día (DnD) │
              │  • Alertas              │
              │  • Tablero (Kanban 5×)  │
              │       ↑ reservas reales │
              │         aparecen aquí   │
              │         en "Apertura"   │
              └────────────┬────────────┘
                           │  click columna o card
                           ▼
              ┌─────────────────────────┐
              │  Detalle de legajo      │
              │  /escribanos/           │
              │  operaciones/:id        │
              │  Tabs: Resumen ·        │
              │  Partes · Documentos ·  │
              │  Timeline · Pagos       │
              └─────────────────────────┘
```

### Puntos clave para entender el ciclo end-to-end

1. **El `paymentId` de una reserva = `id` de la operación en el panel** (ej. `MP-734120985`). No hay otra "translation table".
2. **No existe persistencia real**: si limpiás localStorage perdés todo lo dinámico (reservas, tareas del día, sesión de escribanía, publicaciones).
3. **El panel mezcla** operaciones mock duras (`MP-475032` etc.) + las que provienen de reservas del marketplace. Las primeras aportan riqueza visual; las segundas demuestran la sincronización.
4. **Las alertas y eventos están atados sólo a `MP-475032`** para tener un legajo "rico" cuando se navega. Los otros legajos hardcodeados y todos los provenientes de reservas no tienen alertas detalladas (caen al fallback genérico del `AlertChip`).
5. **Bóveda digital**: el número que se muestra en `NotarySelection` "Reserva acreditada" se deriva determinísticamente del `resId` (no se persiste).

---

## 4. Cosas a tener en cuenta al iterar

- **Si agregás campos a una operación**, actualizar también `operacionesAdapter.js` para que las reservas convertidas en operaciones no rompan vistas.
- **Si agregás un nuevo estado/hito**, mapearlo en `Kanban.jsx::HITOS` *y* en `estadoLabel` (mockData.js).
- **Si una pantalla nueva necesita datos del marketplace + panel**, importar desde el archivo correspondiente y nunca mezclar mocks en el mismo `import`.
- **Vocabulario prohibido** (decisión del producto): no usar `escrow`, `custodia`, `fondos retenidos`, `retenciones`, `IA notarial`, `validación automática`, `escribanía digital` en cualquier texto visible.
- **Tema visual scoped**: el panel de escribanía vive bajo `.escribania-panel` (`index.css`). No mover sus estilos al global.
