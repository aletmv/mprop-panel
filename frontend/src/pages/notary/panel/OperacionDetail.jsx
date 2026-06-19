import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { PanelShell } from './PanelShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChevronLeft, CheckCircle2, AlertTriangle, FileSignature, Download,
  MessageSquarePlus, ChevronRight, Sparkles, ExternalLink, Phone, Mail,
  FileText, DollarSign, Building2, CircleDot, Circle, Clock, Copy,
} from 'lucide-react';
import {
  operaciones as MOCK_OPERACIONES, pasos, alertas as alertasAll, eventos, documentos, estadoLabel, riesgoLabel,
} from './mockData';
import { buildNotaryOperaciones } from './operacionesAdapter';
import { BloqueoBadge } from './Kanban';
import { buyerCosts, sellerCosts } from '@/lib/costs';
import { formatUSD } from '@/data/mock';
import { useApp } from '@/context/AppContext';

const StatusDot = ({ variant = 'muted', label, className = '' }) => {
  const dot = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',
    muted: 'bg-slate-400',
    primary: 'bg-primary',
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

const PagosItemRow = ({ label, detail, amount, zero }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
    <div className="min-w-0">
      <div className="text-sm font-medium text-slate-900">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{detail}</div>
    </div>
    {zero ? (
      <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">{zero}</span>
    ) : (
      <span className="text-sm font-semibold text-slate-900 tabular-nums whitespace-nowrap">{formatUSD(amount)}</span>
    )}
  </div>
);

const PagosTab = ({ op }) => {
  const [firstHome, setFirstHome] = useState(false);
  const buyer = buyerCosts(op.precio, firstHome);
  const seller = sellerCosts(op.precio, firstHome);
  const reserva = Math.round(op.precio * 0.01);
  const sena = Math.round(op.precio * 0.04);
  const saldo = op.precio - reserva - sena;

  const sellosState = buyer.sellos.exempt ? 'exempt' : buyer.sellos.partial ? 'partial' : 'full';
  const sellosBadge = {
    exempt: { label: 'Exento', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    partial: { label: 'Exención parcial', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    full: { label: 'Sin exención', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  }[sellosState];

  return (
    <div className="grid grid-cols-12 gap-5" data-testid="pagos-tab">
      <div className="col-span-12 lg:col-span-7 space-y-5">
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Impuestos y sellos</h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Liquidación calculada sobre el precio de escritura
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${sellosBadge.cls}`}>
              {sellosBadge.label}
            </span>
          </div>

          <div className="px-5 py-4 bg-sky-50/40 border-b border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                data-testid="first-home-toggle"
                checked={firstHome}
                onChange={(e) => setFirstHome(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">
                <span className="font-semibold text-slate-900">Vivienda única, familiar y de ocupación permanente</span>
                <span className="block text-xs text-slate-600 mt-0.5">
                  CABA · Ley tarifaria. Exención total del impuesto de sellos si el valor de escritura ≤ ARS 226.000.000
                  al TC de referencia. Por encima de ese tope, el 1,75% se aplica sólo sobre el excedente.
                </span>
              </span>
            </label>
          </div>

          <div className="px-5 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500 mb-1">Comprador</div>
            <div className="divide-y divide-slate-100">
              {buyer.items.map((it, i) => (
                <PagosItemRow
                  key={i}
                  label={it.label}
                  detail={it.detail}
                  amount={it.amount}
                  zero={it.amount === 0 ? it.zeroLabel : null}
                />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div className="text-sm font-semibold text-slate-900">Total gastos comprador</div>
              <div className="text-lg font-semibold text-slate-900 tabular-nums">{formatUSD(buyer.total)}</div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500 mb-1">Vendedor</div>
            <div className="divide-y divide-slate-100">
              {seller.items.map((it, i) => (
                <PagosItemRow
                  key={i}
                  label={it.label}
                  detail={it.detail}
                  amount={it.amount}
                  zero={it.amount === 0 ? it.zeroLabel : null}
                />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div className="text-sm font-semibold text-slate-900">Total gastos vendedor</div>
              <div className="text-lg font-semibold text-slate-900 tabular-nums">{formatUSD(seller.total)}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-5 space-y-5">
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Hitos de pago</h2>
            <div className="text-xs text-slate-500 mt-0.5">Calendario económico de la operación</div>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="px-5 py-4 flex items-center justify-between gap-3" data-testid="hito-reserva">
              <div>
                <div className="text-sm font-medium text-slate-900">Reserva</div>
                <div className="text-xs text-slate-500 mt-0.5">1% · acreditada al inicio del legajo</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 tabular-nums">{formatUSD(reserva)}</div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 mt-1 inline-block">
                  Acreditada
                </span>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-3" data-testid="hito-sena">
              <div>
                <div className="text-sm font-medium text-slate-900">Seña</div>
                <div className="text-xs text-slate-500 mt-0.5">4% · 72 hs tras revisión sin observaciones</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 tabular-nums">{formatUSD(sena)}</div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 mt-1 inline-block">
                  Pendiente
                </span>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-3" data-testid="hito-saldo">
              <div>
                <div className="text-sm font-medium text-slate-900">Saldo a escriturar</div>
                <div className="text-xs text-slate-500 mt-0.5">95% · ante escribano el día de la firma</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 tabular-nums">{formatUSD(saldo)}</div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 mt-1 inline-block">
                  Programado
                </span>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-baseline">
            <div className="text-sm font-semibold text-slate-900">Precio de escritura</div>
            <div className="text-lg font-semibold text-slate-900 tabular-nums">{formatUSD(op.precio)}</div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-sky-50 to-white">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">¿Cómo se aplica la exención?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Si la propiedad será vivienda única, familiar y permanente del adquirente, la mitad del impuesto de
                sellos del comprador puede estar exenta total o parcialmente. Activá el switch para ver el cálculo
                actualizado.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const OperacionDetail = () => {
  const { id } = useParams();
  const ctx = useApp();
  const { notarySession } = ctx;
  const operaciones = buildNotaryOperaciones(ctx, MOCK_OPERACIONES);
  const op = operaciones.find((o) => o.id === id) || operaciones[0];
  const e = estadoLabel[op.estado];
  const r = riesgoLabel[op.riesgo];
  const observado = op.estado === 'observado';
  const opAlertas = alertasAll.filter((a) => a.operacionId === op.id);
  const pasoIdx = pasos.findIndex((p) => p === op.pasoActual);
  const fase = pasoIdx >= 0 ? pasoIdx + 1 : 1;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialTab = searchParams.get('tab') || 'resumen';
  const [tab, setTab] = useState(initialTab);

  // Scroll suave al rol pedido (ej. #vendedor / #comprador) si el tab es "partes".
  useEffect(() => {
    if (tab !== 'partes') return;
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`party-${hash}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 1800);
      }
    }, 120);
    return () => clearTimeout(t);
  }, [tab, location.hash]);

  if (!notarySession) return <Navigate to="/escribanos" replace />;

  return (
    <PanelShell>
      <div className="bg-background min-h-screen">
        <header
          className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200"
          data-testid="legajo-detail-header"
        >
          <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-3 flex items-center gap-4">
            <Link
              to="/escribanos/operaciones"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              data-testid="back-to-operaciones-link"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Legajos</span>
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-sm text-slate-700 tracking-tight" data-testid="legajo-id">
                {op.id}
              </span>
              <button
                className="text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Copiar ID"
                data-testid="copy-legajo-id"
              >
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <StatusDot variant={e.color} label={e.label} />
              <BloqueoBadge op={op} size="md" />
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
                className="bg-primary text-primary-foreground hover:opacity-90 font-medium px-4 h-9 shadow-sm transition-colors"
                data-testid="btn-programar-firma"
              >
                <FileSignature className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Programar firma
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-6 md:py-8 space-y-6">
          {opAlertas.length > 0 && (
            <div className="space-y-3" data-testid="alerts-zone">
              {opAlertas
                .filter((a) => a.nivel === 'critica' || a.nivel === 'media')
                .map((a) => {
                  const isCrit = a.nivel === 'critica';
                  const cfg = isCrit
                    ? { wrap: 'bg-red-50 border-l-4 border-red-500', icon: 'text-red-600', label: 'Crítica', pill: 'destructive' }
                    : { wrap: 'bg-white border border-slate-200 border-l-4 border-l-amber-500', icon: 'text-amber-600', label: 'Media', pill: 'warning' };
                  return (
                    <div key={a.id} className={`${cfg.wrap} p-4 rounded-r-lg flex gap-3`} data-testid={`alert-${a.id}`}>
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
                            className="bg-slate-900 text-white hover:bg-slate-800 font-medium px-3 h-8 shadow-sm transition-colors"
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

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="executive-snapshot">
            <Card className="p-5">
              <SectionLabel>Inmueble</SectionLabel>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mt-2 leading-snug">{op.direccion}</h2>
              <div className="text-sm text-slate-500 mt-0.5">{op.barrio} · {op.tipo}</div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <SectionLabel>Precio acordado</SectionLabel>
                <div className="text-2xl font-semibold tracking-tight text-slate-900 mt-1 tabular-nums">
                  <span className="text-sm text-slate-500 font-medium mr-1">{op.moneda}</span>
                  {op.precio.toLocaleString('es-AR')}
                </div>
              </div>
            </Card>

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
                <Link
                  to="/escribanos/agenda"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                  data-testid="link-ver-agenda"
                >
                  Ver en agenda <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </Card>

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
                    GS
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">Gestoría asignada</div>
                    <div className="text-xs text-slate-500">Asistente del legajo</div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

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
                  className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-colors"
                  data-testid={`tab-${t.v}`}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

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
                        <div className="text-sm font-medium text-slate-900 mt-1">Gestoría asignada</div>
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
                        className="text-xs font-medium text-primary hover:underline"
                        data-testid="resumen-ver-documentos"
                      >
                        Ver todo
                      </button>
                    </div>
                    <div className="p-5 space-y-2.5">
                      {[
                        { label: 'Revisados', n: 6, v: 'success' },
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
                        <div
                          key={rol}
                          id={`party-${rol.toLowerCase()}`}
                          className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors rounded-lg"
                        >
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
                            <button className="hover:text-slate-700 transition-colors" aria-label="Llamar">
                              <Phone className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button className="hover:text-slate-700 transition-colors" aria-label="Email">
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
                          <a href="#" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
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

            <TabsContent value="documentos" className="mt-6" data-testid="tab-content-documentos">
              <Card>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Checklist documental</h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      8 documentos · 6 revisados · 1 con alerta · 1 pendiente
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-primary hover:bg-sky-50 font-medium px-3 h-9"
                    data-testid="btn-subir-documento"
                  >
                    <FileText className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Subir documento
                  </Button>
                </div>
                <div className="divide-y divide-slate-100">
                  {documentos.map((d) => {
                    const cfg = {
                      revisado: { icon: CheckCircle2, dot: 'success', label: 'Revisado', tint: 'text-emerald-600' },
                      alerta: { icon: AlertTriangle, dot: 'destructive', label: 'Atención', tint: 'text-red-600' },
                      pendiente: { icon: Circle, dot: 'warning', label: 'Pendiente', tint: 'text-amber-600' },
                    }[d.estado];
                    const I = cfg.icon;
                    return (
                      <div
                        key={d.id}
                        className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
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
                          className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
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

            <TabsContent value="timeline" className="mt-6" data-testid="tab-content-timeline">
              <Card>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Línea de tiempo</h2>
                    <div className="text-xs text-slate-500 mt-0.5">{eventos.length} eventos auditables</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-primary hover:bg-sky-50 font-medium px-3 h-9"
                    data-testid="btn-exportar-log"
                  >
                    <Download className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Exportar log
                  </Button>
                </div>

                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    {pasos.map((p, i) => {
                      const done = i < pasoIdx;
                      const current = i === pasoIdx;
                      return (
                        <React.Fragment key={p}>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              done ? 'text-emerald-600' : current ? 'text-primary' : 'text-slate-400'
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
                          <button className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0">
                            Ver {ev.evidencia} <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="pagos" className="mt-6" data-testid="tab-content-pagos">
              <PagosTab op={op} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PanelShell>
  );
};

export default OperacionDetail;
