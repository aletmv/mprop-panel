// Adapter: convierte una reserva del marketplace en formato "operación" del panel.
// La idea es que cada reserva con escribanía asignada aparezca como un legajo nuevo en estado "Apertura".

const dniDemoFromName = (name) => {
  if (!name) return '—';
  // Generar DNI estable a partir del nombre (mock).
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const n = 10000000 + (hash % 30000000);
  const s = String(n);
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}`;
};

const initials = (name) =>
  (name || '—')
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const matriculaFromId = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return `FR ${String(10 + (h % 25)).padStart(2, '0')}-${String(1000 + (h % 9000))}`;
};

const tentativeFirma = (dateAR) => {
  // dateAR esperado "DD/MM/YYYY"; sumamos 45 días como firma tentativa.
  if (!dateAR) return { firma: '—', diasFirma: 45 };
  const [d, m, y] = dateAR.split('/').map(Number);
  const base = new Date(y, (m || 1) - 1, d || 1);
  base.setDate(base.getDate() + 45);
  const dd = String(base.getDate()).padStart(2, '0');
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const today = new Date();
  const diff = Math.round((base - today) / (1000 * 60 * 60 * 24));
  return { firma: `${dd}/${mm}/${base.getFullYear()}`, diasFirma: diff };
};

export const reservationToOperacion = (reservation, property) => {
  const buyerName = reservation.buyer || 'Comprador MercadoProp';
  const sellerName = property?.seller?.nombre || property?.seller?.name || 'Vendedor MercadoProp';
  const { firma, diasFirma } = tentativeFirma(reservation.date);
  const opId = (reservation.paymentId || `RES-${reservation.id}`).replace(/^MP-/, 'MP-');

  return {
    id: opId,
    _isFromReservation: true,
    _reservationId: reservation.id,
    direccion: property?.address || property?.title || '—',
    barrio: property ? `${property.neighborhood}, ${property.city}` : '—',
    tipo: property?.type || 'Propiedad',
    precio: property?.price || 0,
    moneda: 'USD',
    uc: 0,
    uf: '—',
    estado: 'apertura',
    progreso: 10,
    pasoActual: 'Apertura',
    tareaEnCurso: 'Validar partes',
    tareaEnCursoFull: 'Validar partes y solicitar documentación inicial',
    firma,
    diasFirma,
    vendedor: {
      nombre: sellerName,
      dni: dniDemoFromName(sellerName),
      verificado: !!property?.seller?.verified,
      avatar: initials(sellerName),
    },
    comprador: {
      nombre: buyerName,
      dni: dniDemoFromName(buyerName),
      verificado: true,
      avatar: initials(buyerName),
    },
    riesgo: 'bajo',
    matricula: matriculaFromId(opId),
    partida: String(1000000 + (opId.length * 53217)).slice(0, 7),
    catastro: 'Pendiente de carga',
  };
};

export const buildNotaryOperaciones = (state, baseOperaciones) => {
  // state: { notarySession, reservations, allProperties? }
  // Devuelve operaciones del notario logueado: reservas reales + mock hardcoded.
  const { notarySession, reservations = [], getProperty } = state;
  if (!notarySession) return baseOperaciones;
  const mine = reservations.filter((r) => r.notaryId === notarySession);
  const fromRes = mine.map((r) => reservationToOperacion(r, getProperty?.(r.propertyId)));
  return [...fromRes, ...baseOperaciones];
};
