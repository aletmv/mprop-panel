import { Handshake } from "lucide-react";

const NAVY = "#2D3277";

export const Logo = ({ variant = "light", tag }) => {
  const dark = variant === "dark";
  return (
    <span className="flex items-center gap-2">
      <span
        className={`flex items-center justify-center rounded-full h-9 w-9 shrink-0 border-2 ${
          dark ? "bg-white border-white" : "bg-white"
        }`}
        style={!dark ? { borderColor: NAVY } : undefined}
      >
        <Handshake className="h-5 w-5" style={{ color: NAVY }} strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span
          className={`block font-logo font-bold text-[22px] tracking-tight lowercase ${dark ? "text-white" : ""}`}
          style={!dark ? { color: NAVY } : undefined}
        >
          mercadoprop
        </span>
        {tag && (
          <span className={`block text-[10px] font-bold uppercase tracking-[0.18em] mt-0.5 ${dark ? "text-[#FFE600]" : "text-[#666666]"}`}>
            {tag}
          </span>
        )}
      </span>
    </span>
  );
};
