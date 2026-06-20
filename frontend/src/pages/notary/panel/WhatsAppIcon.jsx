import React from 'react';
import { ReactComponent as WhatsAppGlyph } from '@/assets/whatsapp.svg';

// Ícono de WhatsApp (asset SVG local en src/assets, sin CDN ni imagen externa).
// El asset usa fill="currentColor" para que el color (verde activo / gris
// inactivo) se controle 100% desde className, sin tocar el archivo SVG.
export const WhatsAppIcon = ({ className = 'w-4 h-4' }) => (
  <WhatsAppGlyph className={className} aria-hidden="true" />
);
