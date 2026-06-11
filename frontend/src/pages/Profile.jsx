import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, CalendarClock, Tag, Lock, Landmark, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { CURRENT_USER, NOTARIES, formatUSD } from "@/data/mock";
import { PropertyCard } from "@/components/PropertyCard";

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
  const { verified, visits, offers, reservations, published, getProperty, updateOffer } = useApp();
  const tab = params.get("tab") || "propiedades";

  const acceptCounter = (offer) => {
    updateOffer(offer.id, { status: "aceptada", amount: offer.counterAmount });
    toast.success("Contraoferta aceptada. ¡Ya podés reservar!");
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

        <TabsContent value="propiedades" className="mt-4">
          {published.length === 0 ? (
            <Empty text="Todavía no publicaste ninguna propiedad." cta="Publicar mi propiedad" to="/publicar" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {published.map((p) => (
                <PropertyCard key={p.id} property={p} mine />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="visitas" className="mt-4 space-y-3">
          {visits.length === 0 && <Empty text="No tenés visitas agendadas." cta="Explorar propiedades" to="/" />}
          {visits.map((v) => {
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
                        data-testid={`reject-counter-${o.id}`}
                        onClick={() => updateOffer(o.id, { status: "rechazada" })}
                        className="flex-1 border border-gray-300 text-[#666666] text-xs font-semibold rounded-md py-2 hover:bg-gray-50 transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
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
          {reservations.length === 0 && <Empty text="No tenés reservas activas." cta="Explorar propiedades" to="/" />}
          {reservations.map((r) => {
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
    </div>
  );
}
