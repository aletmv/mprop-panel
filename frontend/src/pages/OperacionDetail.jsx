import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChevronLeft, CheckCircle2, AlertTriangle, FileSignature, Download,
  MessageSquarePlus, ChevronRight, Sparkles, ExternalLink, Phone, Mail,
  FileText, DollarSign, Building2, CircleDot, Circle, Clock, Copy,
} from 'lucide-react';
import {
  operaciones, pasos, alertas as alertasAll, eventos, documentos, estadoLabel, riesgoLabel,
} from '@/lib/mockData';

/* =========================================================================
   Atoms (institutional MP-style)
   ========================================================================= */

const StatusDot = ({ variant = 'muted', label, className = '' }) => {
  const dot = {
    success: 'bg-[hsl(var(--success))]',
    warning: 'bg-[hsl(var(--warning))]',
    destructive: 'bg-[hsl(var(--destructive))]',
    info: 'bg-[hsl(var(--info))]',
    muted: 'bg-slate-400',
    primary: 'bg-[hsl(var(--primary))]',
  }[variant];
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium text-slate-700 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

const Pill = ({ variant = 'muted', children, className = '' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    destructive: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    muted: 'bg-slate-50 text-slate-600 border-slate-200',
    primary: 'bg-sky-50 text-sky-700 border-sky-200',
  }[variant];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}>
      {children}
    </span>
  );
};

const SectionLabel = ({ children }) => (
  <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500">{children}</div>
);

const Card = ({ children, className = '', ...rest }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`} {...rest}>
    {children}
  </div>
);

/* =========================================================================
   Page
   ========================================================================= */

const OperacionDetail = () => {
  const { id } = useParams();
  const op = operaciones.find((o) => o.id === id) || operaciones[0];
  const e = estadoLabel[op.estado];
  const r = riesgoLabel[op.riesgo];
  const observado = op.estado === 'observado';
  const opAlertas = alertasAll.filter((a) => a.operacionId === op.id);
  const pasoIdx = pasos.findIndex((p) => p === op.pasoActual);
  const fase = pasoIdx >= 0 ? pasoIdx + 1 : 1;

  const [tab, setTab] = useState('resumen');

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen">
      {/* ============================================
          ZONE A — Sticky compact header
          ============================================ */}
      <header
        className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200"
        data-testid="legajo-detail-header"
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-3 flex items-center gap-4">
          <Link
            to="/operaciones"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors duration-150"
            data-testid="back-to-operaciones-link"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Operaciones</span>
          </Link>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm text-slate-700 tracking-tight" data-testid="legajo-id">
              {op.id}
            </span>
            <button
              className="text-slate-400 hover:text-slate-700 transition-colors duration-150"
              aria-label="Copiar ID"
              data-testid="copy-legajo-id"
            >
              <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <StatusDot variant={e.color} label={e.label} />
            {observado && <Pill variant="destructive">Atención requerida</Pill>}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium px-3 h-9 hidden lg:inline-flex"
              data-testid="btn-nota-interna"
            >
              <MessageSquarePlus className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Nota
            </Button>
            <Button
              variant="ghost"
              className="text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium px-3 h-9 hidden lg:inline-flex"
              data-testid="btn-exportar"
            >
              <Download className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Exportar
            </Button>
            <Button
              className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(200_100%_40%)] font-medium px-4 h-9 shadow-sm transition-colors duration-150"
              data-testid="btn-programar-firma"
            >
              <FileSignature className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Programar firma
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-6 md:py-8 space-y-6">
        {/* ============================================
            ZONE B — Active alerts banner (only if any)
            ============================================ */}
        {opAlertas.length > 0 && (
          <div className="space-y-3" data-testid="alerts-zone">
            {opAlertas
              .filter((a) => a.nivel === 'critica' || a.nivel === 'media')
              .map((a) => {
                const isCrit = a.nivel === 'critica';
                const cfg = isCrit
                  ? { wrap: 'bg-red-50 border-l-4 border-red-500', icon: 'text-red-600', label: 'Crítica', pill: 'destructive' }
                  : { wrap: 'bg-amber-50 border-l-4 border-amber-500', icon: 'text-amber-600', label: 'Media', pill: 'warning' };
                return (
                  <div
                    key={a.id}
                    className={`${cfg.wrap} p-4 rounded-r-lg flex gap-3`}
                    data-testid={`alert-${a.id}`}
                  >
                    <AlertTriangle className={`w-5 h-5 ${cfg.icon} shrink-0 mt-0.5`} strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Pill variant={cfg.pill}>Alerta {cfg.label}</Pill>
                        <span className="text-xs text-slate-500">{a.responsable} · Prioridad {a.prioridad}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mt-1.5 leading-snug">{a.titulo}</h3>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{a.descripcion}</p>

                      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                        <div className="inline-flex items-start gap-1.5 text-sm text-slate-700">
                          <Sparkles className={`w-4 h-4 ${cfg.icon} shrink-0 mt-0.5`} strokeWidth={1.5} />
                          <span><span className="text-slate-500">Acción sugerida ·</span> {a.accion}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-slate-900 text-white hover:bg-slate-800 font-medium px-3 h-8 shadow-sm transition-colors duration-150"
                          data-testid={`btn-resolver-${a.id}`}
                        >
                          Resolver <ChevronRight className="w-3.5 h-3.5 ml-0.5" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* ============================================
            ZONE C — Executive snapshot (4 clean cards)
            ============================================ */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="executive-snapshot">
          {/* Card 1 · Inmueble + precio */}
          <Card className="p-5">
            <SectionLabel>Inmueble</SectionLabel>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 mt-2 leading-snug">
              {op.direccion}
            </h2>
            <div className="text-sm text-slate-500 mt-0.5">{op.barrio} · {op.tipo}</div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <SectionLabel>Precio acordado</SectionLabel>
              <div className="text-2xl font-semibold tracking-tight text-slate-900 mt-1 tabular-nums">
                <span className="text-sm text-slate-500 font-medium mr-1">{op.moneda}</span>
                {op.precio.toLocaleString('es-AR')}
              </div>
            </div>
          </Card>

          {/* Card 2 · Estado + próxima acción */}
          <Card className="p-5">
            <SectionLabel>Estado actual</SectionLabel>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusDot variant={e.color} label={e.label} />
              <Pill variant={r.color}>{r.label}</Pill>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <SectionLabel>Fase</SectionLabel>
                <span className="text-xs text-slate-500 font-medium">{fase} de {pasos.length}</span>
              </div>
              <div className="text-sm font-medium text-slate-900 mt-1">{op.pasoActual}</div>
              <div className="text-sm text-slate-600 mt-2 leading-relaxed">
                <span className="text-slate-500">Próxima · </span>
                Solicitar inhibición del vendedor
              </div>
            </div>
          </Card>

          {/* Card 3 · Firma */}
          <Card className="p-5">
            <SectionLabel>Firma tentativa</SectionLabel>
            <div className="text-lg font-semibold tracking-tight text-slate-900 mt-2 tabular-nums">{op.firma}</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-sm">
              <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              <span className={op.diasFirma <= 5 ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                {op.diasFirma > 0 ? `en ${op.diasFirma} días` : op.diasFirma === 0 ? 'hoy' : `hace ${Math.abs(op.diasFirma)} días`}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                className="text-sm font-medium text-[hsl(var(--primary))] hover:underline inline-flex items-center gap-1"
                data-testid="link-ver-agenda"
              >
                Ver en agenda <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </Card>

          {/* Card 4 · Responsables */}
          <Card className="p-5">
            <SectionLabel>Responsables</SectionLabel>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 grid place-items-center text-xs font-semibold">
                  ML
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">Esc. M.I. Lagos</div>
                  <div className="text-xs text-slate-500">Escribana titular</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 grid place-items-center text-xs font-semibold">
                  AV
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">Gestoría AVN</div>
                  <div className="text-xs text-slate-500">Asistente del legajo</div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ============================================
            ZONE D — Progressive disclosure tabs
            ============================================ */}
        <Tabs value={tab} onValueChange={setTab} data-testid="legajo-tabs">
          <TabsList className="bg-transparent border-b border-slate-200 rounded-none p-0 h-auto w-full justify-start overflow-x-auto">
            {[
              { v: 'resumen', label: 'Resumen' },
              { v: 'partes', label: 'Partes e inmueble' },
              { v: 'documentos', label: `Documentos · ${documentos.length}` },
              { v: 'timeline', label: 'Timeline' },
              { v: 'pagos', label: 'Pagos' },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:border-[hsl(var(--primary))] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-colors duration-150"
                data-testid={`tab-${t.v}`}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* RESUMEN — minimal, executive */}
          <TabsContent value="resumen" className="mt-6" data-testid="tab-content-resumen">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-8 space-y-5">
                <Card>
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Condición del legajo</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <SectionLabel>Título</SectionLabel>
                      <div className="text-sm font-medium text-slate-900 mt-1">En estudio · Análisis notarial</div>
                    </div>
                    <div>
                      <SectionLabel>Próxima acción</SectionLabel>
                      <div className="text-sm font-medium text-slate-900 mt-1">Solicitar inhibición del vendedor</div>
                    </div>
                    <div>
                      <SectionLabel>Responsable de la acción</SectionLabel>
                      <div className="text-sm font-medium text-slate-900 mt-1">Gestoría AVN</div>
                    </div>
                    <div>
                      <SectionLabel>Condición</SectionLabel>
                      <div className="text-sm font-medium text-red-600 mt-1">
                        {observado ? 'Observado · Dominio vence antes de la firma' : 'Sin observaciones'}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-5">
                <Card>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Documentación</h3>
                    <button
                      onClick={() => setTab('documentos')}
                      className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                      data-testid="resumen-ver-documentos"
                    >
                      Ver todo
                    </button>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {[
                      { label: 'Validados', n: 6, v: 'success' },
                      { label: 'Con alerta', n: 1, v: 'destructive' },
                      { label: 'Pendientes', n: 1, v: 'warning' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between py-1">
                        <StatusDot variant={s.v} label={s.label} />
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{s.n}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* PARTES E INMUEBLE */}
          <TabsContent value="partes" className="mt-6" data-testid="tab-content-partes">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-7 space-y-5">
                <Card>
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Partes</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { rol: 'Vendedor', parte: op.vendedor },
                      { rol: 'Comprador', parte: op.comprador },
                    ].map(({ rol, parte }) => (
                      <div key={rol} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors duration-150">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 grid place-items-center text-xs font-semibold shrink-0">
                          {parte.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <SectionLabel>{rol}</SectionLabel>
                          <div className="text-sm font-medium text-slate-900 mt-0.5 truncate">{parte.nombre}</div>
                          <div className="text-xs text-slate-500 font-mono">DNI {parte.dni}</div>
                        </div>
                        {parte.verificado ? (
                          <Pill variant="success">
                            <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2} /> Verificado
                          </Pill>
                        ) : (
                          <Pill variant="warning">
                            <AlertTriangle className="w-3 h-3 mr-1" strokeWidth={2} /> Pendiente
                          </Pill>
                        )}
                        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                          <button className="hover:text-slate-700 transition-colors duration-150" aria-label="Llamar">
                            <Phone className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button className="hover:text-slate-700 transition-colors duration-150" aria-label="Email">
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="col-span-12 lg:col-span-5 space-y-5">
                <Card>
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Identificación del inmueble</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <SectionLabel>Matrícula registral</SectionLabel>
                      <div className="flex items-center justify-between mt-1">
                        <div className="font-mono text-sm text-slate-900 tracking-tight">{op.matricula}</div>
                        <a href="#" className="text-xs font-medium text-[hsl(var(--primary))] hover:underline inline-flex items-center gap-1">
                          Ver en Registro <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                        </a>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <SectionLabel>Partida catastral</SectionLabel>
                      <div className="font-mono text-sm text-slate-900 tracking-tight mt-1">Partida {op.partida}</div>
                      <div className="text-xs text-slate-500 mt-1">{op.catastro}</div>
                    </div>
                    <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <SectionLabel>UC</SectionLabel>
                        <div className="text-sm font-medium text-slate-900 mt-1 tabular-nums">{op.uc}</div>
                      </div>
                      <div>
                        <SectionLabel>UF</SectionLabel>
                        <div className="text-sm font-medium text-slate-900 mt-1">{op.uf}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* DOCUMENTOS */}
          <TabsContent value="documentos" className="mt-6" data-testid="tab-content-documentos">
            <Card>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Checklist documental</h2>
                  <div className="text-xs text-slate-500 mt-0.5">8 documentos · 6 validados · 1 con alerta · 1 pendiente</div>
                </div>
                <Button
                  variant="ghost"
                  className="text-[hsl(var(--primary))] hover:bg-sky-50 font-medium px-3 h-9"
                  data-testid="btn-subir-documento"
                >
                  <FileText className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Subir documento
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {documentos.map((d) => {
                  const cfg = {
                    validado: { icon: CheckCircle2, dot: 'success', label: 'Validado', tint: 'text-emerald-600' },
                    alerta: { icon: AlertTriangle, dot: 'destructive', label: 'Atención', tint: 'text-red-600' },
                    pendiente: { icon: Circle, dot: 'warning', label: 'Pendiente', tint: 'text-amber-600' },
                  }[d.estado];
                  const I = cfg.icon;
                  return (
                    <div
                      key={d.id}
                      className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors duration-150"
                      data-testid={`documento-${d.id}`}
                    >
                      <I className={`w-5 h-5 ${cfg.tint} shrink-0`} strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900">{d.nombre}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {d.responsable} · {d.fecha}
                          {d.nota && <span className="ml-1.5 text-red-600 font-medium">· {d.nota}</span>}
                        </div>
                      </div>
                      <Pill variant={cfg.dot}>{cfg.label}</Pill>
                      <button
                        className="text-slate-400 hover:text-slate-700 transition-colors duration-150 shrink-0"
                        aria-label="Descargar"
                      >
                        <Download className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* TIMELINE */}
          <TabsContent value="timeline" className="mt-6" data-testid="tab-content-timeline">
            <Card>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Línea de tiempo</h2>
                  <div className="text-xs text-slate-500 mt-0.5">{eventos.length} eventos auditables</div>
                </div>
                <Button
                  variant="ghost"
                  className="text-[hsl(var(--primary))] hover:bg-sky-50 font-medium px-3 h-9"
                  data-testid="btn-exportar-log"
                >
                  <Download className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Exportar log
                </Button>
              </div>

              {/* Phase ribbon (text-based, not chunky stepper) */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 flex-wrap">
                  {pasos.map((p, i) => {
                    const done = i < pasoIdx;
                    const current = i === pasoIdx;
                    return (
                      <React.Fragment key={p}>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            done ? 'text-emerald-600' : current ? 'text-[hsl(var(--primary))]' : 'text-slate-400'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                          ) : current ? (
                            <CircleDot className="w-3.5 h-3.5" strokeWidth={2} />
                          ) : (
                            <Circle className="w-3.5 h-3.5" strokeWidth={1.5} />
                          )}
                          {p}
                        </span>
                        {i < pasos.length - 1 && <span className="text-slate-300 text-xs">—</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <ol className="p-5 relative">
                <span className="absolute left-[33px] top-7 bottom-7 w-px bg-slate-200" aria-hidden />
                {eventos.map((ev, idx) => {
                  const Icon = {
                    documento: FileText,
                    alerta: AlertTriangle,
                    decision: FileSignature,
                    pago: DollarSign,
                    gestion: Building2,
                    apertura: CircleDot,
                  }[ev.tipo] || FileText;
                  return (
                    <li key={idx} className="relative pl-12 pb-5 last:pb-0">
                      <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-white border border-slate-200 grid place-items-center">
                        <Icon className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                      </div>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900">{ev.evento}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {ev.fecha} · {ev.hora} hs · {ev.responsable}
                          </div>
                        </div>
                        <button className="text-xs font-medium text-[hsl(var(--primary))] hover:underline inline-flex items-center gap-1 shrink-0">
                          Ver {ev.evidencia} <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </TabsContent>

          {/* PAGOS — placeholder */}
          <TabsContent value="pagos" className="mt-6" data-testid="tab-content-pagos">
            <Card className="p-10 text-center">
              <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-slate-900">Módulo de pagos</h3>
              <p className="text-sm text-slate-500 mt-1">Seña, refuerzos y saldo de escritura · disponible próximamente.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OperacionDetail;
