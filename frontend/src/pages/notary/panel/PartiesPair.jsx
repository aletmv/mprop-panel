import React from 'react';

/**
 * Representa las dos partes de un legajo (vendedor + comprador) como
 * dos círculos azules NO solapados conectados por una línea fina en el medio
 * que no llega a tocar el contorno de los círculos.
 *
 * Variantes:
 *   sm  → 24px (tablas, kanban)
 *   md  → 32px (vistas más amplias)
 *   lg  → 40px (header de detalle)
 */
const SIZE_MAP = {
  sm: { box: 'w-6 h-6', text: 'text-[9px]', line: 'w-2', gap: 'gap-1' },
  md: { box: 'w-8 h-8', text: 'text-[10.5px]', line: 'w-3', gap: 'gap-1.5' },
  lg: { box: 'w-10 h-10', text: 'text-[12px]', line: 'w-4', gap: 'gap-2' },
};

export const PartiesPair = ({ vendedor, comprador, size = 'sm', className = '' }) => {
  const s = SIZE_MAP[size] || SIZE_MAP.sm;
  const circle = `${s.box} rounded-full bg-primary text-white grid place-items-center ${s.text} font-bold shrink-0`;
  const line = `${s.line} h-px bg-slate-300 shrink-0`;
  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`} data-testid="parties-pair">
      <span className={circle} title={vendedor?.nombre || 'Vendedor'}>
        {vendedor?.avatar || '—'}
      </span>
      <span className={line} aria-hidden />
      <span className={circle} title={comprador?.nombre || 'Comprador'}>
        {comprador?.avatar || '—'}
      </span>
    </div>
  );
};
