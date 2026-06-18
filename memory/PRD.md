# PRD · Panel de Escribanías (MercadoProp)

## Problema original
"Estoy trabajando sobre el frontend de un panel de control para escribanías. Cómo mejorarias el UI? Puedes generar viewports?"

El usuario está construyendo un panel operativo para escribanías que gestionan operaciones inmobiliarias (legajos) integrado a MercadoProp.

## Personas
- **Escribano titular** (ej. Esc. M.I. Lagos): supervisa legajos, autoriza firmas, valida documentación.
- **Asistente / Gestoría** (ej. Gestoría AVN): tramita documentos, levanta alertas, prepara firmas.

## Requisitos centrales (estáticos)
- Listado de operaciones / legajos en curso (lista filtrable).
- **Vista de detalle del legajo** (foco de esta iteración).
- Dashboard de KPIs.
- Agenda de firmas próximas.

## Lineamiento visual establecido
- **Tono**: institucional serio, referencia visual Mercado Pago.
- **Tokens**: HSL definidos en `/app/frontend/src/index.css` (azul MP `200 100% 45%` como primary, slate grays, blanco como canvas, sin gradientes pesados ni glassmorphism).
- **Componentes base**: cards blancas borde 1px, pills, dot status, tabs underline, botón primario MP blue sólido.
- **Tipografía**: Inter sans-serif. Números tabulares en valores monetarios y matrículas mono.
- **Documento de referencia**: `/app/design_guidelines.json` (creado por design agent).

## Implementado en esta sesión (18/06/2026)
- ✅ Paleta global migrada al palette institucional MP.
- ✅ **OperacionDetail rediseñado** con divulgación progresiva:
  - Zona A: header sticky compacto (back link, ID mono, status dot, badges, acciones, CTA "Programar firma").
  - Zona B: banners de alertas (crítica + media) con acento de borde izquierdo y CTA "Resolver".
  - Zona C: 4 cards ejecutivas (Inmueble+Precio · Estado+Fase · Firma+countdown · Responsables).
  - Zona D: tabs (Resumen · Partes e inmueble · Documentos · Timeline · Pagos) con divulgación progresiva — los datos densos (DNI, matrícula, partida catastral, eventos) quedan demovidos detrás de tabs.
- ✅ Stepper visual pesado reemplazado por "phase ribbon" textual en la pestaña Timeline.
- ✅ Todos los elementos interactivos con `data-testid`.

## Vistas existentes (pendientes de migrar al nuevo lenguaje)
- `Dashboard.jsx` — usa estilo previo (navy + coral).
- `OperacionesList.jsx` — usa estilo previo.
- `Agenda.jsx` — usa estilo previo.
- `Layout.jsx` (Sidebar + Topbar) — sigue funcionando con paleta nueva pero conserva gradientes; revisar.

## Roadmap / Backlog priorizado

### P0 — Bloqueantes
*(Ninguno actualmente)*

### P1 — Próximas vistas a migrar al lenguaje institucional
1. **Dashboard**: aplicar cards limpias MP-style, demover gradientes coral, KPIs con números tabulares y dot semantics.
2. **OperacionesList**: tabla MP-style con filas hover, status dots, paginación discreta, filtros como pills.
3. **Agenda de firmas**: calendar/listado dual con pills de estado (confirmada/observada/tentativa).
4. **Sidebar/Topbar**: simplificar gradientes residuales para consistencia total con el detalle.

### P2 — Mejoras de detalle
- Drawer lateral para acciones rápidas (subir documento, agregar nota) sin salir del legajo.
- Estados vacíos institucionales (sin alertas / sin documentos).
- Modo "scrolled header" con shadow al hacer scroll del detalle.
- Dark mode (opcional, baja prioridad para tono institucional).
- Agregar buscador global desde el Topbar conectado a operaciones reales.

### P3 — Backend (no iniciado, todo está mockeado)
- Sustituir `mockData.js` por endpoints REST.
- Auth / multitenancy de escribanías.
- Firma digital integrada.

## Stack actual
- React 19 + React Router DOM + Tailwind + Shadcn UI + lucide-react.
- Backend FastAPI + MongoDB (boilerplate, no usado todavía).
- Mock data centralizado en `/app/frontend/src/lib/mockData.js`.
