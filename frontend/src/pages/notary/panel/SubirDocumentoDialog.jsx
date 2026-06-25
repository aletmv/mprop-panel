import React, { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Paperclip, Plus, Trash2, Upload, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Pill } from './OperacionDetailPrimitives';
import { documentUploads, useDocumentUploads, aportadoPorDisplay } from './documentUploadsStore';
import { DEMO_DOCUMENT_REQUIREMENTS, DEMO_REQUIREMENTS_VISIBLES, DOC_CATEGORIES, DOC_CATEGORY_LABEL } from './documentRequirements';

const OTRO = '__otro__';
const APORTADO_POR_OPCIONES = ['Comprador', 'Vendedor', 'Gestoría', 'Escribanía', 'Base de datos', 'Banco', 'Tercero', 'Otro'];

// Sugerencia editable de "Aportado por" según el requisito (nombre/categoría).
// Devuelve '' cuando no hay mejor inferencia (obliga selección explícita).
const inferAportadoPor = (req) => {
  if (!req) return '';
  const n = (req.nombre || '').toLowerCase();
  if (n.includes('comprador')) return 'Comprador';
  if (n.includes('vendedor')) return 'Vendedor';
  if (req.categoria === 'banco') return 'Banco';
  if (req.categoria === 'registral') return 'Gestoría';
  if (req.categoria === 'fiscal') return 'Gestoría';
  if (req.categoria === 'uif') return 'Comprador';
  return '';
};

// Tamaño legible (la metadata del browser file input puede no traer size).
const fmtSize = (bytes) => {
  if (typeof bytes !== 'number' || !isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Panel lateral (drawer) de carga documental (demo Fase E). Reemplaza el modal
// chico. Permite múltiples archivos por requisito, lista editable antes de
// confirmar, declaraciones obligatorias y un repositorio de cargas existentes.
// Solo usa metadata del file input (name/size/type); NO sube ni lee contenido.
export const SubirDocumentoDialog = ({ op, open, onOpenChange, initialRequirementId = null }) => {
  const [requisitoSel, setRequisitoSel] = useState('');
  const [otroNombre, setOtroNombre] = useState('');
  const [aportadoPor, setAportadoPor] = useState('');
  const [aportadoPorOtro, setAportadoPorOtro] = useState('');
  const [archivos, setArchivos] = useState([]); // staged: { id, nombre, size, type }
  const [nota, setNota] = useState('');
  const [declLegibles, setDeclLegibles] = useState(false);
  const [declAutorizacion, setDeclAutorizacion] = useState(false);
  const fileRef = useRef(null);
  const stagedSeq = useRef(0);

  const uploadsOp = useDocumentUploads().filter((u) => u.opId === op.id);

  const resetForm = () => {
    setRequisitoSel('');
    setOtroNombre('');
    setAportadoPor('');
    setAportadoPorOtro('');
    setArchivos([]);
    setNota('');
    setDeclLegibles(false);
    setDeclAutorizacion(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  useEffect(() => {
    if (!open) return;
    resetForm();
    // Preselección al abrir desde el "+" de un requisito (editable).
    if (initialRequirementId) {
      const req = DEMO_REQUIREMENTS_VISIBLES.find((r) => r.id === initialRequirementId);
      if (req) {
        setRequisitoSel(req.id);
        setAportadoPor(inferAportadoPor(req)); // sugerencia editable; '' obliga selección
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRequirementId]);

  const esOtro = requisitoSel === OTRO;
  const aportadoEsOtro = aportadoPor === 'Otro';

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setArchivos((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `staged_${Date.now()}_${stagedSeq.current++}`,
        nombre: f.name,
        size: typeof f.size === 'number' ? f.size : null,
        type: f.type || null,
      })),
    ]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeStaged = (id) => setArchivos((prev) => prev.filter((a) => a.id !== id));

  const puedeConfirmar = Boolean(
    requisitoSel && (!esOtro || otroNombre.trim()) &&
    aportadoPor && (!aportadoEsOtro || aportadoPorOtro.trim()) &&
    archivos.length && declLegibles && declAutorizacion
  );

  const registrar = () => {
    if (!puedeConfirmar) return;
    const reqDoc = esOtro ? null : DEMO_DOCUMENT_REQUIREMENTS.find((d) => d.id === requisitoSel);
    documentUploads.add(op.id, {
      requisitoId: reqDoc ? reqDoc.id : null,
      requisito: esOtro ? otroNombre.trim() : (reqDoc ? reqDoc.nombre : ''),
      categoria: reqDoc ? reqDoc.categoria : 'otros',
      aportadoPor,
      aportadoPorOtro: aportadoEsOtro ? aportadoPorOtro.trim() : '',
      archivos: archivos.map(({ nombre, size, type }) => ({ nombre, size, type })),
      nota: nota.trim(),
      declaraciones: { legiblesYCompletos: declLegibles, autorizacionCarga: declAutorizacion },
    });
    resetForm(); // la carga queda en el repositorio inferior; el drawer sigue abierto
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[560px] p-0 flex flex-col gap-0"
        data-testid="subir-documento-drawer"
      >
        {/* Header fijo */}
        <div className="px-6 py-5 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Subir documentos</h2>
          <p className="text-[13px] text-slate-500 mt-0.5 truncate">
            Legajo <span className="font-mono">{op.id}</span> · {op.direccion}
          </p>
        </div>

        {/* Cuerpo con scroll interno */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-h-0">
          {/* --- Form de carga --- */}
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-slate-700">Requisito</label>
              <select
                value={requisitoSel}
                onChange={(ev) => setRequisitoSel(ev.target.value)}
                data-testid="subir-doc-requisito"
                className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-primary"
              >
                <option value="">Seleccioná un requisito…</option>
                {DOC_CATEGORIES.map((cat) => {
                  const reqs = DEMO_REQUIREMENTS_VISIBLES.filter((r) => r.categoria === cat.id);
                  if (!reqs.length) return null;
                  return (
                    <optgroup key={cat.id} label={cat.label}>
                      {reqs.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </optgroup>
                  );
                })}
                <option value={OTRO}>Otro documento…</option>
              </select>
            </div>

            {esOtro && (
              <div>
                <label className="text-[12px] font-medium text-slate-700">Nombre del documento</label>
                <Input
                  type="text"
                  value={otroNombre}
                  onChange={(ev) => setOtroNombre(ev.target.value)}
                  placeholder="Ej. Poder especial"
                  data-testid="subir-doc-otro-nombre"
                  className="mt-1 h-9"
                />
              </div>
            )}

            <div>
              <label className="text-[12px] font-medium text-slate-700">Aportado por</label>
              <select
                value={aportadoPor}
                onChange={(ev) => setAportadoPor(ev.target.value)}
                data-testid="subir-doc-aportado-por"
                className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-primary"
              >
                <option value="">Seleccioná el origen…</option>
                {APORTADO_POR_OPCIONES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <p className="text-[11.5px] text-slate-400 leading-snug mt-1">
                Indicá el origen del documento dentro del legajo.
              </p>
            </div>

            {aportadoEsOtro && (
              <div>
                <label className="text-[12px] font-medium text-slate-700">Especificar origen</label>
                <Input
                  type="text"
                  value={aportadoPorOtro}
                  onChange={(ev) => setAportadoPorOtro(ev.target.value)}
                  placeholder="Ej. Martillero, organismo, etc."
                  data-testid="subir-doc-aportado-otro"
                  className="mt-1 h-9"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-[12px] font-medium text-slate-700">Archivos</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current && fileRef.current.click()}
                  data-testid="subir-doc-add-files"
                  className="h-8 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar archivos
                </Button>
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                onChange={onFilesChange}
                className="hidden"
                data-testid="subir-doc-file-input"
              />
              {archivos.length === 0 ? (
                <div className="mt-2 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-[12.5px] text-slate-400">
                  Sin archivos agregados. Podés agregar uno o varios (ej. frente y dorso).
                </div>
              ) : (
                <ul className="mt-2 space-y-1.5" data-testid="subir-doc-staged-list">
                  {archivos.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />
                      <span className="flex-1 min-w-0 text-[13px] text-slate-700 truncate" title={a.nombre}>
                        {a.nombre}
                      </span>
                      {fmtSize(a.size) && (
                        <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">{fmtSize(a.size)}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeStaged(a.id)}
                        title="Quitar archivo"
                        aria-label="Quitar archivo"
                        className="text-slate-400 hover:text-destructive transition-colors shrink-0"
                        data-testid={`subir-doc-remove-staged-${a.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-700">Nota (opcional)</label>
              <textarea
                value={nota}
                onChange={(ev) => setNota(ev.target.value)}
                rows={2}
                data-testid="subir-doc-nota"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 resize-none focus:outline-none focus:border-primary"
              />
            </div>

            {/* Declaraciones obligatorias */}
            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-3 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer" data-testid="subir-doc-decl-legibles">
                <Checkbox checked={declLegibles} onCheckedChange={(v) => setDeclLegibles(Boolean(v))} className="mt-0.5" />
                <span className="text-[12.5px] text-slate-700 leading-snug">
                  Verifiqué que los archivos son legibles, completos y corresponden al requisito seleccionado.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer" data-testid="subir-doc-decl-autorizacion">
                <Checkbox checked={declAutorizacion} onCheckedChange={(v) => setDeclAutorizacion(Boolean(v))} className="mt-0.5" />
                <span className="text-[12.5px] text-slate-700 leading-snug">
                  Declaro que cuento con autorización para incorporarlos al legajo y entiendo que quedan pendientes de revisión por la escribanía.
                </span>
              </label>
            </div>
          </div>

          {/* --- Repositorio de documentos incorporados --- */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-[13px] font-semibold text-slate-700 mb-3">
              Documentos incorporados al legajo
              {uploadsOp.length > 0 && <span className="text-slate-400 font-normal"> · {uploadsOp.length}</span>}
            </h3>
            {uploadsOp.length === 0 ? (
              <p className="text-[12.5px] text-slate-400">Todavía no registraste cargas en este legajo (demo/local).</p>
            ) : (
              <ul className="space-y-2.5" data-testid="subir-doc-repo-list">
                {uploadsOp.map((u) => {
                  const stCfg = {
                    en_revision: { icon: Clock, tint: 'text-amber-600', pill: 'warning', label: 'En revisión' },
                    revisado: { icon: CheckCircle2, tint: 'text-emerald-600', pill: 'success', label: 'Revisado' },
                    observado: { icon: AlertTriangle, tint: 'text-amber-600', pill: 'warning', label: 'En observación' },
                    rechazado: { icon: XCircle, tint: 'text-red-600', pill: 'destructive', label: 'Rechazado' },
                  }[u.estado] || { icon: Clock, tint: 'text-amber-600', pill: 'warning', label: u.estado };
                  const StIcon = stCfg.icon;
                  return (
                    <li
                      key={u.id}
                      className="rounded-lg border border-slate-200 px-3 py-2.5"
                      data-testid={`subir-doc-repo-${u.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <StIcon className={`w-4 h-4 shrink-0 ${stCfg.tint}`} strokeWidth={1.5} />
                        <span className="flex-1 min-w-0 text-[13px] font-medium text-slate-800 truncate">
                          {u.requisito || (u.archivos[0] && u.archivos[0].nombre) || 'Documento'}
                        </span>
                        <Pill variant={stCfg.pill}>{stCfg.label}</Pill>
                        <button
                          type="button"
                          onClick={() => documentUploads.remove(u.id)}
                          title="Eliminar carga"
                          aria-label="Eliminar carga"
                          className="text-slate-400 hover:text-destructive transition-colors shrink-0"
                          data-testid={`subir-doc-repo-remove-${u.id}`}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.6} />
                        </button>
                      </div>
                      <ul className="mt-1.5 pl-6 space-y-1">
                        {u.archivos.map((a) => (
                          <li key={a.id} className="flex items-center gap-1.5 text-[12px] text-slate-500">
                            <Paperclip className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                            <span className="flex-1 min-w-0 truncate" title={a.nombre}>{a.nombre}</span>
                            {fmtSize(a.size) && <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">{fmtSize(a.size)}</span>}
                            {u.estado === 'en_revision' && u.archivos.length > 1 && (
                              <button
                                type="button"
                                onClick={() => documentUploads.removeArchivo(u.id, a.id)}
                                title="Quitar archivo"
                                aria-label="Quitar archivo"
                                className="text-slate-300 hover:text-destructive transition-colors shrink-0"
                              >
                                <Trash2 className="w-3 h-3" strokeWidth={1.6} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-1.5 pl-6 text-[11px] text-slate-400">
                        {DOC_CATEGORY_LABEL[u.categoria] || 'Otros documentos'} · Aportado por: {aportadoPorDisplay(u)} · {u.fecha} · {u.hora} hs · carga registrada en demo/local
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer fijo */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="subir-doc-cerrar">
            Cerrar
          </Button>
          <Button
            onClick={registrar}
            disabled={!puedeConfirmar}
            data-testid="subir-doc-registrar"
            className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
          >
            <Upload className="w-4 h-4" /> Registrar carga
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
