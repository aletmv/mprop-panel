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
- **Transparencia de gastos** (11 jun): card "Transparencia de gastos" en detalle de propiedad para el comprador (comisión MercadoProp 1% al comprar vs. 4% tradicional tachado, escribanía ~2%, sellos 1,75%, certificados, costo total de operación, ahorro 3%) + calculadora "Gastos de venta" en panel de usuario tab Avisos (comisión 1% vs. 2%+IVA, sellos, certificados, neto a recibir). Lógica en `src/lib/costs.js`, UI en `src/components/CostBreakdown.jsx`. Verificado con screenshots (cálculos correctos)
- **Banner carrusel home** (11 jun): carrusel estilo MercadoLibre (`src/components/HeroBanner.jsx`): 5 slides (72% menos gastos / Costos 100% claros / Visitas Seguras / Reserva protegida / Escribanías en un clic), autoplay 5s, flechas desktop, dots
- **Portal de Escribanos** (11 jun): rutas /escribanos (login simulado, cualquier credencial, precargado demo@escribania.com/demo1234, dropdown n1-n4), /escribanos/panel (stats: carpetas, firmas, comisión 1% a rendir, honorarios 1,5%; tabs Carpetas/Agenda) y /escribanos/carpeta/:resId (checklist 5 etapas/12 tareas del proceso notarial: identidad/inhibiciones → fiscalización dinero/UIF → mesa de retenciones con sellos 3,5%, ganancias 4,5% est., ABL, comisión MercadoProp 1%+1% retenida por el escribano → lectura/firma protocolo → testimonio/inscripción DNRPI). Asistente IA SIMULADO (NotaryAssistant.jsx) con chips (resumen/qué sigue/retenciones/minuta) y respuestas por keywords, consciente de etapa y montos. Carpetas se generan por el flujo real de reservas (reservation.notaryId) + **4 carpetas demo seedeadas** (res-demo-1..4: 3 para n1 en etapas 1/3/firma, 1 para n2 casi completa; con buyer propio, merge no destructivo en load(), ocultas del perfil del comprador vía filtro !r.buyer). Shell propio azul navy (NotaryShell.jsx) detectado en Layout por pathname /escribanos. Archivos: src/data/notaryProcess.js, src/pages/notary/*, src/components/NotaryShell.jsx, NotaryAssistant.jsx. Testing: iteration_2.json — 12/12 PASS (100%)
- **Vista calendario + próxima etapa + IA en panel** (11 jun): componente reusable `CalendarMonth.jsx` (grilla mensual es-AR, navegación, dots por evento, eventos del día seleccionado) + `ViewToggle` Lista/Calendario. Usado en perfil consumidor (tab Visitas: visitas con v.iso + firmas estimadas de reservas a +21 días) y portal escribanos (tab Agenda: revisión en fecha de reserva + firma estimada +21d). Las visitas ahora guardan `iso`. Carpetas muestran "Próxima: Etapa N · título" en panel (next-stage-{id}) y en header del detalle (folder-next-stage). Asistente IA agregado al PANEL con modo "panel" (aiPanelReply/aiPanelFree en notaryProcess.js: resumen del estudio, retenciones totales, próximos pasos, firmas pendientes); FAB en bottom-20 (no lo tapa el badge del preview). Verificado con screenshots
- **Adjuntos por etapa en carpetas** (11 jun): cada etapa de STAGES define `docs[]` (DNI partes, cert. inhibiciones, acta conteo/transferencia, DDJJ UIF, constancias Sellos AGIP/Ganancias ARCA/ABL, dominio, escritura matriz, testimonio, constancia DNRPI). Slots de adjunto en NotaryFolder con botón Adjuntar (input file real, guarda nombre/tamaño/fecha) y botón Demo; quitar con X; contador por etapa en header (stage-docs-count-{si}, verde al completar). Estado en AppContext.folderDocs (addFolderDoc/removeFolderDoc), persistido en localStorage; carpetas demo seedeadas con docs acordes a su etapa (DEMO_FOLDER_DOCS). Verificado con screenshots (subida real + demo + remove + persistencia)
- **Paso fotógrafo profesional en publicación** (11 jun): wizard pasa a 5 pasos; nuevo paso 4 "Fotografía profesional" con pool de 4 fotógrafos (PHOTOGRAPHERS en mock.js: rating, reseñas, zona, tag diferencial, precio sesión, link IG target _blank con stopPropagation) + opción "fotos propias" (default, opcional). Selección en form.photographerId, fila Fotografía en resumen y mensaje post-publicación "X te va a contactar en 24 hs" (publish-success-photographer). Verificado flujo completo con screenshots
- **Baja de publicación + rebranding logo** (11 jun): botón "Dar de baja" con confirmación inline (Confirmar/Cancelar) en tab Avisos del perfil (unpublish-{id}/confirm-unpublish-{id}, removePublished en AppContext). Nuevo componente `Logo.jsx` estilo MercadoLibre: emblema handshake (lucide) en círculo + wordmark "mercadoprop" minúsculas azul navy #2D3277 con fuente Baloo 2 (.font-logo); variante dark con tag "Escribanías" en NotaryShell. Eliminado el badge "por Mercado Pago" del header. Verificado con screenshots
- **Discriminación primera vivienda en gastos** (12 jun): toggle "¿Es tu primera vivienda?" (Switch shadcn) en card del comprador y calculadora del vendedor. Regla: valor en ARS al TC de referencia ($1.190, TC_REFERENCIA en costs.js); si vivienda única y ≤ $226.000.000 (SELLOS_TOPE_ARS) → sellos exento (muestra "Exento" + nota azul); si supera → 3,5% solo sobre el excedente, 1,75% por parte. Muestra valor en pesos y TC. Verificado: p1 (220,15M exento), p6 (excedente U$S 2.276/parte), vendedor 150k exento
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
