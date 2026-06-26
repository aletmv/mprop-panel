import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill } from './OperacionDetailPrimitives';
import { documentRequests } from './documentRequestsStore';
import { inferAportadoPor } from './documentRequirements';
import { operationalTasks } from './operationalTasksStore';

const APORTADO_POR_OPCIONES = ['Comprador', 'Vendedor', 'Gestoría', 'Escribanía', 'Base de datos', 'Banco', 'Tercero', 'Otro'];

// Mensaje sugerido (editable). Demo: NO se envía.
const buildMensajeSugerido = (requisito) =>
  `Hola, para avanzar con el legajo necesitamos que aportes la documentación correspondiente a ${requisito}. ` +
  `Por favor, subila o envianosla cuando puedas.`;

// Dialog "Solicitar documento" (demo Fase E) para requisitos PENDIENTES (sin
// carga). Registra una solicitud local y, opcionalmente, una tarea operativa de
// seguimiento (operationalTasks.create existente). Los canales son intención
// (sin envío). El destinatario se infiere del requisito y es editable.
export const SolicitarDocumentoDialog = ({ op, requisito, open, onOpenChange }) => {
  const [aportadoPor, setAportadoPor] = useState('');
  const [aportadoPorOtro, setAportadoPorOtro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [canalEmail, setCanalEmail] = useState(true);
  const [canalWhatsapp, setCanalWhatsapp] = useState(true);
  const [crearTarea, setCrearTarea] = useState(true);

  const nombre = requisito ? requisito.nombre : '';
  const aportadoEsOtro = aportadoPor === 'Otro';

  useEffect(() => {
    if (!open || !requisito) return;
    setAportadoPor(inferAportadoPor(requisito)); // sugerencia editable; '' obliga selección
    setAportadoPorOtro('');
    setMensaje(buildMensajeSugerido(nombre));
    setCanalEmail(true);
    setCanalWhatsapp(true);
    setCrearTarea(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requisito && requisito.id]);

  const algunCanal = canalEmail || canalWhatsapp;
  const puedeRegistrar = Boolean(
    requisito && aportadoPor && (!aportadoEsOtro || aportadoPorOtro.trim()) && mensaje.trim() && algunCanal
  );

  const destinatario = aportadoEsOtro ? (aportadoPorOtro.trim() || 'Otro') : aportadoPor;

  const registrar = () => {
    if (!puedeRegistrar) return;
    // 1) Solicitud (local/demo) — se crea primero para tener su id.
    const request = documentRequests.add(op.id, {
      requisitoId: requisito.id,
      requisito: nombre,
      categoria: requisito.categoria || 'otros',
      aportadoPor,
      aportadoPorOtro: aportadoEsOtro ? aportadoPorOtro.trim() : '',
      mensaje: mensaje.trim(),
      canalSugerido: { email: canalEmail, whatsapp: canalWhatsapp },
    });
    // 2) Tarea operativa de seguimiento (opt-in). sourceId = id de la solicitud.
    if (request && crearTarea) {
      const title = `Solicitar documento ${nombre} a ${destinatario}`;
      const task = operationalTasks.create({
        opId: op.id,
        title,
        subtype: 'follow_up',
        origin: 'document_request',
        relatedActorLabel: destinatario,
        sourceType: 'document_request',
        sourceId: request.id,
        sourceLabel: nombre,
      });
      if (task) documentRequests.attachOperationalTask(request.id, task.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" data-testid="solicitar-documento-dialog">
        <DialogHeader>
          <DialogTitle>Solicitar documento</DialogTitle>
          <DialogDescription>
            Legajo <span className="font-mono">{op.id}</span> · {op.direccion}
          </DialogDescription>
        </DialogHeader>

        {requisito && (
          <div className="space-y-4 py-1">
            {/* Contexto */}
            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-slate-800">{nombre}</span>
                <Pill variant="muted">Pendiente</Pill>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-700">Destinatario sugerido</label>
              <select
                value={aportadoPor}
                onChange={(e) => setAportadoPor(e.target.value)}
                data-testid="solicitud-destinatario"
                className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-primary"
              >
                <option value="">Seleccioná el destinatario…</option>
                {APORTADO_POR_OPCIONES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <p className="text-[11.5px] text-slate-400 leading-snug mt-1">
                A quién se le solicita el documento dentro del legajo.
              </p>
            </div>

            {aportadoEsOtro && (
              <div>
                <label className="text-[12px] font-medium text-slate-700">Especificar destinatario</label>
                <input
                  type="text"
                  value={aportadoPorOtro}
                  onChange={(e) => setAportadoPorOtro(e.target.value)}
                  placeholder="Ej. Martillero, organismo, etc."
                  data-testid="solicitud-destinatario-otro"
                  className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            <div>
              <label className="text-[12px] font-medium text-slate-700">Mensaje (editable)</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
                data-testid="solicitud-mensaje"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 resize-none focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <span className="text-[12px] font-medium text-slate-700">Canales sugeridos</span>
              <div className="mt-1.5 flex flex-col gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer" data-testid="solicitud-canal-email">
                  <Checkbox checked={canalEmail} onCheckedChange={(v) => setCanalEmail(Boolean(v))} />
                  <span className="text-[13px] text-slate-700">Email</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer" data-testid="solicitud-canal-whatsapp">
                  <Checkbox checked={canalWhatsapp} onCheckedChange={(v) => setCanalWhatsapp(Boolean(v))} />
                  <span className="text-[13px] text-slate-700">WhatsApp</span>
                </label>
              </div>
              {!algunCanal && (
                <p className="text-[11.5px] text-amber-600 leading-snug mt-1.5" data-testid="solicitud-canal-hint">
                  Seleccioná al menos un canal sugerido.
                </p>
              )}
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="text-[12px] font-medium text-slate-700 mb-1.5">Seguimiento interno</div>
              <label className="flex items-start gap-2.5 cursor-pointer" data-testid="solicitud-crear-tarea">
                <Checkbox checked={crearTarea} onCheckedChange={(v) => setCrearTarea(Boolean(v))} className="mt-0.5" />
                <span className="text-[12.5px] text-slate-700 leading-snug">Crear tarea operativa de seguimiento</span>
              </label>
            </div>

            <p className="text-[11.5px] text-slate-400 leading-snug">
              Demo: la solicitud queda registrada localmente; no se envían mensajes.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="solicitud-cancelar">
            Cancelar
          </Button>
          <Button
            onClick={registrar}
            disabled={!puedeRegistrar}
            data-testid="solicitud-registrar"
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Registrar solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
