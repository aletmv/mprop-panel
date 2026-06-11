import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Car,
  CalendarClock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatUSD, formatARS, reservationAmount, IMG } from "@/data/mock";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, verified } = useApp();
  const [imgIdx, setImgIdx] = useState(0);
  const property = getProperty(id);

  if (!property) {
    return (
      <div className="p-8 text-center text-sm text-[#666666]">
        Propiedad no encontrada. <Link to="/" className="text-[#3483FA] font-semibold">Volver al inicio</Link>
      </div>
    );
  }

  const goGated = (path) => {
    if (verified) navigate(path);
    else navigate(`/verificacion?return=${encodeURIComponent(path)}`);
  };

  return (
    <div className="pb-28 sm:pb-0">
      <div className="relative">
        <img src={property.images[imgIdx]} alt={property.title} className="w-full aspect-[4/3] sm:aspect-[16/7] object-cover" />
        <button
          data-testid="detail-back-btn"
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 bg-white/95 rounded-full p-2 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <button
              key={i}
              data-testid={`gallery-dot-${i}`}
              onClick={() => setImgIdx(i)}
              className={`h-2 rounded-full transition-all ${i === imgIdx ? "w-5 bg-white" : "w-2 bg-white/60"}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:mt-6">
        <div className="sm:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mt-4 sm:mt-0">
            <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">
              {property.type} en venta · hace {property.publishedDays} días
            </p>
            <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-1" data-testid="detail-title">
              {property.title}
            </h1>
            <p className="font-heading font-extrabold text-3xl tracking-tight mt-3 text-[#333333]" data-testid="detail-price">
              {formatUSD(property.price)}
            </p>
            {property.expensas > 0 && (
              <p className="text-sm text-[#666666] mt-1">{formatARS(property.expensas)} expensas</p>
            )}
            <p className="text-sm text-[#666666] mt-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {property.address} · {property.neighborhood}, {property.city}
            </p>
            <div className="grid grid-cols-4 gap-2 mt-5 text-center">
              {[
                { icon: Ruler, label: `${property.m2} m²` },
                { icon: BedDouble, label: `${property.dormitorios} dorm.` },
                { icon: Bath, label: `${property.banos} baño${property.banos > 1 ? "s" : ""}` },
                { icon: Car, label: property.cochera ? "Cochera" : "Sin coch." },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-[#F5F5F5] rounded-lg py-3">
                  <Icon className="h-5 w-5 mx-auto text-[#3483FA]" />
                  <p className="text-xs font-semibold mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
            <h2 className="font-heading font-bold text-lg">Descripción</h2>
            <p className="text-sm text-[#666666] mt-2 leading-relaxed">{property.description}</p>
            <h2 className="font-heading font-bold text-lg mt-5">Características</h2>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {property.features.map((f) => (
                <p key={f} className="text-sm text-[#666666] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00A650] shrink-0" /> {f}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="font-heading font-bold text-lg">Ubicación</h2>
              <p className="text-sm text-[#666666] mt-1">{property.address}</p>
            </div>
            <div className="relative h-40">
              <img src={IMG.map} alt="Mapa de la zona" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-[#3483FA] text-white rounded-full p-2 shadow-lg">
                  <MapPin className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-4 sm:mt-0">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
            <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Vendedor particular</p>
            <div className="flex items-center gap-3 mt-3">
              <img src={property.seller.avatar} alt={property.seller.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-sm" data-testid="seller-name">{property.seller.name}</p>
                <p className="text-xs text-[#666666] flex items-center gap-1">
                  <Star className="h-3 w-3 fill-[#FFE600] text-[#FFE600]" /> {property.seller.rating} · {property.seller.sales} ventas
                </p>
              </div>
              {property.seller.verified && (
                <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#00A650] bg-green-50 rounded-full px-2 py-1">
                  <ShieldCheck className="h-3 w-3" /> Verificado
                </span>
              )}
            </div>
            <p className="text-xs text-[#666666] mt-3">
              Identidad validada con biometría · Miembro desde {property.seller.memberSince}
            </p>
          </div>

          <div className="hidden sm:block bg-white rounded-lg border border-gray-100 shadow-sm p-5 space-y-3">
            <ActionButtons property={property} goGated={goGated} navigate={navigate} />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <Lock className="h-5 w-5 text-[#3483FA] shrink-0 mt-0.5" />
            <p className="text-xs text-[#333333] leading-relaxed">
              <span className="font-bold">Reserva protegida.</span> Señás con {formatUSD(reservationAmount(property.price))} vía
              Mercado Pago. El dinero queda retenido en custodia hasta la firma del boleto.
            </p>
          </div>
        </div>
      </div>

      <div className="sm:hidden fixed bottom-14 inset-x-0 z-30 bg-white border-t border-gray-200 p-3 space-y-2">
        <ActionButtons property={property} goGated={goGated} navigate={navigate} compact />
      </div>
    </div>
  );
}

const ActionButtons = ({ property, goGated, navigate, compact = false }) => (
  <>
    <div className={compact ? "flex gap-2" : "space-y-3"}>
      <button
        data-testid="schedule-visit-btn"
        onClick={() => navigate(`/visita/${property.id}`)}
        className="w-full border border-[#3483FA] text-[#3483FA] hover:bg-blue-50 font-semibold rounded-md px-4 py-3 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <CalendarClock className="h-4 w-4" /> Agendar visita
      </button>
      <button
        data-testid="make-offer-btn"
        onClick={() => goGated(`/oferta/${property.id}`)}
        className="w-full bg-[#FFE600] text-[#333333] hover:bg-yellow-400 font-semibold rounded-md px-4 py-3 transition-colors text-sm"
      >
        Hacer oferta
      </button>
    </div>
    <button
      data-testid="reserve-btn"
      onClick={() => goGated(`/reserva/${property.id}`)}
      className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-4 py-3 transition-colors text-sm"
    >
      Reservar con Mercado Pago
    </button>
  </>
);
