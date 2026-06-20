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

const claveContacto = (persona) => {
  const dniNorm = normalizarDni(persona.dni);
  if (dniNorm) return `dni:${dniNorm}`;
  return `nombre:${normalizarTexto(persona.nombre)}`;
};

// Recorre vendedor/comprador de cada operación y devuelve un mapa id → contacto.
export const buildPartesFromOperaciones = (operaciones) => {
  const mapa = new Map();

  const registrar = (persona, rol, op) => {
    if (!persona?.nombre) return;
    const id = claveContacto(persona);
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

  return Array.from(mapa.values()).map((c) => ({ ...c, legajosCount: c.legajos.length }));
};

export const ROL_LABEL = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
};

export const findParteById = (partes, id) => partes.find((p) => p.id === id) || null;
