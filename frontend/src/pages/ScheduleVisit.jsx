import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { getNextDays, TIME_SLOTS, formatUSD } from "@/data/mock";

export default function ScheduleVisit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, addVisit } = useApp();
  const property = getProperty(id);
  const days = getNextDays(10);

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!property) return null;

  const confirm = () => {
    addVisit({
      propertyId: property.id,
      date: `${selectedDay.dayName} ${selectedDay.dayNum} ${selectedDay.month}`,
      time: selectedSlot,
      iso: selectedDay.iso,
    });
    setConfirmed(true);
    toast.success("Visita agendada con éxito");
  };

  if (confirmed) {
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <span className="inline-flex bg-green-50 rounded-full p-4">
            <CalendarCheck className="h-12 w-12 text-[#00A650]" />
          </span>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-4" data-testid="visit-success-title">
            ¡Visita confirmada!
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            {selectedDay.dayName} {selectedDay.dayNum} de {selectedDay.month} a las {selectedSlot} hs en {property.address}.
            {" "}{property.seller.name} ya recibió la notificación.
          </p>
          <button
            data-testid="visit-go-profile-btn"
            onClick={() => navigate("/perfil?tab=visitas")}
            className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors mt-6"
          >
            Ver mis visitas
          </button>
          <button
            data-testid="visit-back-home-btn"
            onClick={() => navigate("/")}
            className="w-full text-[#3483FA] font-semibold text-sm py-3 mt-1"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <button data-testid="visit-back-btn" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[#3483FA] font-semibold">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-5">Agendá tu visita</h1>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mt-4 flex gap-3">
        <img src={property.images[0]} alt={property.title} className="h-16 w-16 rounded-lg object-cover" />
        <div className="min-w-0">
          <p className="font-semibold text-sm line-clamp-1">{property.title}</p>
          <p className="text-xs text-[#666666] flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" /> {property.neighborhood}, {property.city}
          </p>
          <p className="font-heading font-bold text-sm mt-1">{formatUSD(property.price)}</p>
        </div>
      </div>

      <h2 className="text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">Elegí el día</h2>
      <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
        {days.map((d) => (
          <button
            key={d.iso}
            data-testid={`visit-day-${d.iso}`}
            onClick={() => setSelectedDay(d)}
            className={`shrink-0 w-16 rounded-lg border py-2.5 text-center transition-colors ${
              selectedDay?.iso === d.iso ? "bg-[#3483FA] text-white border-[#3483FA]" : "bg-white border-gray-200 hover:border-[#3483FA]"
            }`}
          >
            <p className="text-[10px] uppercase font-semibold opacity-80">{d.dayName}</p>
            <p className="font-heading font-extrabold text-lg leading-tight">{d.dayNum}</p>
            <p className="text-[10px] opacity-80">{d.month}</p>
          </button>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">Elegí el horario</h2>
      <div className="grid grid-cols-4 gap-2 mt-3">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            data-testid={`visit-slot-${slot.replace(":", "")}`}
            onClick={() => setSelectedSlot(slot)}
            className={`rounded-full border py-2 text-sm font-semibold transition-colors ${
              selectedSlot === slot ? "bg-[#3483FA] text-white border-[#3483FA]" : "bg-white border-gray-200 hover:border-[#3483FA]"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#666666] mt-5 bg-white border border-gray-100 rounded-lg p-3">
        El vendedor confirma la visita por la app. Recibirás un recordatorio 1 hora antes.
      </p>

      <button
        data-testid="visit-confirm-btn"
        onClick={confirm}
        disabled={!selectedDay || !selectedSlot}
        className="w-full bg-[#3483FA] text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold rounded-md px-6 py-3.5 transition-colors mt-5"
      >
        Confirmar visita
      </button>
    </div>
  );
}
