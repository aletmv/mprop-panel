import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Representa las dos partes de un legajo (vendedor + comprador) como
 * dos círculos NO solapados conectados por una línea fina en el medio
 * que no llega a tocar el contorno de los círculos.
 *
 * Idle:  gris neutro
 * Hover: azul primario
 * Click: navega al perfil de la parte (tab "Partes e inmueble" del legajo)
 *
 * Usa <button> + useNavigate para evitar anidar <a> dentro de <a>
 * cuando el contenedor (ej. KanbanCard) ya es un Link.
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

const Circle = ({ size, parte, rol, opId, navigate }) => {
  const s = SIZE_MAP[size] || SIZE_MAP.sm;
  const base = `${s.box} rounded-full grid place-items-center ${s.text} font-bold shrink-0 transition-colors`;
  const idle = 'bg-slate-200 text-slate-700';
  const hover = 'hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white focus:outline-none';
  const content = parte?.avatar || '—';
  const title = `${rol}: ${parte?.nombre || '—'}`;

  if (!opId) {
    return (
      <span className={`${base} ${idle}`} title={title}>
        {content}
      </span>
    );
  }
  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/escribanos/operaciones/${opId}?tab=partes#${rol.toLowerCase()}`);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
      title={title}
      aria-label={title}
      data-testid={`party-circle-${rol.toLowerCase()}-${opId}`}
      className={`${base} ${idle} ${hover} cursor-pointer`}
    >
      {content}
    </button>
  );
};

export const PartiesPair = ({ vendedor, comprador, opId, size = 'sm', className = '' }) => {
  const s = SIZE_MAP[size] || SIZE_MAP.sm;
  const navigate = useNavigate();
  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`} data-testid="parties-pair">
      <Circle size={size} parte={vendedor} rol="Vendedor" opId={opId} navigate={navigate} />
      <span className={`${s.line} h-px bg-slate-300 shrink-0`} aria-hidden />
      <Circle size={size} parte={comprador} rol="Comprador" opId={opId} navigate={navigate} />
    </div>
  );
};
