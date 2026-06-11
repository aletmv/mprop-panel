import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, CheckCircle2, Landmark, Circle } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { NOTARIES, formatUSD } from "@/data/mock";

export default function NotarySelection() {
  const { resId } = useParams();
  const navigate = useNavigate();
  const { reservations, setReservationNotary, getProperty } = useApp();
  const reservation = reservations.find((r) => r.id === resId);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);

  if (!reservation) {
    return (
      <div className="p-8 text-center text-sm text-[#666666]">
        Reserva no encontrada. <Link to="/perfil" className="text-[#3483FA] font-semibold">Ir a mi cuenta</Link>
      </div>
    );
  }

  const property = getProperty(reservation.propertyId);

  const confirm = () => {
    setReservationNotary(resId, selected);
    setDone(true);
    toast.success("Escribanía asignada a tu operación");
  };

  if (done) {
    const notary = NOTARIES.find((n) => n.id === selected);
    const timeline = [
      { label: "Reserva pagada y retenida en custodia", done: true },
      { label: `Escribanía asignada: ${notary.name}`, done: true },
      { label: "Firma del boleto de compraventa", done: false },
      { label: "Escritura y liberación de fondos", done: false },
    ];
    return (
      <div className="px-4 py-12 max-w-md mx-auto">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center">
          <span className="inline-flex bg-green-50 rounded-full p-4">
            <CheckCircle2 className="h-12 w-12 text-[#00A650]" />
          </span>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-4" data-testid="notary-success-title">
            ¡Reserva completa!
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            {notary.titular} se pondrá en contacto en las próximas 24 hs para coordinar la firma del boleto.
          </p>
          <div className="text-left mt-6 space-y-4">
            {timeline.map(({ label, done: isDone }, i) => (
              <div key={label} className="flex gap-3 items-start">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-[#00A650] shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                )}
                <p className={`text-sm ${isDone ? "font-semibold" : "text-[#666666]"}`} data-testid={`timeline-step-${i}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>
          <button
            data-testid="notary-go-profile-btn"
            onClick={() => navigate("/perfil?tab=reservas")}
            className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors mt-7"
          >
            Ver mi reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <button data-testid="notary-back-btn" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[#3483FA] font-semibold">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-5">Elegí tu escribanía</h1>
      <p className="text-sm text-[#666666] mt-1">
        Escribanías auditadas por MercadoProp para tu operación en {property?.neighborhood}.
      </p>

      <div className="space-y-3 mt-5">
        {NOTARIES.map((n) => (
          <button
            key={n.id}
            data-testid={`notary-card-${n.id}`}
            onClick={() => setSelected(n.id)}
            className={`w-full bg-white rounded-lg border p-4 text-left transition-colors ${
              selected === n.id ? "border-[#3483FA] ring-1 ring-[#3483FA]" : "border-gray-200 hover:border-[#3483FA]"
            }`}
          >
            <div className="flex gap-3">
              <span className="bg-[#F5F5F5] rounded-lg p-2.5 h-fit">
                <Landmark className="h-6 w-6 text-[#3483FA]" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{n.name}</p>
                  {selected === n.id && <CheckCircle2 className="h-5 w-5 text-[#3483FA] shrink-0" />}
                </div>
                <p className="text-xs text-[#666666] mt-0.5">{n.titular} · {n.registro}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#666666]">
                  <span className="flex items-center gap-1 font-semibold text-[#333333]">
                    <Star className="h-3.5 w-3.5 fill-[#FFE600] text-[#FFE600]" /> {n.rating} ({n.reviews})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {n.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {n.days}
                  </span>
                </div>
                <p className="text-xs mt-2">
                  Honorarios estimados: <span className="font-bold">{formatUSD(n.fee)}</span>
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        data-testid="notary-confirm-btn"
        onClick={confirm}
        disabled={!selected}
        className="w-full bg-[#3483FA] text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold rounded-md px-6 py-3.5 transition-colors mt-5"
      >
        Confirmar escribanía
      </button>
    </div>
  );
}
