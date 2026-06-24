import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { signatures } from './signaturesStore';

// Modal "Nueva firma" para la Agenda (demo). A diferencia de ProgramarFirmaDialog
// (que recibe un `op` fijo desde el legajo), acá se ELIGE el legajo desde un
// dropdown. Persiste con el MISMO flujo canónico: signatures.set(opId, ...).
// No abre ProgramarFirmaDialog, no crea ruta ni página dedicada. Los checkboxes
// de aviso son configuración/intención (demo): NO ejecutan envíos ni muestran
// ningún mensaje de "enviado".
export const NuevaFirmaDialog = ({ open, onOpenChange, operaciones }) => {
  const [opId, setOpId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [modalidad, setModalidad] = useState('Presencial');
  const [lugar, setLugar] = useState('');
  const [nota, setNota] = useState('');
  const [avisarEmail, setAvisarEmail] = useState(true);
  const [avisarWhatsapp, setAvisarWhatsapp] = useState(true);

  // Reset al abrir — empieza siempre limpio (no precarga ninguna firma).
  useEffect(() => {
    if (!open) return;
    setOpId('');
    setFecha('');
    setHora('');
    setModalidad('Presencial');
    setLugar('');
    setNota('');
    setAvisarEmail(true);
    setAvisarWhatsapp(true);
  }, [open]);

  const op = operaciones.find((o) => o.id === opId) || null;
  const puedeConfirmar = Boolean(opId && fecha && hora);

  const confirmar = () => {
    if (!puedeConfirmar) return;
    signatures.set(opId, {
      fecha,
      hora,
      modalidad,
      lugar: lugar.trim(),
      nota: nota.trim(),
      notificar: { email: avisarEmail, whatsapp: avisarWhatsapp },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]" data-testid="nueva-firma-dialog">
        <DialogHeader>
          <DialogTitle>Nueva firma</DialogTitle>
          <DialogDescription>
            Elegí el legajo y programá la firma. La firma queda asociada a la operación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <label className="text-[12px] font-medium text-slate-700">Legajo</label>
            <select
              value={opId}
              onChange={(e) => setOpId(e.target.value)}
              data-testid="nueva-firma-legajo"
              className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-primary"
            >
              <option value="">Seleccioná un legajo…</option>
              {operaciones.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.direccion} · {o.id}
                </option>
              ))}
            </select>
          </div>

          {/* Los controles de la firma se habilitan una vez elegido el legajo. */}
          {op && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-slate-700">Fecha</label>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    data-testid="nueva-firma-fecha"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-700">Hora</label>
                  <Input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    data-testid="nueva-firma-hora"
                    className="mt-1 h-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-slate-700">Modalidad</label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                  data-testid="nueva-firma-modalidad"
                  className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-primary"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Remota">Remota</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-slate-700">
                  Lugar {modalidad === 'Presencial' ? '' : '(opcional)'}
                </label>
                <Input
                  type="text"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder={modalidad === 'Presencial' ? 'Escribanía, dirección…' : 'Link o plataforma (opcional)'}
                  data-testid="nueva-firma-lugar"
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-slate-700">Nota (opcional)</label>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  rows={2}
                  data-testid="nueva-firma-nota"
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 resize-none focus:outline-none focus:border-primary"
                />
              </div>

              {/* Avisos: configuración/intención (demo). NO ejecutan envíos. */}
              <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer" data-testid="nueva-firma-aviso-email">
                  <Checkbox checked={avisarEmail} onCheckedChange={(v) => setAvisarEmail(Boolean(v))} />
                  <span className="text-[13px] text-slate-700">Avisar por email a las partes</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer" data-testid="nueva-firma-aviso-whatsapp">
                  <Checkbox checked={avisarWhatsapp} onCheckedChange={(v) => setAvisarWhatsapp(Boolean(v))} />
                  <span className="text-[13px] text-slate-700">Avisar por WhatsApp a las partes</span>
                </label>
                <p className="text-[11.5px] text-slate-400 leading-snug pt-0.5">
                  Configuración de avisos para la firma. Demo: no se envían mensajes.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="nueva-firma-cancelar">
            Cancelar
          </Button>
          <Button
            onClick={confirmar}
            disabled={!puedeConfirmar}
            data-testid="nueva-firma-confirmar"
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Confirmar programación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
