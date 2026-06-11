# PRD — MercadoProp

## Problema original
Crear prototipo navegable de marketplace inmobiliario P2P con publicación de propiedades, validación biométrica simulada, agenda de visitas, ofertas digitales, reserva escrow y selección de escribanía.

## Decisiones del usuario (jun 2026)
- La demo convive dentro del ecosistema de **MercadoPago** → nombre: **MercadoProp**
- **Solo frontend navegable con datos mock** (sin backend, sin auth real)
- Subida de selfie + documento con confirmación visual (simulada)
- Integración **dummy** con MercadoPago (modo test, simulada client-side)
- Diseño moderno y minimalista estilo MercadoLibre/MercadoPago
- Idioma: español rioplatense

## Arquitectura
- React (CRA + craco), Tailwind, Shadcn UI, lucide-react, sonner
- Estado global: `src/context/AppContext.jsx` con persistencia en localStorage (`mercadoprop_state_v1`)
- Datos mock: `src/data/mock.js` (6 propiedades p1–p6, 4 escribanías n1–n4, usuario actual)
- Backend FastAPI sin uso (boilerplate intacto, no se testea)
- Fuentes: Manrope (headings) + Work Sans (body). Colores: #FFE600, #3483FA, #00A650
- Guías de diseño: `/app/design_guidelines.json`

## Rutas
| Ruta | Página |
|---|---|
| `/` | Home: listado, búsqueda, filtros por tipo |
| `/propiedad/:id` | Detalle: galería, características, vendedor, mapa, CTAs |
| `/publicar` | Wizard 4 pasos (datos, ubicación, fotos/precio, verificación+resumen) |
| `/verificacion?return=` | Biometría simulada: selfie + DNI frente/dorso → procesamiento → éxito |
| `/visita/:id` | Agenda: días horizontales + slots horarios |
| `/oferta/:id` | Oferta digital con chips rápidos (-5%, -10%) |
| `/reserva/:id` | Checkout escrow MercadoPago dummy (1% del precio, modo test) |
| `/escribania/:resId` | Selección de escribanía + timeline de la operación |
| `/perfil?tab=` | Tabs: Avisos / Visitas / Ofertas / Reservas |

## Reglas de negocio del prototipo
- Ofertar y reservar requieren identidad verificada (gating → redirige a /verificacion con return URL)
- Publicar requiere verificación en el paso 4 del wizard
- Reserva = 1% del precio (mín. U$S 1.000), fondos "retenidos en custodia"
- Seed inicial: 1 visita confirmada (p5) y 1 oferta con contraoferta (o-seed-1 sobre p4, aceptable desde perfil)

## Implementado (11 jun 2026) ✅
- Todo el flujo end-to-end: home → detalle → visita / verificación → oferta → escrow → escribanía → perfil
- Publicación de propiedad con wizard (aparece en home con badge "Tu publicación")
- Contraoferta seedeada con aceptar/rechazar → CTA "Reservar ahora"
- **Negociación multi-ronda**: tercera opción "Contraofertar" en ofertas — el comprador envía nueva oferta, el vendedor (simulado, ~4s) acepta si está dentro del 97% de su última contraoferta o responde con el punto medio; historial de negociación visible en la card (offer.history)
- **Transparencia de gastos** (11 jun): card "Transparencia de gastos" en detalle de propiedad para el comprador (escribanía ~2%, sellos 1,75%, certificados, comisión $0 con ahorro vs. 4% tradicional, costo total de operación) + calculadora "Gastos de venta" en panel de usuario tab Avisos (comisión 1% vs. 2%+IVA, sellos, certificados, neto a recibir). Lógica en `src/lib/costs.js`, UI en `src/components/CostBreakdown.jsx`. Verificado con screenshots (cálculos correctos)
- Persistencia localStorage tras recarga
- Testing: iteration_1.json — 10/12 flujos OK; bug de data-testid duplicados corregido (sufijo `-mobile` en CTAs del detalle) y cadena escrow→escribanía verificada manualmente después del fix. Negociación multi-ronda verificada con screenshot tool (2 rondas + aceptación)

## Backlog
- P1: Chat comprador-vendedor simulado
- P1: Vista "modo vendedor" (recibir ofertas/visitas sobre mi publicación)
- P2: Comparador de propiedades, favoritos
- P2: Notificaciones simuladas (campana en header)
- P2: Extraer componentes de pasos del wizard (Publish.jsx ~300 líneas)

## Credenciales
No aplica — sin autenticación (prototipo frontend-only).
