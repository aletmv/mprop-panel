// timelineChecklist.js — Mock del checklist de hitos de la operación.
//
// Estructura de 5 hitos del proceso notarial inmobiliario MercadoProp:
//   1. Apertura
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
    label: 'Apertura',
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
  'MP-673033': {
    cert_dominio: { status: 'observado', note: 'Vence 24/06 — vencimiento previo a la firma del 25/06.', accion: 'Solicitar nuevo certificado a la gestoría.' },
    cert_inhibicion: { status: 'pendiente', note: 'No se registró pedido en los últimos 30 días.' },
  },
  'MP-328552': {
    apto_firma: { status: 'pendiente', note: 'Pendiente confirmación de sala con las partes.' },
    fecha_lugar: { status: 'pendiente', note: 'Sala asignada, falta confirmar horario con vendedor.' },
  },
  'MP-472736': {
    dni_partes: { status: 'observado', note: 'Vendedor pendiente de validación biométrica.', accion: 'Reenviar invitación de validación al vendedor.' },
    estado_civil: { status: 'pendiente' },
  },
  'MP-780337': {
    dni_partes: { status: 'observado', note: 'Comprador no subió DNI ni constancia de domicilio.', accion: 'Recordatorio automático al comprador.' },
    libre_deuda: { status: 'pendiente' },
  },
  'MP-722069': {
    dni_partes: { status: 'pendiente', note: 'Comprador no completó validación biométrica.' },
  },
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

// Evidencia mock por item: cada item devuelve un array de rows {type, label, status, source, date?, fileName?, result?, note?}.
// Para los items sin builder explícito, se construye una evidencia genérica derivada del origin.
const EVIDENCE_BUILDERS = {
  // ─── Inicio ────────────────────────────────────────────────────────────
  apertura: (op) => [
    { type: 'accion', label: `Legajo ${op.id} creado`, status: 'disponible', source: 'plataforma', date: '04/06' },
  ],
  carga_inmueble: (op) => [
    { type: 'declaracion', label: `Dirección · ${op.direccion}`, status: 'disponible', source: 'plataforma' },
    { type: 'declaracion', label: `Tipo · ${op.tipo}`, status: 'disponible', source: 'plataforma' },
  ],
  carga_partes: (op) => [
    { type: 'declaracion', label: `Comprador · ${op.comprador?.nombre || '—'}`, status: 'disponible', source: 'comprador' },
    { type: 'declaracion', label: `Vendedor · ${op.vendedor?.nombre || '—'}`, status: 'disponible', source: 'vendedor' },
  ],
  precio: (op) => [
    { type: 'declaracion', label: `Precio · USD ${(op.precio || 0).toLocaleString('es-AR')}`, status: 'disponible', source: 'plataforma' },
    { type: 'declaracion', label: 'Moneda · USD', status: 'disponible', source: 'plataforma' },
  ],
  reserva: () => [
    { type: 'evento_boveda', label: 'Reserva acreditada en Bóveda', status: 'validado', source: 'boveda', result: 'Pago registrado' },
  ],
  responsables: () => [
    { type: 'accion', label: 'Escribanía asignada · Esc. M. I. Lagos', status: 'disponible', source: 'plataforma' },
    { type: 'accion', label: 'Gestoría asignada al legajo', status: 'disponible', source: 'plataforma' },
  ],
  intervencion: (op, s) => [
    { type: 'accion', label: 'Aceptación de intervención registrada', status: s === 'completo' ? 'disponible' : 'pendiente', source: 'escribania' },
  ],

  // ─── Expediente ────────────────────────────────────────────────────────
  dni_partes: (op) => {
    const bV = op.comprador?.verificado;
    const sV = op.vendedor?.verificado;
    return [
      { type: 'archivo',      label: 'DNI comprador · frente',                status: bV ? 'disponible' : 'pendiente', source: 'comprador', fileName: 'dni_comp_frente.jpg' },
      { type: 'archivo',      label: 'DNI comprador · dorso',                 status: bV ? 'disponible' : 'pendiente', source: 'comprador', fileName: 'dni_comp_dorso.jpg' },
      { type: 'archivo',      label: 'DNI vendedor · frente',                 status: sV ? 'disponible' : 'observado', source: 'vendedor',  fileName: 'dni_vend_frente.jpg' },
      { type: 'archivo',      label: 'DNI vendedor · dorso',                  status: sV ? 'disponible' : 'observado', source: 'vendedor',  fileName: 'dni_vend_dorso.jpg' },
      { type: 'base_externa', label: 'CUIT/CUIL validado · Padrón AFIP',       status: 'validado',                     source: 'base_externa', result: 'Coincide' },
      { type: 'base_externa', label: 'Validación biométrica · comprador',     status: bV ? 'validado' : 'pendiente',   source: 'plataforma',  result: bV ? 'OK · score 0.94' : null },
      { type: 'base_externa', label: 'Validación biométrica · vendedor',      status: sV ? 'validado' : 'pendiente',   source: 'plataforma',  result: sV ? 'OK · score 0.91' : null },
    ];
  },
  estado_civil: () => [
    { type: 'declaracion', label: 'Estado civil comprador', status: 'pendiente',  source: 'comprador' },
    { type: 'declaracion', label: 'Estado civil vendedor',  status: 'disponible', source: 'vendedor'  },
  ],
  poderes: () => [
    { type: 'declaracion', label: 'No se invocan poderes ni representaciones', status: 'no_aplica', source: 'escribania' },
  ],
  titulo: (op, s) => [
    { type: 'archivo', label: 'Título de propiedad escaneado', status: s === 'completo' ? 'disponible' : 'pendiente', source: 'vendedor', fileName: 'titulo_propiedad.pdf', date: '06/06' },
  ],
  rph: (op) => {
    const aplica = /Departamento|PH|Duplex/i.test(op.tipo || '');
    return aplica
      ? [{ type: 'archivo', label: 'Reglamento de Propiedad Horizontal', status: 'disponible', source: 'vendedor', fileName: 'reglamento_PH.pdf' }]
      : [{ type: 'declaracion', label: 'No aplica · inmueble no sometido a PH', status: 'no_aplica', source: 'vendedor' }];
  },
  libre_deuda: (op, s) => [
    { type: 'archivo', label: 'Libre deuda de expensas', status: s === 'completo' ? 'disponible' : 'pendiente', source: 'vendedor', fileName: 'libre_deuda_expensas.pdf' },
  ],
  deudas_fiscales: () => [
    { type: 'base_externa', label: 'ABL · CABA',         status: 'validado', source: 'base_externa', result: 'Al día' },
    { type: 'base_externa', label: 'AGIP · sellos/tasas', status: 'validado', source: 'base_externa', result: 'Sin deuda' },
    { type: 'base_externa', label: 'Servicios (luz, gas, agua)', status: 'pendiente', source: 'base_externa' },
  ],
  catastro: () => [
    { type: 'base_externa', label: 'Plancheta catastral · CABA', status: 'validado', source: 'base_externa', result: 'Coincide con título' },
    { type: 'base_externa', label: 'Nomenclatura', status: 'validado', source: 'base_externa', result: 'Circ. 18 · Sec. 23 · Manz. 45 · Parc. 12' },
  ],
  credito: () => [
    { type: 'declaracion', label: 'Operación sin crédito hipotecario', status: 'no_aplica', source: 'banco' },
  ],

  // ─── Due diligence ─────────────────────────────────────────────────────
  analisis_titulo: (op, s) => [
    { type: 'accion', label: 'Estudio del título por la escribanía', status: s === 'completo' ? 'validado' : 'pendiente', source: 'escribania' },
  ],
  titularidad: () => [
    { type: 'base_externa', label: 'Titular registral coincide con vendedor', status: 'validado', source: 'base_externa', result: 'Folio FR 12-3456' },
  ],
  cert_dominio: (op, s) => [
    { type: 'archivo',      label: 'Certificado de dominio anterior',                  status: 'disponible',                source: 'gestoria',     fileName: 'cert_dominio_03_06.pdf', date: '03/06' },
    { type: 'base_externa', label: 'Vigencia · Registro de la Propiedad',              status: s === 'observado' ? 'observado' : 'validado', source: 'base_externa', result: 'Vence 24/06' },
    { type: 'accion',       label: 'Solicitud de nuevo certificado · Gestoría',        status: 'pendiente',                 source: 'gestoria' },
  ],
  cert_inhibicion: (op, s) => [
    { type: 'archivo', label: 'Certificado de inhibición vendedor', status: s === 'completo' ? 'disponible' : 'pendiente', source: 'gestoria', fileName: 'cert_inhibicion_vend.pdf' },
  ],
  gravamenes: () => [
    { type: 'base_externa', label: 'Consulta de gravámenes · Registro de la Propiedad', status: 'validado', source: 'base_externa', result: 'Sin gravámenes' },
    { type: 'base_externa', label: 'Embargos vigentes',                                  status: 'validado', source: 'base_externa', result: 'Ninguno' },
    { type: 'base_externa', label: 'Hipotecas previas',                                  status: 'validado', source: 'base_externa', result: 'Canceladas' },
  ],
  personeria: () => [
    { type: 'accion', label: 'Revisión de personería y capacidad de obrar', status: 'pendiente', source: 'escribania' },
  ],
  catastral: () => [
    { type: 'base_externa', label: 'Plancheta catastral verificada · CABA', status: 'validado', source: 'base_externa', result: 'Coincide' },
  ],
  deudas: () => [
    { type: 'base_externa', label: 'Resumen consolidado de deudas', status: 'validado', source: 'base_externa', result: 'Sin deuda' },
  ],
  uif: (op) => {
    const aplica = (op.precio || 0) >= 250000;
    return aplica
      ? [{ type: 'declaracion', label: 'Declaración UIF · origen de fondos', status: 'pendiente', source: 'escribania' }]
      : [{ type: 'declaracion', label: 'No alcanza umbral UIF', status: 'no_aplica', source: 'escribania' }];
  },

  // ─── Pre-cierre ────────────────────────────────────────────────────────
  doc_completa: (op, s) => [
    { type: 'accion', label: 'Checklist documental cerrado', status: s === 'completo' ? 'validado' : 'pendiente', source: 'escribania' },
  ],
  subsanaciones: (op, s) => [
    { type: 'accion', label: 'Observaciones resueltas', status: s === 'completo' ? 'validado' : 'pendiente', source: 'escribania' },
  ],
  liquidacion: () => [
    { type: 'evento_boveda', label: 'Liquidación comprador',  status: 'disponible', source: 'boveda', result: 'Calculada · ver Bóveda' },
    { type: 'evento_boveda', label: 'Liquidación vendedor',   status: 'disponible', source: 'boveda', result: 'Calculada · ver Bóveda' },
    { type: 'evento_boveda', label: 'Honorarios y gastos',    status: 'disponible', source: 'boveda', result: 'Programados' },
  ],
  pagos_registrados: () => [
    { type: 'evento_boveda', label: 'Reserva 1%', status: 'validado',  source: 'boveda', result: 'Pago registrado' },
    { type: 'evento_boveda', label: 'Seña 4%',   status: 'pendiente', source: 'boveda', result: 'Pendiente de habilitación' },
  ],
  proyecto: (op, s) => [
    { type: 'archivo', label: 'Proyecto de escritura', status: s === 'completo' ? 'disponible' : 'pendiente', source: 'escribania', fileName: 'proyecto_escritura.pdf' },
  ],
  coordinacion: () => [
    { type: 'accion', label: 'Coordinación con partes, inmobiliaria y gestoría', status: 'pendiente', source: 'escribania' },
  ],
  fecha_lugar: (op, s) => [
    { type: 'accion', label: 'Confirmación de fecha y lugar de firma', status: s === 'completo' ? 'validado' : 'pendiente', source: 'escribania', result: s === 'completo' ? op.firma : null },
  ],
  apto_firma: (op, s) => [
    { type: 'accion', label: 'Marcado "Apto para firma"', status: s === 'completo' ? 'validado' : 'pendiente', source: 'escribania' },
  ],

  // ─── Cierre y post-cierre ──────────────────────────────────────────────
  firma: (op, s) => [
    { type: 'accion', label: 'Firma de escritura ejecutada', status: s === 'completo' ? 'validado' : 'pendiente', source: 'escribania', date: s === 'completo' ? op.firma : null },
  ],
  control_pagos: () => [
    { type: 'evento_boveda', label: 'Control final de movimientos en Bóveda', status: 'validado', source: 'boveda' },
  ],
  posesion: () => [
    { type: 'accion', label: 'Entrega de posesión o llaves', status: 'pendiente', source: 'vendedor' },
  ],
  testimonio: () => [
    { type: 'archivo', label: 'Testimonio de la escritura', status: 'pendiente', source: 'escribania' },
  ],
  presentacion: () => [
    { type: 'accion', label: 'Presentación registral', status: 'pendiente', source: 'escribania' },
  ],
  seguimiento: () => [
    { type: 'accion', label: 'Seguimiento de inscripción', status: 'pendiente', source: 'gestoria' },
  ],
  subsanacion_reg: () => [
    { type: 'declaracion', label: 'Sin observaciones registrales registradas', status: 'no_aplica', source: 'gestoria' },
  ],
  entrega_doc: () => [
    { type: 'accion', label: 'Entrega de documentación final', status: 'pendiente', source: 'escribania' },
  ],
  archivo: () => [
    { type: 'accion', label: 'Archivo y cierre del legajo', status: 'pendiente', source: 'escribania' },
  ],
};

// Construye el checklist completo de la operación, aplicando reglas de stage actual
// + overrides puntuales por id de item.
export const buildTimelineChecklist = (op) => {
  const currentStage = ESTADO_TO_STAGE[op.estado] ?? 0;
  const overrides = OP_OVERRIDES[op.id] || {};

  return STAGES_TEMPLATE.map((stage, stageIdx) => {
    const items = stage.items.map((it) => {
      const ovr = overrides[it.id] || {};

      let status;
      if (stageIdx < currentStage) {
        status = 'completo';
      } else if (stageIdx === currentStage) {
        if (it.origin === 'plataforma' && stage.id === 'inicio') status = 'completo';
        else if (it.origin === 'boveda') status = 'automatico';
        else if (it.origin === 'base_externa' && stage.id !== 'due_diligence') status = 'automatico';
        else status = 'pendiente';
      } else {
        status = 'pendiente';
      }

      const merged = { ...it, status, ...ovr };

      // Evidencia mock: si hay builder definido para este item, ejecutarlo.
      // Si no, devolver una evidencia genérica derivada del origin.
      const builder = EVIDENCE_BUILDERS[it.id];
      let evidence = builder ? builder(op, merged.status) : [{
        type: 'declaracion',
        label: 'Sin evidencias adicionales',
        status: merged.status === 'completo' ? 'disponible' : 'pendiente',
        source: it.origin,
      }];

      // Si todas las evidencias son no_aplica, el item se considera no_aplica.
      const allNoAplica = evidence.length > 0 && evidence.every((e) => e.status === 'no_aplica');
      if (allNoAplica) merged.status = 'no_aplica';

      merged.evidence = evidence;
      merged.proximoResponsable = merged.status === 'completo' || merged.status === 'no_aplica'
        ? null
        : (PROXIMO_RESPONSABLE_POR_ORIGIN[it.origin] || it.responsible);
      if (!merged.note) merged.note = '';
      if (!merged.accion) merged.accion = '';
      return merged;
    });

    return { ...stage, items };
  });
};
