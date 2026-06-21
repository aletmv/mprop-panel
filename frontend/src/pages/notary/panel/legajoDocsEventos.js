// Documentos y eventos scoped por legajo — cierre de P0 demo integrity
// (ver memory/DEMO_READINESS.md §2 T1). Antes, OperacionDetail.jsx renderizaba
// dos arrays mock globales idénticos en todo legajo: dos legajos distintos
// mostraban los mismos documentos, el mismo timeline y hasta el ID de otro
// legajo en el evento de apertura.
//
// Acá generamos un subconjunto coherente con la ETAPA del legajo (op.estado),
// determinístico (sin Math.random en render) y usando op.id/op.precio reales.
// Sigue el patrón de timelineChecklist.js (generadores keyed por op).
//
// NO toca Bóveda: lee op.precio solo para textear montos de eventos económicos
// ya existentes, no modifica economicEvents ni el tab Bóveda.

import { RESERVATION_PCT, DOWN_PAYMENT_PCT } from './vault';

// Orden de etapa. Los legajos de reserva (adapter) entran como 'apertura' → 0,
// que es justamente el fallback deseado: pocos documentos/eventos, recién abierto.
const STAGE_ORD = {
  apertura: 0,
  documentos: 1,
  analisis: 2,
  observado: 2,
  'en-firma': 3,
  cerrado: 4,
};
const ordOf = (op) => STAGE_ORD[op?.estado] ?? 0;

const usd = (n) => `USD ${Math.round(n || 0).toLocaleString('es-AR')}`;

// Cada documento entra a partir de una etapa (`threshold`). Estado resultante:
// etapa pasada → 'revisado'; etapa actual → su estado "fresco"; legajo cerrado
// → todo 'revisado'. Override: en 'observado', el certificado de dominio entra
// en 'alerta' (reproduce el caso original de MP-673033).
const DOC_TEMPLATE = [
  { id: 1, nombre: 'Título de propiedad',            responsable: 'Vendedor',    fecha: '06/06', threshold: 1, fresh: 'revisado' },
  { id: 2, nombre: 'Certificado de dominio',         responsable: 'Gestoría',    fecha: '23/06', threshold: 2, fresh: 'pendiente' },
  { id: 3, nombre: 'Certificado de inhibición',      responsable: 'Gestoría',    fecha: '—',     threshold: 2, fresh: 'pendiente' },
  { id: 4, nombre: 'Libre deuda expensas',           responsable: 'Comprador',   fecha: '14/06', threshold: 1, fresh: 'revisado' },
  { id: 5, nombre: 'Libre deuda ABL',                responsable: 'Comprador',   fecha: '12/06', threshold: 1, fresh: 'revisado' },
  { id: 6, nombre: 'Trazabilidad de seña en Bóveda', responsable: 'MercadoPago', fecha: '11/06', threshold: 0, fresh: 'revisado' },
  { id: 7, nombre: 'Boleto de compraventa',          responsable: 'Esc. Lagos',  fecha: '10/06', threshold: 1, fresh: 'revisado' },
  { id: 8, nombre: 'DNI partes',                     responsable: 'Esc. Lagos',  fecha: '04/06', threshold: 0, fresh: 'revisado' },
];

export const getDocumentosByOp = (op) => {
  const ord = ordOf(op);
  return DOC_TEMPLATE.filter((d) => d.threshold <= ord).map((d) => {
    let estado;
    if (ord >= 4) estado = 'revisado';
    else if (d.threshold < ord) estado = 'revisado';
    else estado = d.fresh;
    if (op?.estado === 'observado' && d.id === 2) estado = 'alerta';
    const doc = { id: d.id, nombre: d.nombre, responsable: d.responsable, fecha: d.fecha, estado };
    if (estado === 'alerta') doc.nota = 'Vence 24/06';
    return doc;
  });
};

// Eventos: bitácora acumulada hasta la etapa actual. `evento` puede ser string
// o función(op) cuando necesita el id/precio real del legajo. La lista queda
// más reciente primero (igual que el mock original).
const EV_TEMPLATE = [
  { fecha: '23/06', hora: '10:31', tipo: 'documento', evento: 'Se recibió certificado de dominio',                          responsable: 'Gestoría',    evidencia: 'archivo',       threshold: 2 },
  { fecha: '22/06', hora: '10:45', tipo: 'alerta',    evento: 'Vencimiento previo a firma marcado por la gestoría',         responsable: 'Gestoría',    evidencia: 'alerta',        threshold: 2 },
  { fecha: '19/06', hora: '11:05', tipo: 'decision',  evento: 'Esc. Lagos marcó título como "En estudio"',                  responsable: 'Esc. Lagos',  evidencia: 'cambio',        threshold: 2 },
  { fecha: '11/06', hora: '09:13', tipo: 'boveda',    evento: (op) => `Seña pendiente de habilitación · ${usd(op.precio * DOWN_PAYMENT_PCT)} · Evento económico en Bóveda`, responsable: 'MercadoPago', evidencia: 'evento Bóveda', threshold: 1 },
  { fecha: '09/06', hora: '11:17', tipo: 'gestion',   evento: 'Comprador solicitó libre deuda de expensas',                 responsable: 'Comprador',   evidencia: 'solicitud',     threshold: 1 },
  { fecha: '06/06', hora: '15:48', tipo: 'documento', evento: 'Vendedor cargó título de propiedad escaneado',               responsable: 'Vendedor',    evidencia: 'archivo',       threshold: 1 },
  { fecha: '04/06', hora: '10:12', tipo: 'boveda',    evento: (op) => `Pago registrado · Reserva ${usd(op.precio * RESERVATION_PCT)} · Trazado por MercadoPago`, responsable: 'MercadoPago', evidencia: 'evento Bóveda', threshold: 0 },
  { fecha: '04/06', hora: '10:00', tipo: 'apertura',  evento: (op) => `Apertura del legajo ${op.id}`,                       responsable: 'Esc. Lagos',  evidencia: 'sistema',       threshold: 0 },
];

export const getEventosByOp = (op) => {
  const ord = ordOf(op);
  return EV_TEMPLATE.filter((e) => e.threshold <= ord).map((e) => ({
    fecha: e.fecha,
    hora: e.hora,
    tipo: e.tipo,
    evento: typeof e.evento === 'function' ? e.evento(op) : e.evento,
    responsable: e.responsable,
    evidencia: e.evidencia,
  }));
};
