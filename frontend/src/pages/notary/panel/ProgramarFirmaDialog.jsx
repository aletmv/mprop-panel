import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signatures } from './signaturesStore';

// Modal de "Programar firma" (demo Fase D). Solo simula: persiste en el store
// local (signaturesStore), NO toca op.firma, NO backend, NO calendario real.
export const ProgramarFirmaDialog = ({ op, open, onOpenChange }) => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [modalidad, setModalidad] = useState('Presencial');
  const [lugar, setLugar] = useState('');
  const [nota, setNota] = useState('');

  // Pre-llenar al abrir desde la firma ya programada (si existe).
  useEffect(() => {
    if (!open) return;
    const existing = signatures.getByOp(op.id);
    setFecha(existing?.fecha || '');
    setHora(existing?.hora || '');
    setModalidad(existing?.modalidad || 'Presencial');
    setLugar(existing?.lugar || '');
    setNota(existing?.nota || '');
  }, [open, op.id]);

  const puedeConfirmar = Boolean(fecha && hora);

  const confirmar = () => {
    if (!puedeConfirmar) return;
    signatures.set(op.id, { fecha, hora, modalidad, lugar: lugar.trim(), nota: nota.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]" data-testid="programar-firma-dialog">
        <DialogHeader>
          <DialogTitle>Programar firma</DialogTitle>
          <DialogDescription>
            Legajo <span className="font-mono">{op.id}</span> · {op.direccion}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-slate-700">Fecha</label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                data-testid="firma-fecha"
                className="mt-1 h-9"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-700">Hora</label>
              <Input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                data-testid="firma-hora"
                className="mt-1 h-9"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-slate-700">Modalidad</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              data-testid="firma-modalidad"
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
              data-testid="firma-lugar"
              className="mt-1 h-9"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-slate-700">Nota (opcional)</label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              data-testid="firma-nota"
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 resize-none focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="firma-cancelar">
            Cancelar
          </Button>
          <Button
            onClick={confirmar}
            disabled={!puedeConfirmar}
            data-testid="firma-confirmar"
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Confirmar programación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
