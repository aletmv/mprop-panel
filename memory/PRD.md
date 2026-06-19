# MercadoProp — Product Requirements

## Problema original
Crear prototipo navegable de marketplace inmobiliario P2P con publicación de propiedades, validación biométrica simulada, agenda de visitas, ofertas digitales, reserva escrow y selección de escribanía. Incluye un Portal de Escribanías independiente para gestión de legajos.

**Fuente de verdad detallada**: `/app/DEMO_MOCK_MAP.md` (modelo Bóveda MercadoProp + vocabulario controlado).

## Stack
- React (CRA), Tailwind CSS, Shadcn UI
- Context API + store mínimo (`dayTasksStore.js`)
- Sin backend real: todo el estado es mock + persistido en `localStorage` (`mercadoprop_state_v1`)
- CSS aislado entre Marketplace (amarillo MercadoLibre) y Portal de Escribanías (azul MercadoPago)

## Estado actual del prototipo

### Marketplace (flujo comprador)
- Home con hero amarillo full-bleed, categorías limpias
- Publicación de propiedades (wizard con fotógrafo)
- Validación biométrica simulada
- Agenda de visitas
- Sistema de ofertas digitales con rondas de negociación
- Reserva 1% con checkout que registra el **Pago en Bóveda de la operación**
- Selección de escribanía post-reserva
- Perfil con tabs Visitas / Ofertas / Reservas / Publicaciones
- Reservas en Profile muestran *"USD XX · Bóveda · MP-XXX"* (sin "en custodia")
- Pantalla post-pago: *"¡Reserva pagada! · Registramos USD X en la Bóveda de la operación"* · Estado: *"Pago registrado en Bóveda"*

### Portal de Escribanías
- Login simulado (Esc. María Inés Lagos · CABA)
- Dashboard con Tareas del día (DnD) + Alertas + Kanban con filtro "¿Quién tiene la pelota?"
- Kanban con badge soccer-style: pelota + responsable (Comprador, Vendedor, Escribanía, Gestoría, Tercero, Bloqueado)
- Lista alterna de Legajos con columna Acción
- **Tab "Bóveda"** en detalle del legajo, mostrando:
  - Hitos MercadoPago/MercadoProp (reserva 1%, seña 4%) con pills "Pago registrado / Habilitada / Pendiente de habilitación / A integrar"
  - Saldo a escriturar 95% como hito **programado ante escribanía**, visualmente diferenciado
  - Liquidación Comprador (Comisión MercadoProp 1%, Honorarios escribanía ~2%, Sellos 1.75%, Certificados e inscripción)
  - Liquidación Vendedor (Comisión MercadoProp 1%, Sellos 1.75%, Certificados de dominio e inhibición)
  - Sidebar Bóveda de la operación con estado económico, movimientos efectivos, programado ante escribanía
  - Helper de exención vivienda única
- Timeline con eventos tipo `boveda` (icono Wallet sky-blue) — sin menciones de comprobantes
- Alertas reformuladas (info de seña pendiente de habilitación, no de comprobante)
- Documentos sin "Comprobante de seña" — ahora "Trazabilidad de seña en Bóveda"
- Sincronización: reservas marketplace → legajo nuevo con Bóveda sembrada

## Modelo económico (ver §2.6–§2.8 de DEMO_MOCK_MAP.md)

### Constantes
- Reserva: 1% del precio
- Seña: 4% del precio (no 10%)
- Saldo a escriturar: 95% del precio (ante escribanía, no por MercadoPago)
- Comisión MercadoProp: 1% (cada parte)
- Honorarios escribanía: ~2% (comprador)
- Sellos: 1.75% (mitad cada parte, con posible exención)
- Certificados comprador: USD 450 fijo
- Certificados vendedor: USD 180 fijo

### Entidades del modelo Bóveda
- `vaultId`: interno (`MPV-XXXXXXX`), no se muestra como label visible
- `vaultLabel`: "Bóveda de la operación" (genérico, sin número)
- `economicStatus`: `reserva_acreditada | sena_pendiente_habilitacion | sena_habilitada`
- `economicEvents[]`: catálogo de 10 tipos (`vault_created`, `reservation_accredited`, `notary_assigned`, `down_payment_pending_enablement`, `down_payment_enabled`, `down_payment_accredited`, `buyer_taxes_scheduled`, `seller_taxes_scheduled`, `fees_scheduled`, `closing_balance_scheduled`)
- `buyerEconomicItems[]` y `sellerEconomicItems[]`: derivados de `lib/costs.js` para consistencia con simulador del marketplace

## Vocabulario controlado

### Prohibido
- "comprobante", "subió/cargó/revisar comprobante"
- "escrow", "custodia", "fondos retenidos", "en custodia"
- "transferencia manual", "conciliar pago"
- "IA notarial", "escribanía digital"
- "validación automática" (en contexto económico)
- "firmado por MercadoPago"

### Recomendado
- "Pago registrado"
- "Evento económico registrado/validado"
- "Hito económico confirmado/programado"
- "Trazabilidad económica MercadoProp"
- "Trazado por MercadoPago"
- "Bóveda de la operación"
- "Programado ante escribanía"

## Backlog (P2, fuera de scope inmediato)
- Gestión de ofertas entrantes en el panel del vendedor
- Chat directo comprador ↔ vendedor (mock)
- Sistema de favoritos con localStorage
- Centro de notificaciones (campana con badges)
- KPI cards "Ahora dependen de…" en el Dashboard del notario

## Convenciones críticas
- Backend FastAPI presente pero NO usado: el prototipo es 100% frontend con mocks.
- Mantener aislamiento CSS entre Marketplace y Portal de Escribanías.
- Dos entornos: PREVIEW (dev) y PRODUCTION (deploy). Si el usuario reporta un bug, preguntar primero en cuál lo está viendo.
- Nunca incluir URLs de preview/deploy en mensajes.

## Credenciales de test
Ver `/app/memory/test_credentials.md`
