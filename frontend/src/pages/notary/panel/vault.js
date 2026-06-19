// vault.js — Modelo conceptual de la Bóveda MercadoProp.
//
// La Bóveda representa la cuenta transaccional única dentro del ecosistema
// MercadoPago donde se canalizan los movimientos económicos que suceden
// dentro de la app: reserva, seña y pagos asociados que MercadoProp decida
// operar por MercadoPago.
//
// Además organiza la liquidación económica de la operación: impuestos,
// sellos, honorarios, certificados e inscripción. Estos conceptos pueden
// mostrarse como hitos calculados/programados aunque no todos sean pagos
// ya registrados.
//
// El saldo a escriturar (95% del precio) NO se procesa dentro de la app:
// se paga ante la escribanía el día de la firma. En la Bóveda aparece
// como hito programado, nunca como pago validado por MercadoPago.
//
// La escribanía no valida pagos ni revisa comprobantes. Consulta eventos
// económicos ya registrados/trazables dentro del ecosistema.
//
// Fuente de verdad: /app/DEMO_MOCK_MAP.md §2.6, §2.7 y §2.8.

import { buyerCosts, sellerCosts } from '@/lib/costs';

// ─── Constantes económicas ────────────────────────────────────────────────
export const RESERVATION_PCT = 0.01; // 1%
export const DOWN_PAYMENT_PCT = 0.04; // 4%
export const CLOSING_BALANCE_PCT = 0.95; // 95% (paga ante escribanía)

// ─── Catálogo de eventos económicos ───────────────────────────────────────
// Toda label visible vive acá para evitar strings libres con vocabulario prohibido.
export const ECONOMIC_EVENT_CATALOG = {
  vault_created:                    'Bóveda de la operación creada',
  reservation_accredited:           'Pago registrado',
  notary_assigned:                  'Escribanía asignada a la operación',
  down_payment_pending_enablement:  'Seña pendiente de habilitación',
  down_payment_enabled:             'Seña habilitada tras revisión notarial',
  down_payment_accredited:          'Pago registrado',
  buyer_taxes_scheduled:            'Impuestos y gastos del comprador programados',
  seller_taxes_scheduled:           'Impuestos y gastos del vendedor programados',
  fees_scheduled:                   'Honorarios y gastos programados',
  closing_balance_scheduled:        'Saldo a escriturar programado ante escribanía',
};

// Estado económico general de la Bóveda. Solo los 3 estados explícitamente
// documentados en §2.6 del DEMO_MOCK_MAP.md.
export const ECONOMIC_STATUS = {
  reserva_acreditada:           { label: 'Reserva acreditada',                    tone: 'success' },
  sena_pendiente_habilitacion:  { label: 'Seña pendiente de habilitación',        tone: 'warning' },
  sena_habilitada:              { label: 'Seña habilitada tras revisión notarial', tone: 'info'   },
};

// Status puntual de un evento económico (no del legajo).
export const EVENT_STATUS = {
  registrado: { label: 'Registrado',  tone: 'info'    },
  validado:   { label: 'Validado',    tone: 'success' },
  confirmado: { label: 'Confirmado',  tone: 'success' },
  pendiente:  { label: 'Pendiente',   tone: 'warning' },
  habilitado: { label: 'Habilitado',  tone: 'info'    },
  programado: { label: 'Programado',  tone: 'muted'   },
};

// ─── Identificadores ──────────────────────────────────────────────────────
// vaultId interno; convención: MP-734120985 → MPV-734120985.
// El vaultId NO se muestra como label visible. La Bóveda se entiende
// asociada a la operación MP-XXXXXXX.
export const vaultIdFromOpId = (opId) => {
  if (!opId) return null;
  return opId.replace(/^MP-/, 'MPV-');
};

// Label visible genérico de la Bóveda. Sin número ni dirección.
export const DEFAULT_VAULT_LABEL = 'Bóveda de la operación';

// ─── Factories ────────────────────────────────────────────────────────────
export const makeEconomicEvent = ({
  id,
  type,
  status = 'validado',
  amount = null,
  currency = 'USD',
  paymentId,
  vaultId,
  occurredAt,
  labelOverride,
}) => ({
  id,
  type,
  label: labelOverride || ECONOMIC_EVENT_CATALOG[type] || type,
  source: 'mercadopago',
  status,
  amount,
  currency,
  paymentId,
  vaultId,
  occurredAt,
});

// Tipo canónico de cada item del comprador, en el mismo orden que costs.js.
const BUYER_ITEM_TYPES = [
  'buyer_marketplace_fee',
  'notary_fees',
  'buyer_stamp_tax',
  'buyer_registry_certificates',
];

// Tipo canónico de cada item del vendedor, en el mismo orden que costs.js.
const SELLER_ITEM_TYPES = [
  'seller_marketplace_fee',
  'seller_stamp_tax',
  'seller_certificates',
];

// Construye los items económicos del comprador a partir del precio.
// Reutiliza la misma lógica que el simulador del marketplace (lib/costs.js)
// para garantizar que los importes mostrados al notario coincidan con los
// que el comprador vio al reservar.
export const buildBuyerEconomicItems = (price, firstHome = false) => {
  if (!price) return [];
  const { items } = buyerCosts(price, firstHome);
  return items.map((it, idx) => ({
    type: BUYER_ITEM_TYPES[idx],
    label: it.label,
    amount: it.amount,
    status: 'programado',
  }));
};

// Construye los items económicos del vendedor a partir del precio.
export const buildSellerEconomicItems = (price, firstHome = false) => {
  if (!price) return [];
  const { items } = sellerCosts(price, firstHome);
  return items.map((it, idx) => ({
    type: SELLER_ITEM_TYPES[idx],
    label: it.label,
    amount: it.amount,
    status: 'programado',
  }));
};

// Saldo a escriturar (95% del precio). NO es pago MercadoPago, es hito
// programado ante escribanía.
export const closingBalanceAmount = (price) =>
  price ? Math.round(price * CLOSING_BALANCE_PCT) : 0;

// ─── Helpers de armado ────────────────────────────────────────────────────
const arDateToISO = (dateAR, hour = 14, minute = 20) => {
  if (!dateAR) return new Date().toISOString();
  const [d, m, y] = dateAR.split('/').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hour, minute);
  return dt.toISOString();
};

// Bóveda inicial al momento de la reserva del marketplace.
// Eventos: vault_created + reservation_accredited (+ notary_assigned si ya hay escribanía).
export const buildInitialVaultFromReservation = (reservation) => {
  if (!reservation) return null;
  const vaultId = vaultIdFromOpId(reservation.paymentId);
  const paymentId = reservation.paymentId;
  const baseISO = arDateToISO(reservation.date, 14, 20);

  const events = [
    makeEconomicEvent({
      id: `${paymentId}-ev-1`,
      type: 'vault_created',
      status: 'confirmado',
      paymentId,
      vaultId,
      occurredAt: arDateToISO(reservation.date, 14, 18),
    }),
    makeEconomicEvent({
      id: `${paymentId}-ev-2`,
      type: 'reservation_accredited',
      status: 'validado',
      amount: reservation.amount,
      currency: 'USD',
      paymentId,
      vaultId,
      occurredAt: baseISO,
    }),
  ];

  if (reservation.notaryId) {
    events.push(
      makeEconomicEvent({
        id: `${paymentId}-ev-3`,
        type: 'notary_assigned',
        status: 'confirmado',
        paymentId,
        vaultId,
        occurredAt: arDateToISO(reservation.date, 16, 5),
      }),
    );
  }

  return {
    vaultId,
    vaultLabel: DEFAULT_VAULT_LABEL,
    economicStatus: 'reserva_acreditada',
    economicEvents: events,
  };
};
