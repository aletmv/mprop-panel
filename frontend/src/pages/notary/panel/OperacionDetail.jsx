import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { PanelShell } from './PanelShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChevronLeft, CheckCircle2, AlertTriangle, FileSignature, Download,
  MessageSquarePlus, ChevronRight, Sparkles, ExternalLink, Phone, Mail,
  FileText, DollarSign, Building2, CircleDot, Circle, Clock, Copy, Wallet,
  CalendarClock, ShieldCheck, Plus,
} from 'lucide-react';
import {
  operaciones as MOCK_OPERACIONES, pasos, alertas as alertasAll, estadoLabel, riesgoLabel, bloqueoLabel,
} from './mockData';
import { getDocumentosByOp, getEventosByOp } from './legajoDocsEventos';
import { buildNotaryOperaciones } from './operacionesAdapter';
import { BloqueoBadge } from './Kanban';
import { useSignatures, signatures } from './signaturesStore';
import { ProgramarFirmaDialog } from './ProgramarFirmaDialog';
import { operationalTasks, useOperationalTasks } from './operationalTasksStore';
import TimelineProceso from './TimelineProceso';
import { buyerCosts, sellerCosts } from '@/lib/costs';
import {
  RESERVATION_PCT,
  DOWN_PAYMENT_PCT,
  closingBalanceAmount,
  ECONOMIC_STATUS,
} from './vault';
import { formatUSD } from '@/data/mock';
import { useApp } from '@/context/AppContext';
import { StatusDot, Pill, SectionLabel, Card } from './OperacionDetailPrimitives';
import { OperationalTaskMemory } from './OperationalTaskMemory';
import { PagosItemRow, HitoRow } from './BovedaPrimitives';

// ─── Bóveda de la operación ──────────────────────────────────────────────
// Calendario económico completo: hitos MercadoPago/MercadoProp + liquidación
// de comprador y vendedor + saldo a escriturar como hito programado ante
// escribanía (visualmente diferenciado, NO marcado como pago registrado).
//
// Fuente de verdad: /app/DEMO_MOCK_MAP.md §2.6, §2.7 y §2.8.

const BovedaTab = ({ op }) => {
  const [firstHome, setFirstHome] = useState(false);
  const reserva = Math.round(op.precio * RESERVATION_PCT);
  const sena = Math.round(op.precio * DOWN_PAYMENT_PCT);
  const closing = closingBalanceAmount(op.precio);
  const buyer = buyerCosts(op.precio, firstHome);
  const seller = sellerCosts(op.precio, firstHome);

  // Estado de los hitos derivado de los eventos económicos de la Bóveda.
  const events = op.economicEvents || [];
  const hasEvent = (t) => events.some((e) => e.type === t);

  const reservaPill = hasEvent('reservation_accredited')
    ? { label: 'Pago registrado', variant: 'success' }
    : { label: 'A integrar', variant: 'muted' };

  let senaPill;
  if (hasEvent('down_payment_accredited')) {
    senaPill = { label: 'Pago registrado', variant: 'success' };
  } else if (hasEvent('down_payment_enabled')) {
    senaPill = { label: 'Habilitada', variant: 'info' };
  } else if (hasEvent('down_payment_pending_enablement')) {
    senaPill = { label: 'Pendiente de habilitación', variant: 'warning' };
  } else {
    senaPill = { label: 'A integrar', variant: 'muted' };
  }

  const closingPill = { label: 'Programado ante escribanía', variant: 'muted' };

  const sellosState = buyer.sellos.exempt ? 'exempt' : buyer.sellos.partial ? 'partial' : 'full';
  const sellosBadge = {
    exempt: { label: 'Exento', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    partial: { label: 'Exención parcial', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    full: { label: 'Sin exención', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  }[sellosState];

  const statusMeta = ECONOMIC_STATUS[op.economicStatus] || ECONOMIC_STATUS.reserva_acreditada;

  // Movimientos efectivos en la Bóveda: sumamos los importes de los eventos que
  // representan dinero ya ingresado al ecosistema MercadoPago (reserva acreditada,
  // seña acreditada o seña pendiente de habilitación notarial).
  const MOVEMENT_TYPES = new Set([
    'reservation_accredited',
    'down_payment_accredited',
    'down_payment_pending_enablement',
  ]);
  const movementsTotal = events
    .filter((e) => MOVEMENT_TYPES.has(e.type) && e.amount)
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="grid grid-cols-12 gap-5" data-testid="boveda-tab">
      <div className="col-span-12 lg:col-span-7 space-y-5">

        {/* Hitos MercadoPago/MercadoProp */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Hitos MercadoPago/MercadoProp</h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Pagos procesados dentro de la Bóveda
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
              Trazado por MercadoPago
            </span>
          </div>

          <HitoRow
            testid="hito-reserva"
            label="Reserva"
            subtitle="1% del precio · al inicio de la operación"
            amount={reserva}
            pill={reservaPill}
            accent="mp"
          />
          <HitoRow
            testid="hito-sena"
            label="Seña"
            subtitle="4% del precio · habilitación notarial requerida"
            amount={sena}
            pill={senaPill}
            accent="mp"
          />
        </Card>

        {/* Saldo a escriturar — visualmente diferenciado */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Saldo a escriturar</h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Hito programado ante escribanía · no se procesa por MercadoPago
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
              <CalendarClock className="w-3.5 h-3.5" strokeWidth={1.75} />
              Ante escribanía
            </span>
          </div>

          <HitoRow
            testid="hito-saldo"
            label="Pago ante escribanía"
            subtitle="95% del precio · el día de la firma"
            amount={closing}
            pill={closingPill}
            accent="notary"
          />

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-600 leading-relaxed">
            El saldo a escriturar se integra directamente ante la escribanía el día de la firma.
            No figura como pago registrado por MercadoPago.
          </div>
        </Card>

        {/* Liquidación comprador */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Liquidación · Comprador</h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Impuestos y gastos calculados sobre el precio de escritura
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
              <div className="text-sm font-semibold text-slate-900">Total comprador</div>
              <div className="text-lg font-semibold text-slate-900 tabular-nums" data-testid="buyer-total">
                {formatUSD(buyer.total)}
              </div>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Importes a abonar · calculados</div>
          </div>
        </Card>

        {/* Liquidación vendedor */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Liquidación · Vendedor</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Impuestos y gastos calculados sobre el precio de escritura
            </div>
          </div>
          <div className="px-5 py-4">
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
              <div className="text-sm font-semibold text-slate-900">Total vendedor</div>
              <div className="text-lg font-semibold text-slate-900 tabular-nums" data-testid="seller-total">
                {formatUSD(seller.total)}
              </div>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Importes a abonar · calculados</div>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-5 space-y-5">
        {/* Resumen de la Bóveda */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 grid place-items-center shrink-0">
              <Wallet className="w-4.5 h-4.5 text-sky-700" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">Bóveda de la operación</h2>
              <div className="text-xs text-slate-500 mt-0.5">Trazabilidad económica MercadoProp</div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-slate-500">Estado económico</div>
              <Pill variant={statusMeta.tone}>{statusMeta.label}</Pill>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-slate-500">Precio de escritura</div>
              <div className="text-sm font-semibold text-slate-900 tabular-nums">{formatUSD(op.precio)}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-slate-500">Movimientos en Bóveda</div>
              <div className="text-sm font-semibold text-slate-900 tabular-nums">{formatUSD(movementsTotal)}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-slate-500">Programado ante escribanía</div>
              <div className="text-sm font-semibold text-slate-900 tabular-nums">{formatUSD(closing)}</div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 leading-relaxed">
            Eventos económicos registrados y validados automáticamente dentro del ecosistema MercadoPago/MercadoProp.
            La escribanía consulta y audita; no concilia ni valida pagos manualmente.
          </div>
        </Card>

        {/* Helper de exención */}
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
  // Documentos y eventos scoped por legajo (P0 demo integrity). Conteos y lista
  // visible salen SIEMPRE del mismo array scoped.
  const docs = getDocumentosByOp(op);
  // Firma programada (demo Fase D) — store local aditivo; NO muta op.firma.
  useSignatures();
  const firmaProgramada = signatures.getByOp(op.id);
  const fmtFechaCorta = (yyyymmdd) => {
    if (!yyyymmdd) return '';
    const [y, m, d] = yyyymmdd.split('-');
    return d && m ? `${d}/${m}` : yyyymmdd;
  };
  // Evento mock signature_scheduled inyectado SOLO en el punto de consumo
  // (no se toca el generador legajoDocsEventos). Se antepone a la bitácora.
  const evs = firmaProgramada
    ? [
        {
          fecha: fmtFechaCorta(firmaProgramada.fecha),
          hora: firmaProgramada.hora,
          tipo: 'signature_scheduled',
          evento: `Firma programada para ${fmtFechaCorta(firmaProgramada.fecha)} ${firmaProgramada.hora} · ${firmaProgramada.modalidad}`,
          responsable: 'Esc. Lagos',
          evidencia: 'programación',
        },
        ...getEventosByOp(op),
      ]
    : getEventosByOp(op);
  const docCounts = {
    revisado: docs.filter((d) => d.estado === 'revisado').length,
    alerta: docs.filter((d) => d.estado === 'alerta').length,
    pendiente: docs.filter((d) => d.estado === 'pendiente').length,
  };
  // Resumen derivado del legajo (P0 demo integrity). `proxima` se usa tanto en la
  // card "Condición del legajo" como en el snapshot "Estado actual" → no pueden
  // divergir. No muta estado/pelota/línea de pases: solo lee.
  const proxima = op.proximoPaso?.descripcion || op.tareaEnCursoFull || op.tareaEnCurso || '—';
  const responsableLabel = bloqueoLabel[op.proximoPaso?.responsable || op.bloqueoActor]?.short || '—';
  const titulo = `${e.label} · ${op.pasoActual}`;
  const condicion = observado
    ? { text: `Observado · ${op.bloqueoMotivo || 'requiere revisión'}`, cls: 'text-red-600' }
    : op.riesgo === 'alto'
    ? { text: 'Riesgo alto · requiere validación', cls: 'text-amber-600' }
    : op.riesgo === 'medio'
    ? { text: 'Riesgo medio · monitorear', cls: 'text-amber-600' }
    : { text: 'Sin observaciones', cls: 'text-slate-600' };

  // "Resolver" una alerta = crear una OperationalTask subtype 'review' para
  // atenderla (event-informed, task-driven). NO oculta la alerta, NO la marca
  // resuelta, NO cambia op.estado/bloqueoActor/línea de pases.
  const allOpTasks = useOperationalTasks();
  const taskFromAlert = (alertId) =>
    allOpTasks.find(
      (t) => t.opId === op.id && t.sourceType === 'alert' && t.sourceId === alertId && t.status !== 'cancelled'
    );
  const resolverAlerta = (a, sourceLabel) => {
    if (taskFromAlert(a.id)) return; // dedup: ya existe una task para esta alerta
    operationalTasks.create({
      opId: op.id,
      title: a.accion,
      subtype: 'review',
      origin: 'manual',
      relatedActorRole: null,
      relatedActorLabel: a.responsable || null,
      sourceType: 'alert',
      sourceId: a.id,
      sourceLabel,
    });
  };
  const pasoIdx = pasos.findIndex((p) => p === op.pasoActual);
  const fase = pasoIdx >= 0 ? pasoIdx + 1 : 1;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialTab = searchParams.get('tab') || 'resumen';
  const [tab, setTab] = useState(initialTab);
  const [firmaDialogOpen, setFirmaDialogOpen] = useState(false);

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
          <div className="px-9 py-3 flex items-center gap-4">
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
                onClick={() => setFirmaDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:opacity-90 font-medium px-4 h-9 shadow-sm transition-colors"
                data-testid="btn-programar-firma"
              >
                <FileSignature className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> {firmaProgramada ? 'Editar firma' : 'Programar firma'}
              </Button>
            </div>
          </div>
        </header>

        <div className="px-9 py-6 md:py-8 space-y-6">
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
                          {taskFromAlert(a.id) ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 px-3 h-8"
                              data-testid={`alert-task-created-${a.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Tarea creada
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => resolverAlerta(a, `Alerta ${cfg.label.toLowerCase()}`)}
                              className="bg-slate-900 text-white hover:bg-slate-800 font-medium px-3 h-8 shadow-sm transition-colors"
                              data-testid={`btn-resolver-${a.id}`}
                            >
                              <Plus className="w-3.5 h-3.5 mr-0.5" strokeWidth={2} /> Crear tarea
                            </Button>
                          )}
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
                  {proxima}
                </div>
              </div>
            </Card>

            <Card className="p-5" data-testid="firma-card">
              {firmaProgramada ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <SectionLabel>Firma programada</SectionLabel>
                    <Pill variant="success">Programada</Pill>
                  </div>
                  <div className="text-lg font-semibold tracking-tight text-slate-900 mt-2 tabular-nums">
                    {fmtFechaCorta(firmaProgramada.fecha)} · {firmaProgramada.hora}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {firmaProgramada.modalidad}{firmaProgramada.lugar ? ` · ${firmaProgramada.lugar}` : ''}
                  </div>
                  {firmaProgramada.nota && (
                    <div className="mt-1 text-[12.5px] text-slate-500 leading-snug">{firmaProgramada.nota}</div>
                  )}
                </>
              ) : (
                <>
                  <SectionLabel>Firma tentativa</SectionLabel>
                  <div className="text-lg font-semibold tracking-tight text-slate-900 mt-2 tabular-nums">{op.firma}</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-sm">
                    <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    <span className={op.diasFirma <= 5 ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                      {op.diasFirma > 0 ? `en ${op.diasFirma} días` : op.diasFirma === 0 ? 'hoy' : `hace ${Math.abs(op.diasFirma)} días`}
                    </span>
                  </div>
                </>
              )}
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
                { v: 'documentos', label: `Documentos · ${docs.length}` },
                { v: 'timeline', label: 'Actividad' },
                { v: 'operativa', label: 'Operativa' },
                { v: 'boveda', label: 'Bóveda' },
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
                        <div className="text-sm font-medium text-slate-900 mt-1">{titulo}</div>
                      </div>
                      <div>
                        <SectionLabel>Próxima acción</SectionLabel>
                        <div className="text-sm font-medium text-slate-900 mt-1">{proxima}</div>
                      </div>
                      <div>
                        <SectionLabel>Responsable de la acción</SectionLabel>
                        <div className="text-sm font-medium text-slate-900 mt-1">{responsableLabel}</div>
                      </div>
                      <div>
                        <SectionLabel>Condición</SectionLabel>
                        <div className={`text-sm font-medium mt-1 ${condicion.cls}`}>
                          {condicion.text}
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
                        { label: 'Revisados', n: docCounts.revisado, v: 'success' },
                        { label: 'Con alerta', n: docCounts.alerta, v: 'destructive' },
                        { label: 'Pendientes', n: docCounts.pendiente, v: 'warning' },
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
                      {docs.length} documento{docs.length === 1 ? '' : 's'} · {docCounts.revisado} revisado{docCounts.revisado === 1 ? '' : 's'} · {docCounts.alerta} con alerta · {docCounts.pendiente} pendiente{docCounts.pendiente === 1 ? '' : 's'}
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
                  {docs.map((d) => {
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
                    <div className="text-xs text-slate-500 mt-0.5">{evs.length} eventos auditables</div>
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
                  {evs.map((ev, idx) => {
                    const Icon = {
                      documento: FileText,
                      alerta: AlertTriangle,
                      decision: FileSignature,
                      signature_scheduled: FileSignature,
                      pago: DollarSign,
                      boveda: Wallet,
                      gestion: Building2,
                      apertura: CircleDot,
                    }[ev.tipo] || FileText;
                    const isBoveda = ev.tipo === 'boveda';
                    return (
                      <li key={idx} className="relative pl-12 pb-5 last:pb-0">
                        <div className={`absolute left-0 top-0 w-9 h-9 rounded-full grid place-items-center ${
                          isBoveda ? 'bg-sky-50 border border-sky-200' : 'bg-white border border-slate-200'
                        }`}>
                          <Icon className={`w-4 h-4 ${isBoveda ? 'text-sky-700' : 'text-slate-600'}`} strokeWidth={1.5} />
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

              <TimelineProceso op={op} />
            </TabsContent>

            <TabsContent value="operativa" className="mt-6" data-testid="tab-content-operativa">
              <OperationalTaskMemory op={op} />
            </TabsContent>

            <TabsContent value="boveda" className="mt-6" data-testid="tab-content-boveda">
              <BovedaTab op={op} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProgramarFirmaDialog op={op} open={firmaDialogOpen} onOpenChange={setFirmaDialogOpen} />
    </PanelShell>
  );
};

export default OperacionDetail;
