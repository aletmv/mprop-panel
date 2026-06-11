import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, ShieldCheck, BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { formatUSD } from "@/data/mock";

export default function MakeOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, addOffer } = useApp();
  const property = getProperty(id);

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!property) return null;

  const numAmount = Number(amount.replace(/\D/g, ""));
  const setQuick = (pct) => setAmount(String(Math.round(property.price * (1 - pct))));

  const submit = () => {
    addOffer({ propertyId: property.id, amount: numAmount, message, history: [{ by: "comprador", amount: numAmount }] });
    setSent(true);
    toast.success("Oferta enviada al vendedor");
  };

  if (sent) {
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <span className="inline-flex bg-green-50 rounded-full p-4">
            <Send className="h-12 w-12 text-[#00A650]" />
          </span>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-4" data-testid="offer-success-title">
            ¡Oferta enviada!
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            Ofertaste {formatUSD(numAmount)} por {property.title}. {property.seller.name} tiene 48 hs para aceptar,
            rechazar o contraofertar.
          </p>
          <button
            data-testid="offer-go-profile-btn"
            onClick={() => navigate("/perfil?tab=ofertas")}
            className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors mt-6"
          >
            Ver mis ofertas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <button data-testid="offer-back-btn" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[#3483FA] font-semibold">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-5">Hacé tu oferta</h1>
      <p className="text-sm text-[#666666] mt-1">
        Precio publicado: <span className="font-bold text-[#333333]">{formatUSD(property.price)}</span>
      </p>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mt-4">
        <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Tu oferta en dólares</label>
        <div className="flex items-center gap-2 mt-2 border-b-2 border-[#3483FA] pb-2">
          <BadgeDollarSign className="h-6 w-6 text-[#3483FA]" />
          <span className="font-heading font-extrabold text-2xl text-[#666666]">U$S</span>
          <input
            data-testid="offer-amount-input"
            inputMode="numeric"
            value={amount ? Number(amount).toLocaleString("es-AR") : ""}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="flex-1 font-heading font-extrabold text-3xl tracking-tight focus:outline-none min-w-0"
          />
        </div>

        <div className="flex gap-2 mt-4">
          {[
            { label: "Precio publicado", pct: 0 },
            { label: "-5%", pct: 0.05 },
            { label: "-10%", pct: 0.1 },
          ].map(({ label, pct }) => (
            <button
              key={label}
              data-testid={`offer-quick-${pct * 100}`}
              onClick={() => setQuick(pct)}
              className="text-xs font-semibold rounded-full px-3 py-1.5 bg-[#F5F5F5] text-[#666666] hover:bg-blue-50 hover:text-[#3483FA] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        <label className="block text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">
          Mensaje para el vendedor (opcional)
        </label>
        <textarea
          data-testid="offer-message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Ej.: Oferta en efectivo, escritura inmediata..."
          className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
        />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mt-4">
        <ShieldCheck className="h-5 w-5 text-[#3483FA] shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          Tu oferta es vinculante por 48 hs y queda firmada con tu identidad verificada. Si el vendedor acepta, pasás
          directo a la reserva con escrow.
        </p>
      </div>

      <button
        data-testid="offer-submit-btn"
        onClick={submit}
        disabled={!numAmount || numAmount < 1000}
        className="w-full bg-[#3483FA] text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold rounded-md px-6 py-3.5 transition-colors mt-5"
      >
        Enviar oferta
      </button>
    </div>
  );
}
