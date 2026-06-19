// timelineChecklist.js — Mock del checklist de hitos de la operación.
//
// Estructura de 5 hitos del proceso notarial inmobiliario MercadoProp:
//   1. Inicio de operación
//   2. Expediente documental
//   3. Due diligence
//   4. Pre-cierre
//   5. Cierre y post-cierre
//
// Reglas de origen (ver DEMO_MOCK_MAP.md):
//   - pago/reserva/seña/liquidación → origin "boveda"
//   - dominio, inhibiciones, catastro, CUIT, deudas fiscales → "base_externa"
//   - carga documental personal o del inmueble → comprador/vendedor
//   - análisis jurídico, apto firma, proyecto escritura → escribania
//   - coordinación o creación de legajo → plataforma
//   - documentación bancaria, crédito → banco

const ORIGIN_TO_RESPONSIBLE = {
  plataforma: 'Plataforma',
  boveda: 'MercadoPago',
  base_externa: 'Plataforma',
  comprador: 'Comprador',
  vendedor: 'Vendedor',
  banco: 'Banco',
  gestoria: 'Gestoría',
  escribania: 'Escribanía',
};

const mkItem = (id, label, origin, opts = {}) => ({
  id,
  label,
  origin,
  responsible: opts.responsible || ORIGIN_TO_RESPONSIBLE[origin] || '—',
  blocksSigning: opts.blocksSigning ?? false,
});

const STAGES_TEMPLATE = [
  {
    id: 'inicio',
    label: 'Inicio de operación',
    items: [
      mkItem('apertura',       'Apertura del legajo',                      'plataforma',  { blocksSigning: false }),
      mkItem('carga_inmueble', 'Carga inicial del inmueble',               'plataforma',  { blocksSigning: false }),
      mkItem('carga_partes',   'Carga de partes',                          'plataforma',  { blocksSigning: false }),
      mkItem('precio',         'Precio, moneda y condiciones comerciales', 'plataforma',  { blocksSigning: false }),
      mkItem('reserva',        'Reserva registrada',                       'boveda',      { blocksSigning: true  }),
      mkItem('responsables',   'Asignación de responsables',               'plataforma',  { blocksSigning: false }),
      mkItem('intervencion',   'Aceptación de intervención por la escribanía', 'escribania', { blocksSigning: true }),
    ],
  },
  {
    id: 'expediente',
    label: 'Expediente documental',
    items: [
      mkItem('dni_partes',     'DNI / CUIT / CUIL de las partes',                 'base_externa', { blocksSigning: true  }),
      mkItem('estado_civil',   'Estado civil y datos del cónyuge, si corresponde','comprador',    { blocksSigning: true  }),
      mkItem('poderes',        'Poderes, sociedades o sucesiones, si aplica',     'escribania',   { blocksSigning: false }),
      mkItem('titulo',         'Título de propiedad',                              'vendedor',    { blocksSigning: true  }),
      mkItem('rph',            'Reglamento de propiedad horizontal, si aplica',    'vendedor',    { blocksSigning: false }),
      mkItem('libre_deuda',    'Libre deuda de expensas, si aplica',               'vendedor',    { blocksSigning: false }),
      mkItem('deudas_fiscales','Deudas fiscales, tasas o servicios',               'base_externa',{ blocksSigning: false }),
      mkItem('catastro',       'Datos catastrales / partida / nomenclatura',       'base_externa',{ blocksSigning: false }),
      mkItem('credito',        'Documentación bancaria, si hay crédito',           'banco',       { blocksSigning: false }),
    ],
  },
  {
    id: 'due_diligence',
    label: 'Due diligence',
    items: [
      mkItem('analisis_titulo',   'Análisis del título',                                  'escribania',   { blocksSigning: true  }),
      mkItem('titularidad',       'Verificación de titularidad',                          'base_externa', { blocksSigning: true  }),
      mkItem('cert_dominio',      'Certificado de dominio',                               'base_externa', { blocksSigning: true  }),
      mkItem('cert_inhibicion',   'Certificados de inhibición',                           'base_externa', { blocksSigning: true  }),
      mkItem('gravamenes',        'Gravámenes, embargos, hipotecas o restricciones',      'base_externa', { blocksSigning: true  }),
      mkItem('personeria',        'Revisión de personería y capacidad',                   'escribania',   { blocksSigning: true  }),
      mkItem('catastral',         'Revisión catastral',                                   'base_externa', { blocksSigning: false }),
      mkItem('deudas',            'Revisión de deudas',                                   'base_externa', { blocksSigning: false }),
      mkItem('uif',               'Controles UIF / origen de fondos cuando corresponda',  'escribania',   { blocksSigning: false }),
    ],
  },
  {
    id: 'precierre',
    label: 'Pre-cierre',
    items: [
      mkItem('doc_completa',    'Documentación completa',                                 'escribania',  { blocksSigning: true  }),
      mkItem('subsanaciones',   'Observaciones subsanadas',                               'escribania',  { blocksSigning: true  }),
      mkItem('liquidacion',     'Liquidación de gastos, impuestos y honorarios',          'boveda',      { blocksSigning: false }),
      mkItem('pagos_registrados','Confirmación de pagos registrados',                     'boveda',      { blocksSigning: true  }),
      mkItem('proyecto',        'Proyecto de escritura',                                  'escribania',  { blocksSigning: true  }),
      mkItem('coordinacion',    'Coordinación con comprador, vendedor, inmobiliaria y banco', 'escribania', { blocksSigning: false }),
      mkItem('fecha_lugar',     'Confirmación de fecha, lugar y condiciones de firma',    'escribania',  { blocksSigning: true  }),
      mkItem('apto_firma',      'Marcado final: apto para firma',                         'escribania',  { blocksSigning: true  }),
    ],
  },
  {
    id: 'cierre',
    label: 'Cierre y post-cierre',
    items: [
      mkItem('firma',          'Firma de escritura',                          'escribania', { blocksSigning: false }),
      mkItem('control_pagos',  'Control final de pagos',                      'boveda',     { blocksSigning: false }),
      mkItem('posesion',       'Entrega de posesión o llaves, si corresponde','vendedor',   { blocksSigning: false }),
      mkItem('testimonio',     'Expedición de testimonio',                    'escribania', { blocksSigning: false }),
      mkItem('presentacion',   'Presentación registral',                      'escribania', { blocksSigning: false }),
      mkItem('seguimiento',    'Seguimiento de inscripción',                  'gestoria',   { blocksSigning: false }),
      mkItem('subsanacion_reg','Subsanación de observaciones registrales',    'gestoria',   { blocksSigning: false }),
      mkItem('entrega_doc',    'Entrega de documentación final',              'escribania', { blocksSigning: false }),
      mkItem('archivo',        'Archivo y cierre del legajo',                 'escribania', { blocksSigning: false }),
    ],
  },
];

// Mapea estado del legajo → índice del stage actual.
const ESTADO_TO_STAGE = {
  apertura: 0,
  documentos: 1,
  analisis: 2,
  'en-firma': 3,
  observado: 2,
  cerrado: 4,
};

// Overrides puntuales por operación: marca específicos como observados, automáticos o pendientes
// para contar historias coherentes con cada legajo de la demo.
const OP_OVERRIDES = {
  'MP-475032': {
    cert_dominio: { status: 'observado', note: 'Vence 24/06 — vencimiento previo a la firma del 25/06.', accion: 'Solicitar nuevo certificado a la gestoría.' },
    cert_inhibicion: { status: 'pendiente', note: 'No se registró pedido en los últimos 30 días.' },
  },
  'MP-475011': {
    apto_firma: { status: 'pendiente', note: 'Pendiente confirmación de sala con las partes.' },
    fecha_lugar: { status: 'pendiente', note: 'Sala asignada, falta confirmar horario con vendedor.' },
  },
  'MP-474998': {
    dni_partes: { status: 'observado', note: 'Vendedor pendiente de validación biométrica.', accion: 'Reenviar invitación de validación al vendedor.' },
    estado_civil: { status: 'pendiente' },
  },
  'MP-474870': {
    dni_partes: { status: 'observado', note: 'Comprador no subió DNI ni constancia de domicilio.', accion: 'Recordatorio automático al comprador.' },
    libre_deuda: { status: 'pendiente' },
  },
  'MP-474812': {
    dni_partes: { status: 'pendiente', note: 'Comprador no completó validación biométrica.' },
  },
};

// Evidencia mock estándar por tipo de origin.
const EVIDENCIA_POR_ORIGIN = {
  plataforma:   'Evento registrado en el legajo MercadoProp',
  boveda:       'Evento económico en Bóveda — trazado por MercadoPago',
  base_externa: 'Consulta automática a base oficial',
  comprador:    'Carga del comprador via portal MercadoProp',
  vendedor:     'Carga del vendedor via portal MercadoProp',
  banco:        'Documentación remitida por la entidad financiera',
  gestoria:     'Trámite gestionado por la gestoría asignada',
  escribania:   'Acto registrado por la escribanía interviniente',
};

// Próximo responsable sugerido cuando el item NO está completo.
const PROXIMO_RESPONSABLE_POR_ORIGIN = {
  plataforma:   'Plataforma',
  boveda:       'MercadoPago',
  base_externa: 'Gestoría',
  comprador:    'Comprador',
  vendedor:     'Vendedor',
  banco:        'Banco',
  gestoria:     'Gestoría',
  escribania:   'Escribanía',
};

// Construye el checklist completo de la operación, aplicando reglas de stage actual
// + overrides puntuales por id de item.
export const buildTimelineChecklist = (op) => {
  const currentStage = ESTADO_TO_STAGE[op.estado] ?? 0;
  const overrides = OP_OVERRIDES[op.id] || {};

  return STAGES_TEMPLATE.map((stage, stageIdx) => {
    const items = stage.items.map((it) => {
      const ovr = overrides[it.id] || {};

      // Status por defecto según posición en el flujo:
      //   - stages anteriores al actual → completo
      //   - stage actual → mezcla coherente (automatico para items boveda/base_externa
      //     "registrados" automáticamente; completo para apertura/registrados de Bóveda;
      //     pendiente para los del stage actual en adelante)
      //   - stages futuros → pendiente
      let status;
      if (stageIdx < currentStage) {
        status = 'completo';
      } else if (stageIdx === currentStage) {
        // Items de plataforma del primer stage o de Bóveda → completo / automático
        if (it.origin === 'plataforma' && stage.id === 'inicio') status = 'completo';
        else if (it.origin === 'boveda') status = 'automatico';
        else if (it.origin === 'base_externa' && stage.id !== 'due_diligence') status = 'automatico';
        else status = 'pendiente';
      } else {
        status = 'pendiente';
      }

      const merged = { ...it, status, ...ovr };
      merged.evidencia = EVIDENCIA_POR_ORIGIN[it.origin] || '—';
      merged.proximoResponsable = merged.status === 'completo'
        ? null
        : (PROXIMO_RESPONSABLE_POR_ORIGIN[it.origin] || it.responsible);
      if (!merged.note) merged.note = '';
      if (!merged.accion) merged.accion = '';
      return merged;
    });

    return { ...stage, items };
  });
};
