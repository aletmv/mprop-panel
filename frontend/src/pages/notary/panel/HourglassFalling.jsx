import React from 'react';

/**
 * Reloj de arena con granitos cayendo (no se da vuelta).
 * Color: gris oscuro (currentColor) con sombreado por opacidad.
 * El tamaño se controla con className (ej. "w-3.5 h-3.5").
 */
export const HourglassFalling = ({ className = 'w-4 h-4', title = 'En curso' }) => (
  <svg
    viewBox="0 0 16 16"
    role="img"
    aria-label={title}
    className={`hg-icon ${className}`}
    fill="none"
  >
    <title>{title}</title>
    {/* Marco */}
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 2 H12.5" />
      <path d="M3.5 14 H12.5" />
      <path d="M4 2.2 C 4 5.7, 8 7.2, 8 8" />
      <path d="M12 2.2 C 12 5.7, 8 7.2, 8 8" />
      <path d="M4 13.8 C 4 10.3, 8 8.8, 8 8" />
      <path d="M12 13.8 C 12 10.3, 8 8.8, 8 8" />
    </g>
    {/* Arena del bulbo superior (sombreado) */}
    <path d="M4.7 2.7 H11.3 L8 6.4 Z" fill="currentColor" fillOpacity="0.55" />
    {/* Montículo de arena que se acumula abajo */}
    <path d="M5.5 13.3 C 6 12.2, 10 12.2, 10.5 13.3 Z" fill="currentColor" fillOpacity="0.55" />
    {/* Granitos cayendo */}
    <circle className="hg-grain hg-g1" cx="8" cy="8" r="0.45" fill="currentColor" />
    <circle className="hg-grain hg-g2" cx="8" cy="8" r="0.4" fill="currentColor" />
    <circle className="hg-grain hg-g3" cx="8" cy="8" r="0.42" fill="currentColor" />
  </svg>
);
