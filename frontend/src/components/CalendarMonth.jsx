import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, List, CalendarDays } from "lucide-react";

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

const toISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
export const todayISO = () => {
  const t = new Date();
  return toISO(t.getFullYear(), t.getMonth(), t.getDate());
};
export const parseARDate = (s) => {
  const [d, m, y] = s.split("/").map(Number);
  return toISO(y, m - 1, d);
};
export const addDaysISO = (isoStr, days) => {
  const [y, m, d] = isoStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return toISO(dt.getFullYear(), dt.getMonth(), dt.getDate());
};

const DOT_COLORS = {
  blue: "bg-[#3483FA]",
  green: "bg-[#00A650]",
  navy: "bg-[#142A5C]",
  yellow: "bg-yellow-500",
};

export const ViewToggle = ({ value, onChange, prefix, accent = "#3483FA" }) => (
  <div className="flex gap-1 bg-white border border-gray-200 rounded-full p-1 w-fit">
    {[
      { v: "lista", icon: List, label: "Lista" },
      { v: "calendario", icon: CalendarDays, label: "Calendario" },
    ].map(({ v, icon: Icon, label }) => (
      <button
        key={v}
        data-testid={`${prefix}-view-${v}`}
        onClick={() => onChange(v)}
        className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-colors ${
          value === v ? "text-white" : "text-[#666666] hover:text-[#333333]"
        }`}
        style={value === v ? { backgroundColor: accent } : undefined}
      >
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    ))}
  </div>
);

export const CalendarMonth = ({ events = [], testId = "calendar", accent = "#3483FA" }) => {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayISO());

  const byDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      (map[e.date] = map[e.date] || []).push(e);
    });
    return map;
  }, [events]);

  const startOffset = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...[...Array(daysInMonth).keys()].map((i) => i + 1)];
  const today = todayISO();

  const nav = (delta) =>
    setYm(({ y, m }) => {
      const nm = m + delta;
      return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 };
    });

  const selectedEvents = byDate[selected] || [];

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4" data-testid={testId}>
      <div className="flex items-center justify-between">
        <p className="font-heading font-bold text-sm capitalize" data-testid={`${testId}-month-label`}>
          {MONTHS[ym.m]} {ym.y}
        </p>
        <div className="flex gap-1">
          <button data-testid={`${testId}-prev`} onClick={() => nav(-1)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button data-testid={`${testId}-next`} onClick={() => nav(1)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mt-3">
        {DAYS.map((d) => (
          <p key={d} className="text-center text-[10px] uppercase tracking-wider font-bold text-[#666666] pb-2">
            {d}
          </p>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dIso = toISO(ym.y, ym.m, day);
          const evts = byDate[dIso] || [];
          const isSel = selected === dIso;
          return (
            <button
              key={dIso}
              data-testid={`${testId}-day-${dIso}`}
              onClick={() => setSelected(dIso)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                isSel ? "text-white font-bold" : dIso === today ? "font-bold text-[#3483FA] bg-blue-50" : "hover:bg-gray-50"
              }`}
              style={isSel ? { backgroundColor: accent } : undefined}
            >
              {day}
              <span className="flex gap-0.5 h-1.5">
                {evts.slice(0, 3).map((e, j) => (
                  <span key={j} className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white" : DOT_COLORS[e.color] || DOT_COLORS.blue}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 mt-3 pt-3" data-testid={`${testId}-day-events`}>
        {selectedEvents.length === 0 ? (
          <p className="text-xs text-[#666666] text-center py-2">Sin eventos para este día.</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-2.5" data-testid={`${testId}-event-${i}`}>
                <span className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${DOT_COLORS[e.color] || DOT_COLORS.blue}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold line-clamp-1">{e.label}</p>
                  {e.sublabel && <p className="text-[11px] text-[#666666] line-clamp-1">{e.sublabel}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
