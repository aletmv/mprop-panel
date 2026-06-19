# MercadoProp — Product Requirements

## Problema original
Crear prototipo navegable de marketplace inmobiliario P2P con publicación de propiedades, validación biométrica simulada, agenda de visitas, ofertas digitales, reserva escrow y selección de escribanía. Incluye un Portal de Escribanías independiente para gestión de legajos.

## Stack
- React (Vite), Tailwind CSS, Shadcn UI
- Context API + store mínimo (`dayTasksStore.js`)
- Sin backend real: todo el estado es mock + persistido en `localStorage` (`mercadoprop_state_v1`)
- CSS aislado entre Marketplace (amarillo MercadoLibre) y Portal de Escribanías (azul MercadoPago)

## Lo implementado (resumen)
### Marketplace
- Home con hero amarillo full-bleed, categorías con estilo limpio
- Publicación de propiedades
- Validación biométrica simulada (`/verificacion`)
- Agenda de visitas
- Sistema de ofertas digitales con rondas de negociación
- Reserva escrow con dummy MercadoPago y selección de escribanía
- Checkout con condiciones de reserva (checkboxes obligatorios)
- Reserva completa con pipeline cronológico
- Perfil con flujo "Pausar publicación"

### Portal de Escribanías
- Login simulado
- Dashboard con Kanban de 5 hitos + TasksBoard con DnD + Alertas + Agenda + Resumen IA
- TasksBoard: tareas del día con hourglass animado, completadas, contadores
- Kanban con columnas clickeables, AlertChip con hovercards ricas, **BloqueoBadge** que indica próximo responsable de desbloqueo (`Acción: vendedor/comprador/escribanía`, `Requiere gestoría`, `Esperando tercero`, `Bloqueado`)
- Toggle Kanban/Lista en bloque Legajos
- Vista Lista con columnas Estado / Acción / Tarea / Partes / Firma / Riesgo
- Detalle de operación con timeline, documentos, eventos, alertas
- Sidebar colapsable estilo MercadoLibre con avatar de la escribanía
- Sincronización: cada reserva del marketplace genera un legajo nuevo en el panel del notario elegido
- "Primera vivienda": exención de impuestos reflejada en tablas de costos del notario
- PartiesPair: avatares Comprador / Vendedor con línea conectora, no superpuestos
- Documentación de mocks en `/app/DEMO_MOCK_MAP.md`

## Backlog priorizado
### P2
- Gestión de ofertas entrantes en el panel del vendedor (ver/aceptar/contraofertar/rechazar)
- Chat directo comprador ↔ vendedor (mock)
- Sistema de favoritos con `localStorage`
- Centro de notificaciones (campana con badges)

## Convenciones críticas
- Backend FastAPI presente pero NO usado: el prototipo es 100% frontend con mocks.
- Mantener aislamiento CSS entre Marketplace y Portal de Escribanías.
- Dos entornos: PREVIEW (dev) y PRODUCTION (deploy). Si el usuario reporta un bug, preguntar primero en cuál lo está viendo.
- Nunca incluir URLs de preview/deploy en mensajes.

## Credenciales de test
Ver `/app/memory/test_credentials.md`
