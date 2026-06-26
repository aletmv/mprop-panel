// Checklist documental DEMO para compraventa inmobiliaria (Fase E). Helper LOCAL
// del flujo documental — NO es un mock global ni un motor condicional completo.
// Solo un set base, agrupado por categoría, para que el selector del drawer y la
// matrix de Documentos tengan un checklist útil. Pensado para crecer (condicional,
// no_aplica, vencido) sin rediseñar la UI.
//
// `mock` (opcional) mapea un requisito a un documento derivado existente
// (legajoDocsEventos.DOC_TEMPLATE) para sembrar su estado/realismo en la demo.

export const DOC_CATEGORIES = [
  { id: 'partes', label: 'A. Partes' },
  { id: 'inmueble', label: 'B. Inmueble' },
  { id: 'registral', label: 'C. Registral' },
  { id: 'fiscal', label: 'D. Fiscal y deudas' },
  { id: 'operacion', label: 'E. Operación' },
  { id: 'banco', label: 'F. Banco / hipoteca' },
  { id: 'uif', label: 'G. UIF / compliance' },
  { id: 'escritura', label: 'H. Escritura / firma' },
];

export const DOC_CATEGORY_LABEL = DOC_CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c.label;
  return acc;
}, { otros: 'Otros documentos' });

// `aplicableDemo: true` = visible en esta etapa (matrix + drawer). El resto queda
// como preparación futura (no visible) — el modelo ya los contempla pero se
// filtran de la UI para mantener un checklist demo manejable.
export const DEMO_DOCUMENT_REQUIREMENTS = [
  // A. Partes
  { id: 'dni_comprador', nombre: 'DNI comprador', categoria: 'partes', mock: 'DNI partes', aplicableDemo: true },
  { id: 'dni_vendedor', nombre: 'DNI vendedor', categoria: 'partes', mock: 'DNI partes', aplicableDemo: true },
  { id: 'cuit_comprador', nombre: 'CUIT/CUIL comprador', categoria: 'partes', aplicableDemo: true },
  { id: 'cuit_vendedor', nombre: 'CUIT/CUIL vendedor', categoria: 'partes', aplicableDemo: true },
  { id: 'estado_civil', nombre: 'Estado civil / régimen patrimonial', categoria: 'partes' },
  { id: 'poder', nombre: 'Poder / representación (si aplica)', categoria: 'partes', aplicableDemo: true },

  // B. Inmueble
  { id: 'titulo', nombre: 'Título de propiedad', categoria: 'inmueble', mock: 'Título de propiedad', aplicableDemo: true },
  { id: 'reglamento_ph', nombre: 'Reglamento de copropiedad PH (si aplica)', categoria: 'inmueble', aplicableDemo: true },
  { id: 'partida', nombre: 'Partida / nomenclatura catastral', categoria: 'inmueble', aplicableDemo: true },
  { id: 'plano', nombre: 'Plano / cédula catastral (si aplica)', categoria: 'inmueble' },

  // C. Registral
  { id: 'cert_dominio', nombre: 'Certificado de dominio', categoria: 'registral', mock: 'Certificado de dominio', aplicableDemo: true },
  { id: 'cert_inhibiciones', nombre: 'Certificado de inhibiciones', categoria: 'registral', mock: 'Certificado de inhibición', aplicableDemo: true },
  { id: 'gravamenes', nombre: 'Informe de gravámenes / hipotecas / embargos', categoria: 'registral', aplicableDemo: true },

  // D. Fiscal y deudas
  { id: 'abl', nombre: 'ABL / impuesto inmobiliario', categoria: 'fiscal', mock: 'Libre deuda ABL', aplicableDemo: true },
  { id: 'libre_deuda', nombre: 'Libre deuda municipal / provincial', categoria: 'fiscal' },
  { id: 'expensas', nombre: 'Expensas / certificado de administrador (si aplica)', categoria: 'fiscal', mock: 'Libre deuda expensas', aplicableDemo: true },
  { id: 'servicios', nombre: 'Servicios / deudas relevantes', categoria: 'fiscal' },

  // E. Operación
  { id: 'reserva', nombre: 'Reserva / seña', categoria: 'operacion', mock: 'Trazabilidad de seña en Bóveda', aplicableDemo: true },
  { id: 'boleto', nombre: 'Boleto de compraventa (si existe)', categoria: 'operacion', mock: 'Boleto de compraventa', aplicableDemo: true },
  { id: 'recibos', nombre: 'Recibos de pagos a cuenta', categoria: 'operacion' },
  { id: 'forma_pago', nombre: 'Acuerdo de forma de pago', categoria: 'operacion', aplicableDemo: true },

  // F. Banco / hipoteca (si aplica)
  { id: 'aprob_credito', nombre: 'Aprobación crediticia', categoria: 'banco', aplicableDemo: true },
  { id: 'tasacion', nombre: 'Tasación bancaria', categoria: 'banco', aplicableDemo: true },
  { id: 'instrucciones_banco', nombre: 'Instrucciones del banco', categoria: 'banco', aplicableDemo: true },
  { id: 'minuta_hipotecaria', nombre: 'Minuta hipotecaria', categoria: 'banco' },

  // G. UIF / compliance
  { id: 'origen_fondos', nombre: 'Declaración de origen de fondos', categoria: 'uif', aplicableDemo: true },
  { id: 'respaldo_fondos', nombre: 'Documentación respaldatoria de fondos', categoria: 'uif', aplicableDemo: true },
  { id: 'ddjj_pep', nombre: 'DDJJ PEP (si corresponde)', categoria: 'uif' },

  // H. Escritura / firma
  { id: 'proyecto_escritura', nombre: 'Proyecto de escritura', categoria: 'escritura', aplicableDemo: true },
  { id: 'liquidacion_final', nombre: 'Liquidación final', categoria: 'escritura', aplicableDemo: true },
  { id: 'confirm_firma', nombre: 'Confirmación de asistencia a firma', categoria: 'escritura', aplicableDemo: true },
  { id: 'dni_firma', nombre: 'DNI vigente al momento de firma', categoria: 'escritura' },
];

// Subset visible en la demo (matrix + selector del drawer).
export const DEMO_REQUIREMENTS_VISIBLES = DEMO_DOCUMENT_REQUIREMENTS.filter((r) => r.aplicableDemo);

// Sugerencia editable de origen/destinatario ("Aportado por") según el requisito
// (nombre/categoría). Devuelve '' cuando no hay mejor inferencia (obliga selección
// explícita). Compartido por el drawer de carga y el dialog de solicitud.
export const inferAportadoPor = (req) => {
  if (!req) return '';
  const n = (req.nombre || '').toLowerCase();
  if (n.includes('comprador')) return 'Comprador';
  if (n.includes('vendedor')) return 'Vendedor';
  if (req.categoria === 'banco') return 'Banco';
  if (req.categoria === 'registral') return 'Gestoría';
  if (req.categoria === 'fiscal') return 'Gestoría';
  if (req.categoria === 'uif') return 'Comprador';
  return '';
};
