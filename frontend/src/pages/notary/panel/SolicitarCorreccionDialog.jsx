import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill } from './OperacionDetailPrimitives';
import { documentCorrections } from './documentCorrectionsStore';
import { aportadoPorDisplay } from './documentUploadsStore';
import { operationalTasks } from './operationalTasksStore';

// Mensaje sugerido (editable). Demo: NO se envía.
const buildMensajeSugerido = (requisito, motivo) =>
  `Hola, necesitamos que corrijas la documentación correspondiente a ${requisito}. ` +
  `Motivo: ${motivo}. Por favor, enviá una nueva versión legible/completa para continuar con el legajo.`;

// Dialog "Solicitar corrección" (demo Fase E). Registra una solicitud local para
// una carga observada/rechazada. Los canales son intención (sin envío). Puede
// crear una tarea operativa de seguimiento vía operationalTasks.create (existente).
export const SolicitarCorreccionDialog = ({ op, upload, open, onOpenChange }) => {
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [canalEmail, setCanalEmail] = useState(true);
  const [canalWhatsapp, setCanalWhatsapp] = useState(true);
  const [crearTarea, setCrearTarea] = useState(true);

  const destinatario = upload ? aportadoPorDisplay(upload) : '';
  const requisito = (upload && (upload.requisito || (upload.archivos[0] && upload.archivos[0].nombre))) || 'el documento';
  const estadoOrigen = upload ? upload.estado : null;
  const motivoOrigen = upload ? (upload.observacion || upload.rechazoMotivo || '') : '';

  useEffect(() => {
    if (!open || !upload) return;
    const m = upload.observacion || upload.rechazoMotivo || '';
    setMotivo(m);
    setMensaje(buildMensajeSugerido(requisito, m || '(indicar motivo)'));
    setCanalEmail(true);
    setCanalWhatsapp(true);
    setCrearTarea(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, upload && upload.id]);

  // Si editan el motivo, refrescar el mensaje sugerido solo si no fue tocado a mano
  // (heurística simple: si el mensaje coincide con el sugerido del motivo previo).
  const onMotivoChange = (val) => {
    setMotivo(val);
    setMensaje((prev) =>
      prev === buildMensajeSugerido(requisito, motivo || '(indicar motivo)')
        ? buildMensajeSugerido(requisito, val || '(indicar motivo)')
        : prev
    );
  };

  const puedeRegistrar = Boolean(upload && motivo.trim());

  const registrar = () => {
    if (!puedeRegistrar) return;
    // 1) Solicitud de corrección (local/demo) — se crea primero para tener su id.
    const correction = documentCorrections.add(op.id, {
      uploadId: upload.id,
      requisitoId: upload.requisitoId ?? null,
      requisito,
      categoria: upload.categoria || 'otros',
      aportadoPor: upload.aportadoPor,
      aportadoPorOtro: upload.aportadoPorOtro,
      estadoOrigen,
      motivo: motivo.trim(),
      mensaje: mensaje.trim(),
      canalSugerido: { email: canalEmail, whatsapp: canalWhatsapp },
    });
    // 2) Tarea operativa de seguimiento (opt-in). sourceId = id de la corrección
    //    (coherente con sourceType 'document_correction'). Luego se linkea.
    if (correction && crearTarea) {
      const title = destinatario && destinatario !== 'No especificado'
        ? `Dar seguimiento a corrección de ${requisito} a ${destinatario}`
        : `Dar seguimiento a corrección de ${requisito}`;
      const task = operationalTasks.create({
        opId: op.id,
        title,
        subtype: 'follow_up',
        origin: 'document_correction',
        relatedActorLabel: destinatario && destinatario !== 'No especificado' ? destinatario : null,
        sourceType: 'document_correction',
        sourceId: correction.id,
        sourceLabel: requisito,
      });
      if (task) documentCorrections.attachOperationalTask(correction.id, task.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" data-testid="solicitar-correccion-dialog">
        <DialogHeader>
          <DialogTitle>Solicitar corrección</DialogTitle>
          <DialogDescription>
            Legajo <span className="font-mono">{op.id}</span> · {op.direccion}
          </DialogDescription>
        </DialogHeader>

        {upload && (
          <div className="space-y-4 py-1">
            {/* Contexto */}
            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-slate-800">{requisito}</span>
                <Pill variant={estadoOrigen === 'rechazado' ? 'destructive' : 'warning'}>
                  {estadoOrigen === 'rechazado' ? 'Rechazado' : 'En observación'}
                </Pill>
              </div>
              <div className="text-[12px] text-slate-500 mt-1">
                Destinatario: <span className="font-medium text-slate-700">{destinatario}</span>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-700">Motivo</label>
              <textarea
                value={motivo}
                onChange={(e) => onMotivoChange(e.target.value)}
                rows={2}
                placeholder={motivoOrigen ? '' : 'Indicá qué debe corregirse o completarse.'}
                data-testid="correccion-motivo"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 resize-none focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-700">Mensaje (editable)</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
                data-testid="correccion-mensaje"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 resize-none focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <span className="text-[12px] font-medium text-slate-700">Canales sugeridos</span>
              <div className="mt-1.5 flex flex-col gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer" data-testid="correccion-canal-email">
                  <Checkbox checked={canalEmail} onCheckedChange={(v) => setCanalEmail(Boolean(v))} />
                  <span className="text-[13px] text-slate-700">Email</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer" data-testid="correccion-canal-whatsapp">
                  <Checkbox checked={canalWhatsapp} onCheckedChange={(v) => setCanalWhatsapp(Boolean(v))} />
                  <span className="text-[13px] text-slate-700">WhatsApp</span>
                </label>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="text-[12px] font-medium text-slate-700 mb-1.5">Seguimiento interno</div>
              <label className="flex items-start gap-2.5 cursor-pointer" data-testid="correccion-crear-tarea">
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
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="correccion-cancelar">
            Cancelar
          </Button>
          <Button
            onClick={registrar}
            disabled={!puedeRegistrar}
            data-testid="correccion-registrar"
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Registrar solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
