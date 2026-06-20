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
      telefono: null,
      rolPrincipal: rol,
      legajos: [legajo],
    });
  };

  operaciones.forEach((op) => {
    registrar(op.vendedor, 'vendedor', op);
    registrar(op.comprador, 'comprador', op);
  });

  // DEMO: teléfono mock determinístico para poder probar el ícono de WhatsApp
  // activo en la UI. No es un dato real — no existe ningún teléfono en
  // mockData.js. Se asigna a la mitad de los contactos (alternando por
  // posición, siempre el mismo orden) para que también queden casos sin
  // WhatsApp cargado. Mismo resultado en cada render: depende únicamente del
  // orden estable de `operaciones`, sin Math.random().
  let secuenciaDemo = 0;
  return Array.from(mapa.values()).map((c, idx) => {
    const tieneWhatsappDemo = idx % 2 === 0;
    let telefonoDemo = null;
    if (tieneWhatsappDemo) {
      secuenciaDemo += 1;
      telefonoDemo = `+5491155550${100 + secuenciaDemo}`;
    }
    return { ...c, legajosCount: c.legajos.length, telefono: telefonoDemo };
  });
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
