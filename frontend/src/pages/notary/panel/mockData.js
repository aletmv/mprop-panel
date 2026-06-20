// Mock data para el panel de escribanías MercadoProp
// Datos dummy. No usar términos de dominio sensible.

import {
  vaultIdFromOpId,
  DEFAULT_VAULT_LABEL,
  makeEconomicEvent,
  ECONOMIC_STATUS,
  buildBuyerEconomicItems,
  buildSellerEconomicItems,
  closingBalanceAmount,
} from './vault';

// Reexport del catálogo de status económico para vistas que lo necesiten
// sin tener que importar dos archivos.
export {
  ECONOMIC_STATUS,
  ECONOMIC_EVENT_CATALOG,
  EVENT_STATUS,
  buildBuyerEconomicItems,
  buildSellerEconomicItems,
  closingBalanceAmount,
} from './vault';

// Helper interno: arma la Bóveda completa para un legajo mock.
// price → calcula y siembra buyerEconomicItems / sellerEconomicItems.
// firstHome → exención de sellos (opcional, default false).
const seedVault = (opId, economicStatus, eventTemplates, { price, firstHome = false } = {}) => {
  const vaultId = vaultIdFromOpId(opId);
  const events = eventTemplates.map((t, idx) =>
    makeEconomicEvent({
      id: `${opId}-ev-${idx + 1}`,
      paymentId: opId,
      vaultId,
      ...t,
    }),
  );
  return {
    vaultId,
    vaultLabel: DEFAULT_VAULT_LABEL,
    economicStatus,
    economicEvents: events,
    buyerEconomicItems: buildBuyerEconomicItems(price, firstHome),
    sellerEconomicItems: buildSellerEconomicItems(price, firstHome),
    ...(LINEA_PASES[opId] || {}),
  };
};

// Línea de pases mock por operación: historia de traspasos de responsabilidad
// (último pase activo marcado con `current: true`) + próximo paso a destrabar.
// Vocabulario consistente con el modelo Bóveda — sin "comprobante", "transfirió", etc.
const LINEA_PASES = {
  'MP-673033': {
    lineaDePases: [
      { actor: 'comprador',  accion: 'Identidad verificada',                 fecha: '04/06', hora: '09:30' },
      { actor: 'escribania', accion: 'Revisó documentación inicial',         fecha: '09/06', hora: '16:20' },
      { actor: 'gestoria',   accion: 'Esperando certificado de dominio',     desde: 'hace 3 días', current: true },
    ],
    proximoPaso: {
      descripcion: 'Recibir certificado de dominio vigente',
      responsable: 'gestoria',
      vence: '24/06',
      impacto: 'Firma en riesgo si no se resuelve antes del 24/06.',
    },
  },
  'MP-328552': {
    lineaDePases: [
      { actor: 'comprador',  accion: 'Acreditó la seña en Bóveda',           fecha: '28/05', hora: '10:00' },
      { actor: 'gestoria',   accion: 'Verificación dominial completa',       fecha: '18/06', hora: '14:10' },
      { actor: 'escribania', accion: 'Coordinando firma con las partes',     desde: 'desde ayer', current: true },
    ],
    proximoPaso: {
      descripcion: 'Confirmar sala y horario de firma',
      responsable: 'escribania',
      vence: '24/06',
      impacto: 'Firma agendada en 2 días — no debe demorarse.',
    },
  },
  'MP-472736': {
    lineaDePases: [
      { actor: 'comprador',  accion: 'Identidad verificada',                       fecha: '12/06', hora: '10:11' },
      { actor: 'escribania', accion: 'Solicitó verificación biométrica al vendedor', fecha: '13/06', hora: '09:30' },
      { actor: 'vendedor',   accion: 'Pendiente validación biométrica',            desde: 'hace 8 días', current: true },
    ],
    proximoPaso: {
      descripcion: 'Completar validación biométrica del vendedor',
      responsable: 'vendedor',
      vence: '30/06',
      impacto: 'Sin identidad verificada del vendedor no se puede avanzar.',
    },
  },
  'MP-780337': {
    lineaDePases: [
      { actor: 'comprador',  accion: 'Acreditó la reserva en Bóveda',        fecha: '22/06', hora: '10:09' },
      { actor: 'escribania', accion: 'Solicitó documentación inicial',       fecha: '23/06', hora: '11:00' },
      { actor: 'comprador',  accion: 'Pendiente carga de DNI',               desde: 'hace 5 días', current: true },
    ],
    proximoPaso: {
      descripcion: 'Subir DNI y constancia de domicilio',
      responsable: 'comprador',
      vence: '06/07',
      impacto: 'Bloquea apertura formal del legajo.',
    },
  },
  'MP-722069': {
    lineaDePases: [
      { actor: 'comprador',  accion: 'Acreditó la reserva en Bóveda',        fecha: '25/06', hora: '13:08' },
      { actor: 'escribania', accion: 'Inició apertura del legajo',           fecha: '26/06', hora: '10:00' },
      { actor: 'comprador',  accion: 'Pendiente validación biométrica',      desde: 'desde ayer', current: true },
    ],
    proximoPaso: {
      descripcion: 'Completar validación biométrica del comprador',
      responsable: 'comprador',
      vence: '05/07',
      impacto: 'Validación es prerrequisito para habilitar la seña.',
    },
  },
  'MP-662480': {
    lineaDePases: [
      { actor: 'comprador',  accion: 'Identidad y pago acreditados',         fecha: '28/04', hora: '10:07' },
      { actor: 'escribania', accion: 'Firma de escritura ejecutada',         fecha: '14/06', hora: '16:00' },
      { actor: 'tercero',    accion: 'Esperando turno del Registro de la Propiedad', desde: 'hace 4 días', current: true },
    ],
    proximoPaso: {
      descripcion: 'Inscripción registral de la escritura',
      responsable: 'tercero',
      vence: '25/06',
      impacto: 'Hasta inscribir no se entrega título inscripto al comprador.',
    },
  },
};

export const escribania = {
  nombre: 'Esc. María Inés Lagos',
  registro: 'Registro 1428 - CABA',
  iniciales: 'ML',
};

export const kpis = [
  { id: 'activos', label: 'Legajos activos', value: 47, delta: '+8', trend: 'up', icon: 'folder' },
  { id: 'firma', label: 'Próximas firmas (7d)', value: 12, delta: '+3', trend: 'up', icon: 'pen' },
  { id: 'alertas', label: 'Alertas críticas', value: 4, delta: '-2', trend: 'down', icon: 'alert' },
  { id: 'sla', label: 'SLA promedio', value: '14d', delta: '-1.2d', trend: 'down', icon: 'clock' },
];

export const operaciones = [
  {
    id: 'MP-673033',
    direccion: 'Av. Santa Fe 1234, 4° B',
    barrio: 'Recoleta, CABA',
    tipo: 'Departamento PH',
    precio: 130000,
    moneda: 'USD',
    uc: 12, uf: '4B',
    estado: 'observado',
    progreso: 60,
    pasoActual: 'Análisis',
    tareaEnCurso: 'Esperar certificado',
    tareaEnCursoFull: 'Esperar nuevo certificado de dominio antes de la firma',
    firma: '25/06/2025',
    diasFirma: 3,
    bloqueoActor: 'gestoria',
    bloqueoMotivo: 'Tramita nuevo certificado de dominio',
    vendedor: { nombre: 'Roberto Méndez', dni: '14.235.890', verificado: true, avatar: 'RM' },
    comprador: { nombre: 'Laura Giménez', dni: '32.451.220', verificado: true, avatar: 'LG' },
    riesgo: 'alto',
    matricula: 'FR 12-3456',
    partida: '1234567',
    catastro: 'Circ. 18 · Sec. 23 · Manz. 45 · Parc. 12',
    ...seedVault('MP-673033', 'sena_pendiente_habilitacion', [
      { type: 'vault_created',                    status: 'confirmado', occurredAt: '2025-06-04T10:00:00-03:00' },
      { type: 'reservation_accredited',           status: 'validado',   amount: 1300,  occurredAt: '2025-06-04T10:12:00-03:00' },
      { type: 'notary_assigned',                  status: 'confirmado', occurredAt: '2025-06-04T16:30:00-03:00' },
      { type: 'down_payment_pending_enablement',  status: 'pendiente',  amount: 5200,  occurredAt: '2025-06-11T09:13:00-03:00' },
    ], { price: 130000 }),
  },
  {
    id: 'MP-328552',
    direccion: 'Av. Cabildo 2890, 7° A',
    barrio: 'Belgrano, CABA',
    tipo: 'Departamento',
    precio: 215000,
    moneda: 'USD',
    uc: 18, uf: '7A',
    estado: 'en-firma',
    progreso: 95,
    pasoActual: 'Firma',
    tareaEnCurso: 'Coordinar firma',
    tareaEnCursoFull: 'Coordinar firma del 24/06 con vendedor y comprador',
    firma: '24/06/2025',
    diasFirma: 2,
    bloqueoActor: 'escribania',
    bloqueoMotivo: 'Confirma sala y horario con las partes',
    vendedor: { nombre: 'Marina Ferreyra', dni: '20.118.337', verificado: true, avatar: 'MF' },
    comprador: { nombre: 'Diego Rosales', dni: '28.940.115', verificado: true, avatar: 'DR' },
    riesgo: 'bajo',
    matricula: 'FR 14-8821',
    partida: '8821934',
    catastro: 'Circ. 16 · Sec. 18 · Manz. 22 · Parc. 04',
    ...seedVault('MP-328552', 'sena_habilitada', [
      { type: 'vault_created',                  status: 'confirmado', occurredAt: '2025-05-20T11:00:00-03:00' },
      { type: 'reservation_accredited',         status: 'validado',   amount: 2150,   occurredAt: '2025-05-20T11:14:00-03:00' },
      { type: 'notary_assigned',                status: 'confirmado', occurredAt: '2025-05-21T09:00:00-03:00' },
      { type: 'down_payment_enabled',           status: 'habilitado',                 occurredAt: '2025-05-27T15:00:00-03:00' },
      { type: 'down_payment_accredited',        status: 'validado',   amount: 8600,   occurredAt: '2025-05-28T10:00:00-03:00' },
      { type: 'buyer_taxes_scheduled',          status: 'programado',                 occurredAt: '2025-06-15T12:00:00-03:00' },
      { type: 'seller_taxes_scheduled',         status: 'programado',                 occurredAt: '2025-06-15T12:00:00-03:00' },
      { type: 'fees_scheduled',                 status: 'programado',                 occurredAt: '2025-06-15T12:00:00-03:00' },
      { type: 'closing_balance_scheduled',      status: 'programado', amount: 204250, occurredAt: '2025-06-22T18:00:00-03:00' },
    ], { price: 215000 }),
  },
  {
    id: 'MP-472736',
    direccion: 'Pueyrredón 1456, 3° C',
    barrio: 'Balvanera, CABA',
    tipo: 'Departamento',
    precio: 95000,
    moneda: 'USD',
    uc: 8, uf: '3C',
    estado: 'analisis',
    progreso: 45,
    pasoActual: 'Análisis',
    tareaEnCurso: 'Verificación dominial',
    tareaEnCursoFull: 'Verificación dominial e inhibición del vendedor',
    firma: '02/07/2025',
    diasFirma: 10,
    bloqueoActor: 'vendedor',
    bloqueoMotivo: 'Debe completar validación biométrica',
    vendedor: { nombre: 'Carlos Ibáñez', dni: '11.450.220', verificado: false, avatar: 'CI' },
    comprador: { nombre: 'Sofía Maldonado', dni: '35.220.118', verificado: true, avatar: 'SM' },
    riesgo: 'medio',
    matricula: 'FR 09-2210',
    partida: '2210556',
    catastro: 'Circ. 09 · Sec. 11 · Manz. 30 · Parc. 18',
    ...seedVault('MP-472736', 'sena_pendiente_habilitacion', [
      { type: 'vault_created',                   status: 'confirmado', occurredAt: '2025-06-12T10:00:00-03:00' },
      { type: 'reservation_accredited',          status: 'validado',   amount: 1000,  occurredAt: '2025-06-12T10:11:00-03:00' },
      { type: 'notary_assigned',                 status: 'confirmado', occurredAt: '2025-06-13T09:30:00-03:00' },
      { type: 'down_payment_pending_enablement', status: 'pendiente',  amount: 3800,  occurredAt: '2025-06-20T11:00:00-03:00' },
    ], { price: 95000 }),
  },
  {
    id: 'MP-780337',
    direccion: 'Tucumán 875, 2° B',
    barrio: 'San Nicolás, CABA',
    tipo: 'Oficina',
    precio: 178000,
    moneda: 'USD',
    uc: 14, uf: '2B',
    estado: 'documentos',
    progreso: 30,
    pasoActual: 'Documentos',
    tareaEnCurso: 'Cargar DNI',
    tareaEnCursoFull: 'Cargar DNI de las partes y libre deuda de expensas',
    firma: '15/07/2025',
    diasFirma: 23,
    bloqueoActor: 'comprador',
    bloqueoMotivo: 'Debe subir DNI y constancia de domicilio',
    vendedor: { nombre: 'Estudio Vega S.A.', dni: 'CUIT 30-71...', verificado: true, avatar: 'EV' },
    comprador: { nombre: 'Tomás Aguirre', dni: '30.118.005', verificado: false, avatar: 'TA' },
    riesgo: 'medio',
    matricula: 'FR 02-9981',
    partida: '9981230',
    catastro: 'Circ. 02 · Sec. 05 · Manz. 12 · Parc. 22',
    ...seedVault('MP-780337', 'reserva_acreditada', [
      { type: 'vault_created',           status: 'confirmado', occurredAt: '2025-06-22T10:00:00-03:00' },
      { type: 'reservation_accredited',  status: 'validado',   amount: 1780, occurredAt: '2025-06-22T10:09:00-03:00' },
      { type: 'notary_assigned',         status: 'confirmado', occurredAt: '2025-06-23T11:00:00-03:00' },
    ], { price: 178000 }),
  },
  {
    id: 'MP-722069',
    direccion: 'Honduras 5544',
    barrio: 'Palermo, CABA',
    tipo: 'Casa',
    precio: 320000,
    moneda: 'USD',
    uc: 0, uf: '—',
    estado: 'apertura',
    progreso: 15,
    pasoActual: 'Apertura',
    tareaEnCurso: 'Validar partes',
    tareaEnCursoFull: 'Validar partes y asignar gestoría al legajo',
    firma: '28/07/2025',
    diasFirma: 36,
    bloqueoActor: 'comprador',
    bloqueoMotivo: 'Falta validación biométrica del comprador',
    vendedor: { nombre: 'Inés Pérez', dni: '17.890.221', verificado: true, avatar: 'IP' },
    comprador: { nombre: 'Familia Moretti', dni: '—', verificado: false, avatar: 'FM' },
    riesgo: 'bajo',
    matricula: 'FR 17-4421',
    partida: '4421889',
    catastro: 'Circ. 17 · Sec. 28 · Manz. 03 · Parc. 09',
    ...seedVault('MP-722069', 'reserva_acreditada', [
      { type: 'vault_created',           status: 'confirmado', occurredAt: '2025-06-25T13:00:00-03:00' },
      { type: 'reservation_accredited',  status: 'validado',   amount: 3200, occurredAt: '2025-06-25T13:08:00-03:00' },
      { type: 'notary_assigned',         status: 'confirmado', occurredAt: '2025-06-26T10:00:00-03:00' },
    ], { price: 320000 }),
  },
  {
    id: 'MP-662480',
    direccion: 'Av. Corrientes 3400, 1° D',
    barrio: 'Almagro, CABA',
    tipo: 'Departamento',
    precio: 88000,
    moneda: 'USD',
    uc: 6, uf: '1D',
    estado: 'cerrado',
    progreso: 100,
    pasoActual: 'Cerrado',
    tareaEnCurso: 'Inscribir en Registro',
    tareaEnCursoFull: 'Inscribir la escritura en el Registro de la Propiedad',
    firma: '18/06/2025',
    diasFirma: -4,
    bloqueoActor: 'tercero',
    bloqueoMotivo: 'Esperando turno del Registro de la Propiedad',
    vendedor: { nombre: 'Juan Rodríguez', dni: '08.220.554', verificado: true, avatar: 'JR' },
    comprador: { nombre: 'Camila Torres', dni: '38.117.220', verificado: true, avatar: 'CT' },
    riesgo: 'bajo',
    matricula: 'FR 06-1192',
    partida: '1192337',
    catastro: 'Circ. 06 · Sec. 14 · Manz. 18 · Parc. 02',
    ...seedVault('MP-662480', 'sena_habilitada', [
      { type: 'vault_created',              status: 'confirmado', occurredAt: '2025-04-28T10:00:00-03:00' },
      { type: 'reservation_accredited',     status: 'validado',   amount: 880,   occurredAt: '2025-04-28T10:07:00-03:00' },
      { type: 'notary_assigned',            status: 'confirmado', occurredAt: '2025-04-29T11:00:00-03:00' },
      { type: 'down_payment_enabled',       status: 'habilitado',                occurredAt: '2025-05-08T12:00:00-03:00' },
      { type: 'down_payment_accredited',    status: 'validado',   amount: 3520,  occurredAt: '2025-05-09T10:30:00-03:00' },
      { type: 'buyer_taxes_scheduled',      status: 'programado',                occurredAt: '2025-06-10T11:00:00-03:00' },
      { type: 'seller_taxes_scheduled',     status: 'programado',                occurredAt: '2025-06-10T11:00:00-03:00' },
      { type: 'fees_scheduled',             status: 'programado',                occurredAt: '2025-06-10T11:00:00-03:00' },
      { type: 'closing_balance_scheduled',  status: 'programado', amount: 83600, occurredAt: '2025-06-17T18:00:00-03:00' },
    ], { price: 88000 }),
  },
];

export const pasos = ['Apertura', 'Documentos', 'Análisis', 'Pre-cierre', 'Firma'];

export const alertas = [
  {
    id: 1, operacionId: 'MP-673033',
    nivel: 'critica',
    titulo: 'Certificado de dominio vence antes de la firma',
    descripcion: 'El certificado de dominio vence 24/06 y la firma tentativa es 25/06.',
    vence: '24/06/2025', firmaTentativa: '25/06/2025',
    impacto: 'No apto para firma sin resolver',
    accion: 'Solicitar nuevo certificado de dominio o reprogramar firma antes del vencimiento.',
    responsable: 'Gestoría', prioridad: 'Alta',
  },
  {
    id: 2, operacionId: 'MP-673033',
    nivel: 'media',
    titulo: 'Falta certificación de inhibición del vendedor',
    descripcion: 'No se registró la solicitud de inhibición en los últimos 30 días.',
    accion: 'Iniciar trámite ante Registro de la Propiedad.',
    responsable: 'Gestoría', prioridad: 'Media',
  },
  {
    id: 3, operacionId: 'MP-673033',
    nivel: 'info',
    titulo: 'Seña pendiente de habilitación',
    descripcion: 'Seña acreditada en Bóveda. Habilitación requiere revisión notarial.',
    accion: 'Habilitar seña tras revisión notarial.',
    responsable: 'Esc. Lagos', prioridad: 'Baja',
  },
];

export const eventos = [
  { fecha: '23/06', hora: '10:31', tipo: 'documento', evento: 'Se recibió certificado de dominio', responsable: 'Gestoría', evidencia: 'archivo' },
  { fecha: '22/06', hora: '10:45', tipo: 'alerta', evento: 'Vencimiento previo a firma marcado por la gestoría', responsable: 'Gestoría', evidencia: 'alerta' },
  { fecha: '19/06', hora: '11:05', tipo: 'decision', evento: 'Esc. Lagos marcó título como "En estudio"', responsable: 'Esc. Lagos', evidencia: 'cambio' },
  { fecha: '11/06', hora: '09:13', tipo: 'boveda', evento: 'Seña pendiente de habilitación · USD 5.200 · Evento económico en Bóveda', responsable: 'MercadoPago', evidencia: 'evento Bóveda' },
  { fecha: '09/06', hora: '11:17', tipo: 'gestion', evento: 'Comprador solicitó libre deuda de expensas', responsable: 'Comprador', evidencia: 'solicitud' },
  { fecha: '06/06', hora: '15:48', tipo: 'documento', evento: 'Vendedor cargó título de propiedad escaneado', responsable: 'Vendedor', evidencia: 'archivo' },
  { fecha: '04/06', hora: '10:12', tipo: 'boveda', evento: 'Pago registrado · Reserva USD 1.300 · Trazado por MercadoPago', responsable: 'MercadoPago', evidencia: 'evento Bóveda' },
  { fecha: '04/06', hora: '10:00', tipo: 'apertura', evento: 'Apertura del legajo MP-673033', responsable: 'Esc. Lagos', evidencia: 'sistema' },
];

export const documentos = [
  { id: 1, nombre: 'Título de propiedad', estado: 'revisado', responsable: 'Vendedor', fecha: '06/06' },
  { id: 2, nombre: 'Certificado de dominio', estado: 'alerta', responsable: 'Gestoría', fecha: '23/06', nota: 'Vence 24/06' },
  { id: 3, nombre: 'Certificado de inhibición', estado: 'pendiente', responsable: 'Gestoría', fecha: '—' },
  { id: 4, nombre: 'Libre deuda expensas', estado: 'revisado', responsable: 'Comprador', fecha: '14/06' },
  { id: 5, nombre: 'Libre deuda ABL', estado: 'revisado', responsable: 'Comprador', fecha: '12/06' },
  { id: 6, nombre: 'Trazabilidad de seña en Bóveda', estado: 'revisado', responsable: 'MercadoPago', fecha: '11/06' },
  { id: 7, nombre: 'Boleto de compraventa', estado: 'revisado', responsable: 'Esc. Lagos', fecha: '10/06' },
  { id: 8, nombre: 'DNI partes', estado: 'revisado', responsable: 'Esc. Lagos', fecha: '04/06' },
];

export const proximasFirmas = [
  { fecha: '24/06', hora: '11:00', operacion: 'MP-328552', direccion: 'Av. Cabildo 2890, 7° A', escribano: 'Esc. Lagos', estado: 'confirmada' },
  { fecha: '25/06', hora: '15:30', operacion: 'MP-673033', direccion: 'Av. Santa Fe 1234, 4° B', escribano: 'Esc. Lagos', estado: 'observada' },
  { fecha: '27/06', hora: '10:00', operacion: 'MP-959314', direccion: 'Av. Las Heras 2110, 8° C', escribano: 'Esc. Lagos', estado: 'confirmada' },
  { fecha: '01/07', hora: '12:00', operacion: 'MP-780337', direccion: 'Tucumán 875, 2° B', escribano: 'Esc. Lagos', estado: 'tentativa' },
  { fecha: '02/07', hora: '16:00', operacion: 'MP-472736', direccion: 'Pueyrredón 1456, 3° C', escribano: 'Esc. Lagos', estado: 'tentativa' },
];

export const cargaMensual = [
  { mes: 'Ene', firmas: 8, aperturas: 12 },
  { mes: 'Feb', firmas: 11, aperturas: 14 },
  { mes: 'Mar', firmas: 9, aperturas: 16 },
  { mes: 'Abr', firmas: 13, aperturas: 18 },
  { mes: 'May', firmas: 17, aperturas: 19 },
  { mes: 'Jun', firmas: 12, aperturas: 22 },
];

export const estadoLabel = {
  apertura: { label: 'Apertura', color: 'info' },
  documentos: { label: 'Documentos', color: 'info' },
  analisis: { label: 'En análisis', color: 'warning' },
  observado: { label: 'Observado', color: 'destructive' },
  'en-firma': { label: 'En firma', color: 'success' },
  cerrado: { label: 'Cerrado', color: 'muted' },
};

export const riesgoLabel = {
  bajo: { label: 'Riesgo bajo', color: 'success' },
  medio: { label: 'Riesgo medio', color: 'warning' },
  alto: { label: 'Riesgo alto', color: 'destructive' },
};

// Próximo responsable de desbloqueo: ¿quién tiene la pelota?
// Esto suele ser la causa principal de demoras en operaciones inmobiliarias.
// Todos los badges usan tono neutro (slate) para no competir con estado/alertas.
export const bloqueoLabel = {
  comprador:  { label: 'Acción: Comprador',  short: 'Comprador'  },
  vendedor:   { label: 'Acción: Vendedor',   short: 'Vendedor'   },
  escribania: { label: 'Acción: Escribanía', short: 'Escribanía' },
  gestoria:   { label: 'Acción: Gestoría',   short: 'Gestoría'   },
  tercero:    { label: 'Acción: Tercero',    short: 'Tercero'    },
  bloqueado:  { label: 'Bloqueado',          short: 'Bloqueado'  },
};
