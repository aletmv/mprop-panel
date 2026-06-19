import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Wallet, CreditCard, Loader2, CheckCircle2, ChevronRight, ShieldAlert, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatUSD, reservationAmount } from "@/data/mock";

export default function EscrowCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, addReservation } = useApp();
  const property = getProperty(id);

  const [method, setMethod] = useState("account");
  const [phase, setPhase] = useState("summary"); // summary | processing | success
  const [resId, setResId] = useState(null);
  const [opNumber, setOpNumber] = useState("");
  const [acceptForfeit, setAcceptForfeit] = useState(false);
  const [acceptRole, setAcceptRole] = useState(false);

  if (!property) return null;
  const amount = reservationAmount(property.price);
  const senaAmount = Math.round(property.price * 0.04);
  const canPay = acceptForfeit && acceptRole;

  const pay = () => {
    setPhase("processing");
    setTimeout(() => {
      const op = `MP-${Math.floor(100000000 + Math.random() * 900000000)}`;
      setOpNumber(op);
      const newId = addReservation({
        propertyId: property.id,
        amount,
        paymentId: op,
        date: new Date().toLocaleDateString("es-AR"),
      });
      setResId(newId);
      setPhase("success");
    }, 2200);
  };

  if (phase === "processing") {
    return (
      <div className="px-4 py-20 max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-10">
          <Loader2 className="h-12 w-12 text-[#3483FA] mx-auto animate-spin" />
          <h1 className="font-heading font-extrabold text-xl tracking-tight mt-4">Procesando tu pago</h1>
          <p className="text-sm text-[#666666] mt-2" data-testid="payment-processing-msg">
            MercadoPago está registrando la reserva en tu Bóveda...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="px-4 py-12 max-w-md mx-auto">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center">
          <span className="inline-flex bg-green-50 rounded-full p-4">
            <CheckCircle2 className="h-12 w-12 text-[#00A650]" />
          </span>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-4" data-testid="escrow-success-title">
            ¡Reserva pagada!
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            Registramos <span className="font-bold text-[#333333]">{formatUSD(amount)}</span> en la{" "}
            <span className="font-bold text-[#333333]">Bóveda de la operación</span>. El vendedor no
            recibe el dinero hasta la firma ante escribanía.
          </p>
          <div className="bg-[#F5F5F5] rounded-lg p-4 mt-5 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-[#666666]">Operación</span>
              <span className="font-semibold" data-testid="escrow-operation-number">{opNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Estado</span>
              <span className="font-semibold text-[#3483FA]">Pago registrado en Bóveda</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Propiedad</span>
              <span className="font-semibold text-right line-clamp-1 max-w-[55%]">{property.neighborhood}</span>
            </div>
          </div>
          <button
            data-testid="choose-notary-btn"
            onClick={() => navigate(`/escribania/${resId}`)}
            className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors mt-6 flex items-center justify-center gap-2"
          >
            Elegir escribanía <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <button data-testid="escrow-back-btn" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[#3483FA] font-semibold">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="flex items-center justify-between mt-5">
        <h1 className="font-heading font-extrabold text-2xl tracking-tight">Reservar propiedad</h1>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FFE600] rounded-full px-2.5 py-1" data-testid="test-mode-badge">
          Modo test
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mt-4">
        <div className="flex gap-3">
          <img src={property.images[0]} alt={property.title} className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="font-semibold text-sm line-clamp-2">{property.title}</p>
            <p className="text-xs text-[#666666] mt-0.5">{property.neighborhood}, {property.city}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#666666]">Precio de la propiedad</span>
            <span>{formatUSD(property.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Reserva (1%)</span>
            <span className="font-semibold">{formatUSD(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Costo de servicio</span>
            <span className="text-[#00A650] font-semibold">Gratis</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3">
            <span className="font-bold">Total a pagar hoy</span>
            <span className="font-heading font-extrabold text-lg" data-testid="escrow-total">{formatUSD(amount)}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">Condiciones de la reserva</h2>
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mt-3" data-testid="reservation-conditions-card">
        <div className="flex items-start gap-3">
          <span className="bg-orange-50 rounded-full p-2 shrink-0">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm">Reglas que aceptás al reservar</p>
            <p className="text-xs text-[#666666] mt-0.5">Leelas antes de avanzar al pago.</p>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#666666]">Monto de reserva</span>
            <span className="font-semibold" data-testid="cond-amount">{formatUSD(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Equivale al</span>
            <span className="font-semibold">1% del precio acordado</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Destino inicial</span>
            <span className="font-semibold text-right max-w-[60%]">Cuenta transaccional de la operación</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Próximo paso</span>
            <span className="font-semibold">Selección de autoridad notarial</span>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-3 text-xs leading-relaxed text-[#333333]">
          <p>
            <span className="font-bold">Luego de la revisión notarial:</span> si no hay observaciones, alertas o
            inconsistencias que impidan avanzar, deberás integrar la <span className="font-bold">seña del 4%</span>{" "}
            (<span className="font-semibold">{formatUSD(senaAmount)}</span>) dentro de las{" "}
            <span className="font-bold">72 horas</span>.
          </p>
          <p className="bg-red-50 border border-red-100 text-red-700 rounded-md p-3">
            <span className="font-bold">Si no integrás la seña a tiempo:</span> la reserva podrá transferirse al
            vendedor como compensación y la operación se dará por caída.
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <label
          data-testid="accept-forfeit-checkbox"
          className={`flex gap-3 items-start bg-white rounded-lg border p-4 cursor-pointer transition-colors ${
            acceptForfeit ? "border-[#3483FA] ring-1 ring-[#3483FA]" : "border-gray-200"
          }`}
        >
          <span
            className={`h-5 w-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${
              acceptForfeit ? "border-[#3483FA] bg-[#3483FA]" : "border-gray-300 bg-white"
            }`}
          >
            {acceptForfeit && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={acceptForfeit}
            onChange={(e) => setAcceptForfeit(e.target.checked)}
          />
          <span className="text-xs leading-relaxed">
            Entiendo que, si la autoridad notarial no registra observaciones, alertas o inconsistencias que impidan
            avanzar, tendré <span className="font-bold">72 horas para integrar la seña del 4%</span>. Si no lo hago
            dentro de ese plazo, el monto de la reserva podrá transferirse al vendedor como compensación y la
            operación se dará por caída.
          </span>
        </label>

        <label
          data-testid="accept-role-checkbox"
          className={`flex gap-3 items-start bg-white rounded-lg border p-4 cursor-pointer transition-colors ${
            acceptRole ? "border-[#3483FA] ring-1 ring-[#3483FA]" : "border-gray-200"
          }`}
        >
          <span
            className={`h-5 w-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${
              acceptRole ? "border-[#3483FA] bg-[#3483FA]" : "border-gray-300 bg-white"
            }`}
          >
            {acceptRole && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={acceptRole}
            onChange={(e) => setAcceptRole(e.target.checked)}
          />
          <span className="text-xs leading-relaxed">
            Entiendo que <span className="font-bold">MercadoProp coordina la operación</span> y ejecuta las
            condiciones aceptadas por las partes, pero <span className="font-bold">no decide discrecionalmente</span>{" "}
            sobre el destino de los fondos.
          </span>
        </label>
      </div>

      <h2 className="text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">Medio de pago</h2>
      <div className="space-y-2 mt-3">
        <button
          data-testid="payment-method-account"
          onClick={() => setMethod("account")}
          className={`w-full bg-white rounded-lg border p-4 flex items-center gap-3 text-left transition-colors ${
            method === "account" ? "border-[#3483FA] ring-1 ring-[#3483FA]" : "border-gray-200"
          }`}
        >
          <span className="bg-[#FFE600] rounded-full p-2">
            <Wallet className="h-5 w-5 text-[#333333]" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Dinero en Mercado Pago</p>
            <p className="text-xs text-[#666666]">Disponible: U$S 4.250 (test)</p>
          </div>
          <span className={`h-4 w-4 rounded-full border-2 ${method === "account" ? "border-[#3483FA] bg-[#3483FA]" : "border-gray-300"}`} />
        </button>
        <button
          data-testid="payment-method-card"
          onClick={() => setMethod("card")}
          className={`w-full bg-white rounded-lg border p-4 flex items-center gap-3 text-left transition-colors ${
            method === "card" ? "border-[#3483FA] ring-1 ring-[#3483FA]" : "border-gray-200"
          }`}
        >
          <span className="bg-blue-50 rounded-full p-2">
            <CreditCard className="h-5 w-5 text-[#3483FA]" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Visa terminada en 4509</p>
            <p className="text-xs text-[#666666]">Tarjeta de prueba</p>
          </div>
          <span className={`h-4 w-4 rounded-full border-2 ${method === "card" ? "border-[#3483FA] bg-[#3483FA]" : "border-gray-300"}`} />
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mt-5">
        <Lock className="h-5 w-5 text-[#3483FA] shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          <span className="font-bold">Reserva con respaldo MercadoPago.</span> Tu pago queda registrado en la
          Bóveda de la operación. Si la operación no avanza, te devolvemos el 100%.
        </p>
      </div>

      <button
        data-testid="pay-reserve-btn"
        onClick={pay}
        disabled={!canPay}
        className={`w-full font-semibold rounded-md px-6 py-3.5 transition-colors mt-5 ${
          canPay
            ? "bg-[#3483FA] text-white hover:bg-blue-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {canPay ? `Pagar y reservar ${formatUSD(amount)}` : "Aceptá las condiciones para continuar"}
      </button>
      <p className="text-[11px] text-[#666666] text-center mt-3">
        Pago simulado en modo test. No se realizará ningún cargo real.
      </p>
    </div>
  );
}
