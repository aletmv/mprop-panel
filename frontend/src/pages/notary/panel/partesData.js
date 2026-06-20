// partesData.js — Deriva el listado de "Partes" (compradores/vendedores) a partir
// de las operaciones existentes. No agrega entidades nuevas (gestoría, escribanía,
// terceros) ni muta las operaciones de entrada.

const normalizarTexto = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizarDni = (dni) => (dni || '').replace(/[.\s]/g, '');

// DEMO: teléfono mock determinístico, derivado del DNI de la propia persona
// (no de su posición en ningún array). No es un dato real — no existe ningún
// teléfono en mockData.js. Por estar atado al DNI, da el mismo resultado sin
// importar desde dónde se llame: la lista de Partes, la ficha de detalle o el
// popover del Kanban (que recibe el vendedor/comprador "crudo" de la
// operación, no el contacto ya derivado). Sin Math.random().
export const telefonoDemoFromPersona = (persona) => {
  const digits = normalizarDni(persona?.dni).replace(/\D/g, '');
  if (!digits) return null;
  const ultimoDigito = Number(digits[digits.length - 1]);
  const tieneWhatsappDemo = ultimoDigito % 2 === 0;
  if (!tieneWhatsappDemo) return null;
  const sufijo = digits.slice(-3).padStart(3, '0');
  return `+5491155550${sufijo}`;
};

// Id determinista de un contacto a partir de sus propios datos (sin depender
// de la lista completa de operaciones). Misma regla que usa buildPartesFromOperaciones
// para deduplicar, así cualquier vista puede calcular el id de "esa persona puntual".
export const parteIdFromPersona = (persona) => {
  const dniNorm = normalizarDni(persona?.dni);
  if (dniNorm) return `dni:${dniNorm}`;
  return `nombre:${normalizarTexto(persona?.nombre)}`;
};

// Recorre vendedor/comprador de cada operación y devuelve un mapa id → contacto.
export const buildPartesFromOperaciones = (operaciones) => {
  const mapa = new Map();

  const registrar = (persona, rol, op) => {
    if (!persona?.nombre) return;
    const id = parteIdFromPersona(persona);
    const legajo = {
      opId: op.id,
      rol,
      direccion: op.direccion,
      estado: op.estado,
    };

    if (mapa.has(id)) {
      const contacto = mapa.get(id);
      if (!contacto.legajos.some((l) => l.opId === op.id && l.rol === rol)) {
        contacto.legajos.push(legajo);
      }
      return;
    }

    mapa.set(id, {
      id,
      nombre: persona.nombre,
      dni: persona.dni || null,
      avatar: persona.avatar || null,
      verificado: !!persona.verificado,
      email: null,
      telefono: telefonoDemoFromPersona(persona),
      rolPrincipal: rol,
      legajos: [legajo],
    });
  };

  operaciones.forEach((op) => {
    registrar(op.vendedor, 'vendedor', op);
    registrar(op.comprador, 'comprador', op);
  });

  return Array.from(mapa.values()).map((c) => ({ ...c, legajosCount: c.legajos.length }));
};

// Link de WhatsApp (wa.me) a partir del teléfono ya cargado del contacto.
// No infiere ni inventa números: si no hay teléfono, devuelve null.
export const whatsappLinkFromTelefono = (telefono) => {
  if (!telefono) return null;
  const digits = telefono.replace(/[^\d]/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
};

export const ROL_LABEL = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
};

export const findParteById = (partes, id) => partes.find((p) => p.id === id) || null;
