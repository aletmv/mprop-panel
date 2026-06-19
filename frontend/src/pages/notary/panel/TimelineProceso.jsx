// TimelineProceso.jsx — Sección full-width "Timeline de la operación".
// Vista vertical por hitos del proceso, con items colapsables individualmente.

import React, { useState } from 'react';
import {
  PlayCircle, FolderOpen, Search, FileSignature, CheckCircle2,
  ChevronRight, AlertCircle, Wallet, Database, User, Store, Landmark,
  Building2, ShieldCheck, Clock, Lock, FileText, ListChecks, ClipboardList,
} from 'lucide-react';
import { buildTimelineChecklist } from './timelineChecklist';

const STAGE_ICON = {
  inicio:        PlayCircle,
  expediente:    FolderOpen,
  due_diligence: Search,
  precierre:     FileSignature,
  cierre:        CheckCircle2,
};

const STATUS_META = {
  completo:   { label: 'Completo',   dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  pendiente:  { label: 'Pendiente',  dot: 'bg-slate-300',   text: 'text-slate-600',   bg: 'bg-slate-50',    border: 'border-slate-200'   },
  observado:  { label: 'Observado',  dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'     },
  automatico: { label: 'Automático', dot: 'bg-sky-500',     text: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-200'     },
  no_aplica:  { label: 'No aplica',  dot: 'bg-slate-200',   text: 'text-slate-400',   bg: 'bg-slate-50',    border: 'border-slate-200'   },
};

const EVIDENCE_STATUS_META = {
  disponible: { label: 'Disponible', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pendiente:  { label: 'Pendiente',  tone: 'bg-slate-50   text-slate-600   border-slate-200'   },
  observado:  { label: 'Observado',  tone: 'bg-red-50     text-red-700     border-red-200'     },
  validado:   { label: 'Validado',   tone: 'bg-sky-50     text-sky-700     border-sky-200'     },
  no_aplica:  { label: 'No aplica',  tone: 'bg-slate-50   text-slate-400   border-slate-200'   },
};

const EVIDENCE_TYPE_ICON = {
  archivo:       FileText,
  base_externa:  Database,
  evento_boveda: Wallet,
  accion:        ListChecks,
  declaracion:   ClipboardList,
};

const SOURCE_LABEL = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
  plataforma: 'Plataforma',
  boveda: 'MercadoPago',
  base_externa: 'Base externa',
  escribania: 'Escribanía',
  gestoria: 'Gestoría',
  banco: 'Banco',
};

const ORIGIN_META = {
  plataforma:   { label: 'Plataforma',    Icon: Building2,   tone: 'bg-slate-100 text-slate-700 border-slate-200' },
  boveda:       { label: 'Bóveda',        Icon: Wallet,      tone: 'bg-sky-50 text-sky-700 border-sky-200'         },
  base_externa: { label: 'Base externa',  Icon: Database,    tone: 'bg-violet-50 text-violet-700 border-violet-200' },
  comprador:    { label: 'Comprador',     Icon: User,        tone: 'bg-amber-50 text-amber-700 border-amber-200'   },
  vendedor:     { label: 'Vendedor',      Icon: Store,       tone: 'bg-amber-50 text-amber-700 border-amber-200'   },
  banco:        { label: 'Banco',         Icon: Landmark,    tone: 'bg-blue-50 text-blue-700 border-blue-200'      },
  gestoria:     { label: 'Gestoría',      Icon: Building2,   tone: 'bg-violet-50 text-violet-700 border-violet-200'},
  escribania:   { label: 'Escribanía',    Icon: ShieldCheck, tone: 'bg-slate-100 text-slate-700 border-slate-200'  },
};

const Chip = ({ children, className = '', icon: Icon }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10.5px] font-medium border whitespace-nowrap ${className}`}>
    {Icon && <Icon className="w-3 h-3" strokeWidth={1.75} />}
    {children}
  </span>
);

const ItemRow = ({ item }) => {
  const [open, setOpen] = useState(false);
  const sm = STATUS_META[item.status];
  const om = ORIGIN_META[item.origin] || ORIGIN_META.plataforma;
  const isObs = item.status === 'observado';
  const blocks = item.blocksSigning && item.status !== 'completo';

  return (
    <li
      data-testid={`tl-item-${item.id}`}
      className={`relative pl-7 pr-3 py-2.5 rounded-md transition-colors ${
        isObs ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-slate-50'
      }`}
    >
      <span className={`absolute left-[10px] top-4 w-2.5 h-2.5 rounded-full ${sm.dot} ring-2 ring-white`} aria-hidden />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid={`tl-item-toggle-${item.id}`}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className={`text-[13px] font-medium leading-snug ${isObs ? 'text-red-800' : 'text-slate-900'}`}>
              {item.label}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Chip className={`${sm.bg} ${sm.text} ${sm.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                {sm.label}
              </Chip>
              <Chip className={om.tone} icon={om.Icon}>{om.label}</Chip>
              <Chip className="bg-white text-slate-600 border-slate-200">{item.responsible}</Chip>
              {blocks && (
                <Chip className="bg-red-600 text-white border-red-600">
                  <Lock className="w-3 h-3" strokeWidth={2} />
                  Bloquea firma
                </Chip>
              )}
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-3 text-[11.5px]">
          {item.note && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nota</div>
              <div className={isObs ? 'text-red-800' : 'text-slate-700'}>{item.note}</div>
            </div>
          )}

          {item.evidence && item.evidence.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Evidencia
              </div>
              <div className="space-y-1.5">
                {item.evidence.map((ev, i) => {
                  const TypeIcon = EVIDENCE_TYPE_ICON[ev.type] || ClipboardList;
                  const stm = EVIDENCE_STATUS_META[ev.status] || EVIDENCE_STATUS_META.pendiente;
                  const isObsEv = ev.status === 'observado';
                  return (
                    <div
                      key={i}
                      data-testid={`tl-evidence-${item.id}-${i}`}
                      className={`flex items-start gap-2.5 px-2.5 py-2 rounded-md border ${
                        isObsEv ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-md grid place-items-center shrink-0 ${
                        isObsEv ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <TypeIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`font-medium leading-snug ${isObsEv ? 'text-red-800' : 'text-slate-800'}`}>
                            {ev.label}
                          </div>
                          <span className={`inline-flex items-center px-1.5 py-[1px] rounded-full text-[9.5px] font-semibold border whitespace-nowrap ${stm.tone}`}>
                            {stm.label}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[10.5px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>{SOURCE_LABEL[ev.source] || ev.source}</span>
                          {ev.date && (<><span className="text-slate-300">·</span><span>{ev.date}</span></>)}
                          {ev.fileName && (<><span className="text-slate-300">·</span><span className="font-mono text-[10px]">{ev.fileName}</span></>)}
                          {ev.result && (<><span className="text-slate-300">·</span><span className="italic">{ev.result}</span></>)}
                        </div>
                        {ev.note && (
                          <div className="mt-1 text-[10.5px] text-slate-500">{ev.note}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {item.accion && (
            <div className="p-2 rounded-md bg-amber-50 border border-amber-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Acción sugerida</div>
              <div className="text-amber-800">{item.accion}</div>
            </div>
          )}
          {item.proximoResponsable && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Próximo responsable</span>
              <span className="text-[11.5px] font-semibold text-slate-800">{item.proximoResponsable}</span>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

const StageBlock = ({ stage, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = STAGE_ICON[stage.id] || PlayCircle;
  const summary = stage.items.reduce(
    (a, it) => {
      a[it.status] = (a[it.status] || 0) + 1;
      return a;
    },
    {},
  );
  const noAplica = summary.no_aplica || 0;
  const total = stage.items.length - noAplica;
  const completos = summary.completo || 0;
  const pendientes = summary.pendiente || 0;
  const observados = summary.observado || 0;
  const automaticos = summary.automatico || 0;
  const hasObs = observados > 0;

  return (
    <div
      data-testid={`tl-stage-${stage.id}`}
      className={`relative rounded-lg border ${hasObs ? 'border-red-200' : 'border-slate-200'} bg-white`}
    >
      {/* Conector vertical entre stages: pequeña línea hacia la siguiente card. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid={`tl-stage-toggle-${stage.id}`}
        className="w-full text-left px-4 py-3.5 flex items-center gap-3"
      >
        <span className={`relative w-9 h-9 rounded-full grid place-items-center shrink-0 ${
          hasObs ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-slate-100 border border-slate-200 text-slate-700'
        }`}>
          <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-slate-900 leading-tight">{stage.label}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
            <span><span className="font-semibold text-slate-900">{completos + automaticos}</span> / {total} completos</span>
            {pendientes > 0 && <span><span className="font-semibold text-slate-700">{pendientes}</span> pendientes</span>}
            {observados > 0 && <span className="text-red-700"><span className="font-semibold">{observados}</span> observados</span>}
            {noAplica > 0 && <span className="text-slate-400"><span className="font-semibold">{noAplica}</span> no aplica</span>}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3">
          <ol className="relative">
            <span className="absolute left-[14px] top-3 bottom-3 w-px bg-slate-200" aria-hidden />
            {stage.items.map((it) => (
              <ItemRow key={it.id} item={it} />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

const TimelineProceso = ({ op }) => {
  const stages = buildTimelineChecklist(op);

  // Stage actual: el primero que tiene items con trabajo pendiente real (excluye
  // los completos y los que no aplican). Lo abrimos por default.
  const currentStageIdx = (() => {
    for (let i = 0; i < stages.length; i++) {
      if (stages[i].items.some((it) => it.status !== 'completo' && it.status !== 'no_aplica')) return i;
    }
    return stages.length - 1;
  })();

  return (
    <section
      data-testid="timeline-proceso"
      className="mt-8 card-surface p-5"
    >
      <header className="mb-5">
        <h2 className="font-display font-bold text-[18px] text-slate-900">Timeline de la operación</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Progreso por hitos del proceso notarial. Expandí cada bloque para revisar el checklist.
        </p>
      </header>

      <div className="space-y-2.5">
        {stages.map((stage, i) => (
          <StageBlock key={stage.id} stage={stage} defaultOpen={i === currentStageIdx} />
        ))}
      </div>
    </section>
  );
};

export default TimelineProceso;
