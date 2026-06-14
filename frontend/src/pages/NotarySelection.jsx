import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, CheckCircle2, Landmark, Circle, Loader2, ShieldCheck } from "lucide-react";
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
    // Bóveda digital number: deterministic 7-digit derived from resId
    const seed = String(resId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const vaultNumber = String(1000000 + ((seed * 7919) % 9000000)).padStart(7, "0");

    const timeline = [
      { label: "Reserva pagada", status: "done" },
      { label: `Escribanía asignada: ${notary.name}`, status: "done" },
      { label: "Revisión de la documentación del inmueble y titular", status: "current" },
      { label: "Habilitación de seña del 4%", status: "pending" },
      { label: "Habilitación de pago de tasas, impuestos y honorarios", status: "pending" },
      { label: "Liquidación final de la operación", status: "pending" },
      { label: "Firma del boleto de compraventa", status: "pending" },
      { label: "Habilitación para el pago del saldo restante ante escribano", status: "pending" },
      { label: "Escrituración", status: "pending" },
    ];

    return (
      <div className="px-4 py-12 max-w-md mx-auto">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <div className="text-center">
            <span className="inline-flex bg-green-50 rounded-full p-4">
              <CheckCircle2 className="h-12 w-12 text-[#00A650]" />
            </span>
            <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-4" data-testid="notary-success-title">
              Reserva acreditada
            </h1>
            <p className="text-sm text-[#666666] mt-2">
              Se creó la bóveda digital de la operación{" "}
              <span className="font-bold text-[#333333]" data-testid="vault-number">
                MercadoProp #{vaultNumber}
              </span>
              .
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mt-5">
            <ShieldCheck className="h-5 w-5 text-[#3483FA] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[#333333]">
              La escribanía asignada iniciará la recolección y revisión de la documentación del inmueble y del
              titular. Si no detecta impedimentos para avanzar, se habilitará el pago de la{" "}
              <span className="font-bold">seña del 4%</span>. Desde ese momento tendrás{" "}
              <span className="font-bold">72 hs</span> para integrarla.
            </p>
          </div>

          <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">Próximos pasos</p>
          <div className="mt-3 space-y-3" data-testid="reservation-timeline">
            {timeline.map(({ label, status }, i) => {
              const isDone = status === "done";
              const isCurrent = status === "current";
              return (
                <div key={label} className="flex gap-3 items-start">
                  {isDone && <CheckCircle2 className="h-5 w-5 text-[#00A650] shrink-0 mt-0.5" />}
                  {isCurrent && (
                    <span className="h-5 w-5 shrink-0 mt-0.5 inline-flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-[#3483FA] animate-spin" />
                    </span>
                  )}
                  {status === "pending" && <Circle className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />}
                  <p
                    className={`text-sm leading-snug ${
                      isDone
                        ? "font-semibold text-[#333333]"
                        : isCurrent
                        ? "font-semibold text-[#3483FA]"
                        : "text-[#666666]"
                    }`}
                    data-testid={`timeline-step-${i}`}
                  >
                    {label}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-[#3483FA] rounded-full px-2 py-0.5 align-middle">
                        En curso
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
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
