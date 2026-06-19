// vault.js — Modelo conceptual de la Bóveda MercadoProp.
//
// La Bóveda es la cuenta transaccional única dentro del ecosistema MercadoPago
// donde se canalizan los movimientos económicos de una operación inmobiliaria
// (reserva, seña, honorarios, gastos, liquidaciones).
//
// La escribanía NO valida pagos ni revisa comprobantes: consulta eventos
// económicos ya registrados/validados por MercadoPago.
//
// Vocabulario controlado: ver /app/DEMO_MOCK_MAP.md §2.6 y §2.7.

// Catálogo de tipos de evento económico. Toda label visible vive acá para
// evitar strings libres con vocabulario prohibido.
export const ECONOMIC_EVENT_CATALOG = {
  vault_created: 'Bóveda de la operación creada',
  reservation_accredited: 'Pago registrado',
  notary_assigned: 'Escribanía asignada a la operación',
  down_payment_pending_enablement: 'Seña pendiente de habilitación',
  down_payment_enabled: 'Seña habilitada tras revisión notarial',
  down_payment_accredited: 'Pago registrado',
  fees_scheduled: 'Honorarios y gastos programados',
  final_settlement_scheduled: 'Liquidación final programada',
  final_settlement_confirmed: 'Liquidación final confirmada por MercadoPago',
};

// Estado económico general de la Bóveda.
export const ECONOMIC_STATUS = {
  reserva_acreditada:           { label: 'Reserva acreditada',                    tone: 'success' },
  sena_pendiente_habilitacion:  { label: 'Seña pendiente de habilitación',        tone: 'warning' },
  sena_habilitada:              { label: 'Seña habilitada tras revisión notarial', tone: 'info'   },
  sena_acreditada:              { label: 'Seña acreditada',                       tone: 'success' },
  honorarios_programados:       { label: 'Honorarios y gastos programados',       tone: 'info'    },
  liquidacion_pendiente:        { label: 'Liquidación final programada',          tone: 'info'    },
  liquidada:                    { label: 'Liquidación final confirmada',          tone: 'success' },
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

// Genera vaultId estable a partir del paymentId/opId.
// Convención: MP-734120985 → MPV-734120985 (mismo número, prefijo diferente).
// El vaultId es interno; en UI normalmente se omite y la Bóveda se entiende
// asociada a la operación MP-XXXXXXX.
export const vaultIdFromOpId = (opId) => {
  if (!opId) return null;
  return opId.replace(/^MP-/, 'MPV-');
};

// Label visible genérico de la Bóveda. No incluye número ni dirección.
export const DEFAULT_VAULT_LABEL = 'Bóveda de la operación';

// Construye un evento económico con shape consistente.
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

// Helper: dada una reserva (con paymentId, amount, date AR DD/MM/YYYY, notaryId),
// construye la terna { vaultId, economicStatus, economicEvents } inicial.
const arDateToISO = (dateAR, hour = 14, minute = 20) => {
  if (!dateAR) return new Date().toISOString();
  const [d, m, y] = dateAR.split('/').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hour, minute);
  return dt.toISOString();
};

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
