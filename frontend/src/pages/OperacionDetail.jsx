import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Topbar } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressStepper } from '@/components/ProgressStepper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChevronLeft, MapPin, Building2, DollarSign, FileText, ShieldAlert, CheckCircle2,
  CircleDot, Circle, Clock, ChevronRight, AlertTriangle, FileSignature, Download,
  MessageSquarePlus, MoreHorizontal, Sparkles, ExternalLink, Hash, Phone, Mail
} from 'lucide-react';
import {
  operaciones, pasos, alertas as alertasAll, eventos, documentos, estadoLabel, riesgoLabel
} from '@/lib/mockData';

const eventoIcon = {
  documento: FileText, alerta: AlertTriangle, decision: FileSignature,
  pago: DollarSign, gestion: Building2, apertura: CircleDot,
};
const eventoColor = {
  documento: 'info', alerta: 'destructive', decision: 'primary',
  pago: 'success', gestion: 'warning', apertura: 'muted',
};

const ParticipantCard = ({ rol, parte }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground grid place-items-center font-bold text-[13px] shrink-0">
      {parte.avatar}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{rol}</span>
        {parte.verificado ? (
          <CheckCircle2 className="w-3 h-3 text-success" />
        ) : (
          <AlertTriangle className="w-3 h-3 text-warning" />
        )}
      </div>
      <div className="font-semibold text-[14px] text-foreground truncate">{parte.nombre}</div>
      <div className="text-[11px] text-muted-foreground">DNI {parte.dni}</div>
    </div>
    <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8">
      <MoreHorizontal className="w-4 h-4" />
    </Button>
  </div>
);

const documentoEstado = {
  validado: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-soft', label: 'Validado' },
  alerta: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive-soft', label: 'Atención' },
  pendiente: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pendiente' },
};

const OperacionDetail = () => {
  const { id } = useParams();
  const op = operaciones.find(o => o.id === id) || operaciones[0];
  const e = estadoLabel[op.estado];
  const r = riesgoLabel[op.riesgo];
  const observado = op.estado === 'observado';
  const opAlertas = alertasAll.filter(a => a.operacionId === op.id);

  const [tab, setTab] = useState('resumen');

  return (
    <>
      <Topbar
        title={op.direccion}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <Link to="/operaciones" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-3 h-3" /> Operaciones
            </Link>
            <span>/</span>
            <span className="font-mono">{op.id}</span>
          </span>
        }
      />

      <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
        {/* Hero header */}
        <div className="card-surface p-6 lg:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <StatusBadge variant={e.color}>{e.label}</StatusBadge>
                <StatusBadge variant={r.color}>{r.label}</StatusBadge>
                {observado && <StatusBadge variant="destructive" dot={false}>
                  <AlertTriangle className="w-3 h-3" />
                  Atención requerida
                </StatusBadge>}
              </div>
              <h1 className="font-display font-bold text-[28px] lg:text-[32px] text-foreground leading-tight text-balance">{op.direccion}</h1>
              <div className="text-[14px] text-muted-foreground mt-1.5 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {op.barrio}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {op.tipo}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Matrícula {op.matricula}</span>
              </div>

              {/* Quick metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Precio</div>
                  <div className="font-display font-bold text-[20px] text-foreground num-tabular">
                    {op.moneda} {op.precio.toLocaleString('es-AR')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">UC / UF</div>
                  <div className="font-display font-bold text-[20px] text-foreground num-tabular">{op.uc} <span className="text-muted-foreground font-normal">/</span> {op.uf}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Firma tentativa</div>
                  <div className="font-display font-bold text-[20px] text-foreground">{op.firma.slice(0,5)}</div>
                  <div className="text-[11px] text-destructive font-semibold">en {op.diasFirma} días</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Responsable</div>
                  <div className="font-semibold text-[14px] text-foreground">Gestoría AVN</div>
                  <div className="text-[11px] text-muted-foreground">Esc. M.I. Lagos</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:items-end">
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <MessageSquarePlus className="w-4 h-4" /> Nota interna
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" /> Exportar
                </Button>
              </div>
              <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                <FileSignature className="w-4 h-4" /> Programar firma
              </Button>
            </div>
          </div>

          {/* Stepper */}
          <div className="relative mt-8 pt-6 border-t border-border">
            <ProgressStepper pasos={pasos} pasoActual={op.pasoActual} observado={observado} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-card border border-border h-11 p-1">
            <TabsTrigger value="resumen" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4">Resumen</TabsTrigger>
            <TabsTrigger value="documentos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4">
              Documentos <span className="ml-1.5 text-[10px] opacity-80">{documentos.length}</span>
            </TabsTrigger>
            <TabsTrigger value="eventos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4">
              Timeline <span className="ml-1.5 text-[10px] opacity-80">{eventos.length}</span>
            </TabsTrigger>
            <TabsTrigger value="pagos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4">Pagos</TabsTrigger>
          </TabsList>

          {/* RESUMEN */}
          <TabsContent value="resumen" className="mt-5">
            <div className="grid grid-cols-12 gap-5">
              {/* Left */}
              <div className="col-span-12 lg:col-span-8 space-y-5">
                {/* Alertas */}
                {opAlertas.length > 0 && (
                  <div className="space-y-3">
                    {opAlertas.map(a => {
                      const colorMap = {
                        critica: { bg: 'bg-destructive-soft', border: 'border-destructive/15', text: 'text-destructive', label: 'Crítica', badge: 'destructive' },
                        media: { bg: 'bg-warning-soft', border: 'border-warning/20', text: 'text-warning-foreground', label: 'Media', badge: 'warning' },
                        info: { bg: 'bg-info-soft', border: 'border-info/20', text: 'text-info', label: 'Info', badge: 'info' },
                      }[a.nivel];
                      return (
                        <div key={a.id} className={`rounded-2xl border ${colorMap.bg} ${colorMap.border} p-5`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-card border ${colorMap.border} grid place-items-center shrink-0`}>
                              <ShieldAlert className={`w-5 h-5 ${colorMap.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge variant={colorMap.badge} dot={false}>Alerta {colorMap.label}</StatusBadge>
                                <span className="text-[11px] text-muted-foreground">Prioridad {a.prioridad} · {a.responsable}</span>
                              </div>
                              <h3 className="font-display font-bold text-[18px] text-foreground mt-2 text-balance">{a.titulo}</h3>
                              <p className="text-[13px] text-foreground/75 mt-1.5 leading-relaxed">{a.descripcion}</p>

                              {a.nivel === 'critica' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 p-3 rounded-xl bg-card border border-border">
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Vence</div>
                                    <div className="font-semibold text-foreground text-[14px]">{a.vence}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Firma tentativa</div>
                                    <div className="font-semibold text-foreground text-[14px]">{a.firmaTentativa}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Impacto</div>
                                    <div className="font-semibold text-destructive text-[14px]">{a.impacto}</div>
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-card/70">
                                <Sparkles className={`w-4 h-4 ${colorMap.text} shrink-0 mt-0.5`} />
                                <div className="flex-1">
                                  <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Acción sugerida</div>
                                  <div className="text-[13px] text-foreground">{a.accion}</div>
                                </div>
                                <Button size="sm" className="bg-foreground text-card hover:bg-foreground/90 shrink-0">
                                  Resolver <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Estado del legajo */}
                <div className="card-surface p-6">
                  <h2 className="font-display font-bold text-[18px] text-foreground mb-4">Estado del legajo</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Título en estudio</div>
                      <div className="text-[14px] text-foreground">Hito 3 de 5 · Análisis notarial</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Próxima acción</div>
                      <div className="text-[14px] text-foreground">Solicitar inhibición del vendedor</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Responsable</div>
                      <div className="text-[14px] text-foreground">Gestoría</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Condición</div>
                      <div className="text-[14px] text-destructive font-semibold">Observado · Dominio vence antes de la firma</div>
                    </div>
                  </div>
                </div>

                {/* Identificación */}
                <div className="card-surface p-6">
                  <h2 className="font-display font-bold text-[18px] text-foreground mb-4">Identificación del inmueble</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Identificación registral</div>
                      <div className="font-mono font-semibold text-foreground text-[15px] mt-1">{op.matricula}</div>
                      <Link to="#" className="text-[11px] text-primary font-semibold inline-flex items-center gap-1 mt-2 hover:underline">
                        Ver en Registro <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Identificación catastral</div>
                      <div className="font-mono font-semibold text-foreground text-[15px] mt-1">Partida {op.partida}</div>
                      <div className="text-[12px] text-muted-foreground mt-1">{op.catastro}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="col-span-12 lg:col-span-4 space-y-5">
                <div className="card-surface p-5">
                  <h3 className="font-display font-bold text-[15px] text-foreground mb-4">Partes</h3>
                  <div className="space-y-3">
                    <ParticipantCard rol="Vendedor" parte={op.vendedor} />
                    <ParticipantCard rol="Comprador" parte={op.comprador} />
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <Mail className="w-3.5 h-3.5" />
                      Contactar partes
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary">Ver detalles</Button>
                  </div>
                </div>

                {/* Resumen documentos */}
                <div className="card-surface p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-[15px] text-foreground">Documentación</h3>
                    <button onClick={() => setTab('documentos')} className="text-[11px] font-semibold text-primary hover:underline">Ver todo</button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Validados', n: 6, color: 'success' },
                      { label: 'Con alerta', n: 1, color: 'destructive' },
                      { label: 'Pendientes', n: 1, color: 'warning' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                        <StatusBadge variant={s.color}>{s.label}</StatusBadge>
                        <span className="font-display font-bold text-foreground num-tabular">{s.n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* DOCUMENTOS */}
          <TabsContent value="documentos" className="mt-5">
            <div className="card-surface overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-[16px] text-foreground">Checklist documental</h2>
                  <div className="text-[12px] text-muted-foreground">8 documentos · 6 validados · 1 con alerta · 1 pendiente</div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" /> Subir documento
                </Button>
              </div>
              <div className="divide-y divide-border">
                {documentos.map(d => {
                  const de = documentoEstado[d.estado];
                  const DI = de.icon;
                  return (
                    <div key={d.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${de.bg} grid place-items-center shrink-0`}>
                        <DI className={`w-5 h-5 ${de.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-foreground">{d.nombre}</div>
                        <div className="text-[12px] text-muted-foreground">
                          {d.responsable} · {d.fecha}
                          {d.nota && <span className="ml-1.5 text-destructive font-semibold">· {d.nota}</span>}
                        </div>
                      </div>
                      <StatusBadge variant={d.estado === 'validado' ? 'success' : d.estado === 'alerta' ? 'destructive' : 'warning'}>
                        {de.label}
                      </StatusBadge>
                      <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* EVENTOS */}
          <TabsContent value="eventos" className="mt-5">
            <div className="card-surface p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-[18px] text-foreground">Timeline del legajo</h2>
                  <div className="text-[12px] text-muted-foreground">{eventos.length} eventos registrados con evidencia auditable</div>
                </div>
                <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> Exportar log</Button>
              </div>

              <ol className="relative">
                <span className="absolute left-[19px] top-2 bottom-2 w-px bg-border" aria-hidden />
                {eventos.map((ev, idx) => {
                  const Icon = eventoIcon[ev.tipo] || FileText;
                  const color = eventoColor[ev.tipo];
                  const colorClass = {
                    info: 'bg-info-soft text-info border-info/20',
                    destructive: 'bg-destructive-soft text-destructive border-destructive/20',
                    primary: 'bg-primary/10 text-primary border-primary/20',
                    success: 'bg-success-soft text-success border-success/20',
                    warning: 'bg-warning-soft text-warning-foreground border-warning/30',
                    muted: 'bg-muted text-muted-foreground border-border',
                  }[color];
                  return (
                    <li key={idx} className="relative pl-12 pb-5 last:pb-0">
                      <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl border ${colorClass} grid place-items-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[14px] text-foreground">{ev.evento}</span>
                            <StatusBadge variant={color} dot={false} className="text-[10px] uppercase">{ev.tipo}</StatusBadge>
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-0.5">
                            {ev.fecha} · {ev.hora} hs · {ev.responsable}
                          </div>
                        </div>
                        <button className="text-[12px] font-semibold text-primary hover:underline inline-flex items-center gap-1">
                          Ver {ev.evidencia} <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </TabsContent>

          {/* PAGOS */}
          <TabsContent value="pagos" className="mt-5">
            <div className="card-surface p-8 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-display font-bold text-foreground">Módulo de pagos</h3>
              <p className="text-[13px] text-muted-foreground mt-1">Seña, refuerzos y saldo de escritura — disponible próximamente.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default OperacionDetail;
