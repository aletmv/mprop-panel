import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, BadgePercent, Calculator, ScanFace, Lock, Landmark } from "lucide-react";

const SLIDES = [
  {
    kicker: "MercadoProp",
    title: "Comprá y vendé propiedades con un 72% menos de gastos de cierre.",
    text: "Olvidate del 7% tradicional y las comisiones cruzadas. Transaccioná directo entre personas con una tarifa del 1% y el respaldo de Mercado Pago.",
    icon: BadgePercent,
  },
  {
    kicker: "Costos 100% claros",
    title: "Sin sorpresas de último momento.",
    text: "Simulá tu operación y mirá el detalle exacto de impuestos, tasas y gastos con IVA incluido antes de avanzar.",
    icon: Calculator,
  },
  {
    kicker: "Visitas Seguras",
    title: "Cuidamos tu casa y a tu familia.",
    text: "Solo le abrís la puerta a personas con identidad real, validadas mediante reconocimiento facial y cruce de datos con el RENAPER.",
    icon: ScanFace,
  },
  {
    kicker: "Reserva protegida",
    title: "Congelá la propiedad de manera segura.",
    text: "Tu seña queda en custodia digital dentro de Mercado Pago hasta el momento exacto de la firma de la escritura.",
    icon: Lock,
  },
  {
    kicker: "Escribanías en un clic",
    title: "Papeleo más rápido, honorarios al 1,5%.",
    text: "Accedé a escribanos asociados que utilizan asistentes de IA para procesar el papeleo y bajar los honorarios notariales.",
    icon: Landmark,
  },
];

export const HeroBanner = () => {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const go = useCallback((i) => setIndex((i + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    timer.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer.current);
  }, [index]);

  return (
    <div className="relative overflow-hidden" data-testid="hero-carousel">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.kicker} className="w-full shrink-0 px-4 sm:px-14" data-testid={`hero-slide-${i}`}>
              <div className="flex items-center gap-4 sm:gap-10 py-7 sm:py-10 min-h-[210px] sm:min-h-[230px]">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-[#333333]/70">
                    {s.kicker}
                  </p>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-4xl tracking-tight leading-snug mt-1.5 text-[#333333]">
                    {s.title}
                  </h2>
                  <p className="text-xs sm:text-base text-[#333333]/80 mt-2 leading-relaxed max-w-2xl">{s.text}</p>
                </div>
                <div className="shrink-0 hidden xs:flex sm:flex">
                  <span className="bg-white rounded-full p-5 sm:p-7 shadow-sm">
                    <Icon className="h-10 w-10 sm:h-14 sm:w-14 text-[#3483FA]" strokeWidth={1.8} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        data-testid="hero-prev"
        onClick={() => go(index - 1)}
        aria-label="Anterior"
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
      >
        <ChevronLeft className="h-5 w-5 text-[#3483FA]" />
      </button>
      <button
        data-testid="hero-next"
        onClick={() => go(index + 1)}
        aria-label="Siguiente"
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
      >
        <ChevronRight className="h-5 w-5 text-[#3483FA]" />
      </button>

      <div className="flex justify-center gap-1.5 pb-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            data-testid={`hero-dot-${i}`}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-[#3483FA]" : "w-2 bg-[#333333]/25 hover:bg-[#333333]/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
