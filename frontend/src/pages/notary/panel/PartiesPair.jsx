import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parteIdFromPersona } from './partesData';

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

// Popover de ficha de parte — mismo lenguaje visual que el popover "Línea de
// pases" del Kanban (header con título+subtítulo, cuerpo con filas label/valor,
// footer con CTA "Ver ficha" + flecha).
const PartePopoverContent = ({ parte, rol, opId, onNavigate }) => (
  <div className="min-w-[240px] max-w-[280px] w-max" data-testid={`party-popover-${rol.toLowerCase()}-${opId}`}>
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-sm font-semibold text-slate-900">{parte?.nombre || '—'}</h3>
      <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
        {rol} · Legajo <span className="font-mono">{opId}</span>
      </p>
    </div>

    <div className="px-3 py-3 space-y-2">
      <div>
        <div className="text-[11.5px] text-slate-500 leading-snug">DNI</div>
        <div className="text-[12.5px] font-semibold leading-snug text-slate-900 font-mono mt-0.5">
          {parte?.dni || '—'}
        </div>
      </div>
      <div>
        <div className="text-[11.5px] text-slate-500 leading-snug">Estado</div>
        <div
          className={`text-[12.5px] font-semibold leading-snug mt-0.5 ${
            parte?.verificado ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {parte?.verificado ? 'Verificado' : 'Sin verificar'}
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onNavigate?.();
      }}
      data-testid={`party-popover-cta-${rol.toLowerCase()}-${opId}`}
      className="w-full px-4 py-2.5 text-[12px] font-semibold text-sky-700 hover:bg-sky-50 transition-colors border-t border-slate-100 flex items-center justify-center gap-1.5"
    >
      Ver ficha
      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
    </button>
  </div>
);

const Circle = ({ size, parte, rol, opId, navigate, withPopover }) => {
  const s = SIZE_MAP[size] || SIZE_MAP.sm;
  const base = `${s.box} rounded-full grid place-items-center ${s.text} font-bold shrink-0 transition-colors`;
  const idle = 'bg-slate-200 text-slate-700';
  const hover = 'hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white focus:outline-none';
  const content = parte?.avatar || '—';
  const title = `${rol}: ${parte?.nombre || '—'}`;
  const [open, setOpen] = useState(false);

  if (!opId) {
    return (
      <span className={`${base} ${idle}`} title={title}>
        {content}
      </span>
    );
  }

  if (withPopover) {
    const parteId = parteIdFromPersona(parte);
    const handleTriggerClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen((v) => !v);
    };
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={handleTriggerClick}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            title={title}
            aria-label={title}
            data-testid={`party-circle-${rol.toLowerCase()}-${opId}`}
            className={`${base} ${idle} ${hover} cursor-pointer`}
          >
            {content}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="p-0 w-auto border-slate-200 shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <PartePopoverContent
            parte={parte}
            rol={rol}
            opId={opId}
            onNavigate={() => {
              setOpen(false);
              navigate(`/escribanos/partes/${parteId}`);
            }}
          />
        </PopoverContent>
      </Popover>
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

export const PartiesPair = ({ vendedor, comprador, opId, size = 'sm', className = '', withPopover = false }) => {
  const s = SIZE_MAP[size] || SIZE_MAP.sm;
  const navigate = useNavigate();
  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`} data-testid="parties-pair">
      <Circle size={size} parte={vendedor} rol="Vendedor" opId={opId} navigate={navigate} withPopover={withPopover} />
      <span className={`${s.line} h-px bg-slate-300 shrink-0`} aria-hidden />
      <Circle size={size} parte={comprador} rol="Comprador" opId={opId} navigate={navigate} withPopover={withPopover} />
    </div>
  );
};
