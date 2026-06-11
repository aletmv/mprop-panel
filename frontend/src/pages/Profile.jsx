import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  CalendarClock,
  Tag,
  Lock,
  Landmark,
  ChevronRight,
  ArrowRightLeft,
  User,
  Store,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { CURRENT_USER, NOTARIES, formatUSD } from "@/data/mock";
import { PropertyCard } from "@/components/PropertyCard";
import { SellerCostsCalculator } from "@/components/CostBreakdown";
import { CalendarMonth, ViewToggle, parseARDate, addDaysISO } from "@/components/CalendarMonth";

const statusChip = {
  pendiente: { label: "Pendiente", cls: "bg-yellow-50 text-yellow-700" },
  contraoferta: { label: "Contraoferta recibida", cls: "bg-blue-50 text-[#3483FA]" },
  aceptada: { label: "Aceptada", cls: "bg-green-50 text-[#00A650]" },
  rechazada: { label: "Rechazada", cls: "bg-red-50 text-red-600" },
  confirmada: { label: "Confirmada", cls: "bg-green-50 text-[#00A650]" },
  fondos_retenidos: { label: "Fondos en custodia", cls: "bg-blue-50 text-[#3483FA]" },
  escribania_asignada: { label: "Escribanía asignada", cls: "bg-green-50 text-[#00A650]" },
};

const Chip = ({ status }) => {
  const c = statusChip[status] || statusChip.pendiente;
  return <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${c.cls}`}>{c.label}</span>;
};

const Empty = ({ text, cta, to }) => (
  <div className="text-center py-12">
    <p className="text-sm text-[#666666]">{text}</p>
    <Link to={to} className="inline-block text-sm font-semibold text-[#3483FA] mt-2">
      {cta}
    </Link>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { verified, visits, offers, reservations, published, getProperty, updateOffer, removePublished } = useApp();
  const tab = params.get("tab") || "propiedades";
  const [counterFor, setCounterFor] = useState(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [visitView, setVisitView] = useState("lista");
  const [unpubConfirm, setUnpubConfirm] = useState(null);

  const unpublish = (p) => {
    removePublished(p.id);
    setUnpubConfirm(null);
    toast.success("Publicación dada de baja");
  };

  const myReservations = reservations.filter((r) => !r.buyer);

  const calendarEvents = [
    ...visits
      .filter((v) => v.iso)
      .map((v) => {
        const p = getProperty(v.propertyId);
        return p && { date: v.iso, label: `Visita — ${p.neighborhood}`, sublabel: `${v.time} hs · ${p.address}`, color: "blue" };
      })
      .filter(Boolean),
    ...myReservations
      .filter((r) => r.notaryId)
      .map((r) => {
        const p = getProperty(r.propertyId);
        return (
          p && {
            date: addDaysISO(parseARDate(r.date), 21),
            label: `Firma estimada — ${p.neighborhood}`,
            sublabel: "Coordinada por tu escribanía",
            color: "green",
          }
        );
      })
      .filter(Boolean),
  ];

  const offerHistory = (o) =>
    o.history || [
      { by: "comprador", amount: o.amount },
      ...(o.counterAmount ? [{ by: "vendedor", amount: o.counterAmount }] : []),
    ];

  const acceptCounter = (offer) => {
    updateOffer(offer.id, { status: "aceptada", amount: offer.counterAmount });
    toast.success("Contraoferta aceptada. ¡Ya podés reservar!");
  };

  const sendCounter = (offer) => {
    const amt = Number(counterAmount);
    if (!amt || amt < 1000) return;
    const history = [...offerHistory(offer), { by: "comprador", amount: amt }];
    updateOffer(offer.id, { status: "pendiente", amount: amt, history });
    setCounterFor(null);
    setCounterAmount("");
    toast.success("Contraoferta enviada al vendedor");

    const sellerLast = offer.counterAmount;
    setTimeout(() => {
      if (amt >= Math.round(sellerLast * 0.97)) {
        updateOffer(offer.id, { status: "aceptada", history });
        toast.success("¡El vendedor aceptó tu contraoferta!");
      } else {
        const mid = Math.round((amt + sellerLast) / 2 / 500) * 500;
        updateOffer(offer.id, {
          status: "contraoferta",
          counterAmount: mid,
          history: [...history, { by: "vendedor", amount: mid }],
        });
        toast.info("El vendedor envió una nueva contraoferta");
      }
    }, 4000);
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} className="h-14 w-14 rounded-full object-cover" />
        <div className="flex-1">
          <p className="font-heading font-extrabold text-lg tracking-tight" data-testid="profile-name">{CURRENT_USER.name}</p>
          <p className="text-xs text-[#666666]">{CURRENT_USER.email} · Miembro desde {CURRENT_USER.memberSince}</p>
          {verified ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00A650] mt-1.5" data-testid="profile-verified-badge">
              <ShieldCheck className="h-4 w-4" /> Identidad verificada
            </span>
          ) : (
            <button
              data-testid="profile-verify-btn"
              onClick={() => navigate("/verificacion?return=/perfil")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3483FA] mt-1.5"
            >
              <ShieldAlert className="h-4 w-4" /> Verificá tu identidad <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue={tab} className="mt-5">
        <TabsList className="w-full grid grid-cols-4 bg-white border border-gray-100">
          <TabsTrigger value="propiedades" data-testid="tab-propiedades" className="text-xs">Avisos</TabsTrigger>
          <TabsTrigger value="visitas" data-testid="tab-visitas" className="text-xs">Visitas</TabsTrigger>
          <TabsTrigger value="ofertas" data-testid="tab-ofertas" className="text-xs">Ofertas</TabsTrigger>
          <TabsTrigger value="reservas" data-testid="tab-reservas" className="text-xs">Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="propiedades" className="mt-4 space-y-4">
          {published.length === 0 ? (
            <Empty text="Todavía no publicaste ninguna propiedad." cta="Publicar mi propiedad" to="/publicar" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {published.map((p) => (
                <div key={p.id}>
                  <PropertyCard property={p} mine />
                  {unpubConfirm === p.id ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        data-testid={`confirm-unpublish-${p.id}`}
                        onClick={() => unpublish(p)}
                        className="flex-1 bg-red-500 text-white text-xs font-bold rounded-md py-2.5 hover:bg-red-600 transition-colors"
                      >
                        Confirmar baja
                      </button>
                      <button
                        data-testid={`cancel-unpublish-${p.id}`}
                        onClick={() => setUnpubConfirm(null)}
                        className="flex-1 border border-gray-300 text-[#666666] text-xs font-semibold rounded-md py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      data-testid={`unpublish-${p.id}`}
                      onClick={() => setUnpubConfirm(p.id)}
                      className="w-full flex items-center justify-center gap-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-md py-2.5 mt-2 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Dar de baja
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <SellerCostsCalculator defaultPrice={published[0]?.price || 150000} />
        </TabsContent>

        <TabsContent value="visitas" className="mt-4 space-y-3">
          {(visits.length > 0 || calendarEvents.length > 0) && (
            <ViewToggle value={visitView} onChange={setVisitView} prefix="visits" />
          )}
          {visits.length === 0 && visitView === "lista" && <Empty text="No tenés visitas agendadas." cta="Explorar propiedades" to="/" />}
          {visitView === "calendario" && <CalendarMonth events={calendarEvents} testId="visits-calendar" />}
          {visitView === "lista" &&
            visits.map((v) => {
            const p = getProperty(v.propertyId);
            if (!p) return null;
            return (
              <div key={v.id} data-testid={`visit-item-${v.id}`} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex gap-3">
                <img src={p.images[0]} alt={p.title} className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm line-clamp-1">{p.title}</p>
                    <Chip status={v.status} />
                  </div>
                  <p className="text-xs text-[#666666] mt-1 flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" /> {v.date} · {v.time} hs
                  </p>
                  <p className="text-xs text-[#666666] mt-0.5">{p.address}</p>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="ofertas" className="mt-4 space-y-3">
          {offers.length === 0 && <Empty text="Todavía no hiciste ofertas." cta="Explorar propiedades" to="/" />}
          {offers.map((o) => {
            const p = getProperty(o.propertyId);
            if (!p) return null;
            return (
              <div key={o.id} data-testid={`offer-item-${o.id}`} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <div className="flex gap-3">
                  <img src={p.images[0]} alt={p.title} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-1">{p.title}</p>
                      <Chip status={o.status} />
                    </div>
                    <p className="text-xs text-[#666666] mt-1 flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> Tu oferta: <span className="font-bold text-[#333333]">{formatUSD(o.amount)}</span>
                    </p>
                    <p className="text-xs text-[#666666] mt-0.5">{o.date}</p>
                  </div>
                </div>
                {offerHistory(o).length > 1 && (
                  <div className="border-t border-gray-100 mt-3 pt-3" data-testid={`offer-history-${o.id}`}>
                    <p className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold flex items-center gap-1.5">
                      <ArrowRightLeft className="h-3 w-3" /> Negociación
                    </p>
                    <div className="space-y-1.5 mt-2">
                      {offerHistory(o).map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {h.by === "comprador" ? (
                            <User className="h-3.5 w-3.5 text-[#3483FA]" />
                          ) : (
                            <Store className="h-3.5 w-3.5 text-[#666666]" />
                          )}
                          <span className="text-[#666666]">{h.by === "comprador" ? "Tu oferta" : "Vendedor"}</span>
                          <span className="font-bold ml-auto">{formatUSD(h.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {o.status === "contraoferta" && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-3">
                    <p className="text-xs">
                      El vendedor contraofertó <span className="font-bold">{formatUSD(o.counterAmount)}</span>
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        data-testid={`accept-counter-${o.id}`}
                        onClick={() => acceptCounter(o)}
                        className="flex-1 bg-[#3483FA] text-white text-xs font-semibold rounded-md py-2 hover:bg-blue-600 transition-colors"
                      >
                        Aceptar
                      </button>
                      <button
                        data-testid={`counter-offer-btn-${o.id}`}
                        onClick={() => {
                          setCounterFor(counterFor === o.id ? null : o.id);
                          setCounterAmount("");
                        }}
                        className="flex-1 bg-[#FFE600] text-[#333333] text-xs font-semibold rounded-md py-2 hover:bg-yellow-400 transition-colors"
                      >
                        Contraofertar
                      </button>
                      <button
                        data-testid={`reject-counter-${o.id}`}
                        onClick={() => updateOffer(o.id, { status: "rechazada" })}
                        className="flex-1 border border-gray-300 text-[#666666] text-xs font-semibold rounded-md py-2 hover:bg-gray-50 transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                    {counterFor === o.id && (
                      <div className="mt-3 bg-white rounded-md p-3">
                        <label className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold">
                          Tu nueva oferta (U$S)
                        </label>
                        <div className="flex gap-2 mt-1.5">
                          <input
                            data-testid={`counter-amount-input-${o.id}`}
                            inputMode="numeric"
                            value={counterAmount ? Number(counterAmount).toLocaleString("es-AR") : ""}
                            onChange={(e) => setCounterAmount(e.target.value.replace(/\D/g, ""))}
                            placeholder={`Entre ${formatUSD(o.amount)} y ${formatUSD(o.counterAmount)}`}
                            className="flex-1 min-w-0 border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-2 px-3 text-sm font-semibold"
                          />
                          <button
                            data-testid={`send-counter-btn-${o.id}`}
                            onClick={() => sendCounter(o)}
                            disabled={!Number(counterAmount) || Number(counterAmount) < 1000}
                            className="bg-[#3483FA] text-white text-xs font-bold rounded-md px-4 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            Enviar
                          </button>
                        </div>
                        <p className="text-[10px] text-[#666666] mt-1.5">
                          El vendedor responde en minutos. Tu oferta es vinculante por 48 hs.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {o.status === "aceptada" && (
                  <button
                    data-testid={`reserve-from-offer-${o.id}`}
                    onClick={() => navigate(`/reserva/${o.propertyId}`)}
                    className="w-full bg-[#FFE600] text-[#333333] text-xs font-bold rounded-md py-2.5 mt-3 hover:bg-yellow-400 transition-colors"
                  >
                    Reservar ahora con Mercado Pago
                  </button>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="reservas" className="mt-4 space-y-3">
          {reservations.filter((r) => !r.buyer).length === 0 && (
            <Empty text="No tenés reservas activas." cta="Explorar propiedades" to="/" />
          )}
          {reservations.filter((r) => !r.buyer).map((r) => {
            const p = getProperty(r.propertyId);
            const notary = NOTARIES.find((n) => n.id === r.notaryId);
            if (!p) return null;
            return (
              <div key={r.id} data-testid={`reservation-item-${r.id}`} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <div className="flex gap-3">
                  <img src={p.images[0]} alt={p.title} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-1">{p.title}</p>
                      <Chip status={r.status} />
                    </div>
                    <p className="text-xs text-[#666666] mt-1 flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" /> {formatUSD(r.amount)} en custodia · {r.paymentId}
                    </p>
                    {notary ? (
                      <p className="text-xs text-[#666666] mt-0.5 flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5" /> {notary.name}
                      </p>
                    ) : (
                      <button
                        data-testid={`pick-notary-${r.id}`}
                        onClick={() => navigate(`/escribania/${r.id}`)}
                        className="text-xs font-bold text-[#3483FA] mt-1 flex items-center gap-0.5"
                      >
                        Elegir escribanía <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      <Link
        to="/escribanos"
        data-testid="profile-notary-portal-link"
        className="mt-5 bg-[#142A5C] text-white rounded-lg p-4 flex items-center gap-3 hover:bg-[#1d3a7a] transition-colors block"
      >
        <span className="bg-white/10 rounded-lg p-2.5">
          <Landmark className="h-5 w-5 text-[#FFE600]" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold">¿Sos escribano?</span>
          <span className="block text-xs text-white/70">Gestioná tu agenda, carpetas y Asistente IA en el Portal de Escribanías.</span>
        </span>
        <ChevronRight className="h-5 w-5 text-white/60" />
      </Link>
    </div>
  );
}
