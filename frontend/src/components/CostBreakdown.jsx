import { useState } from "react";
import { Receipt, PiggyBank, Calculator } from "lucide-react";
import { formatUSD } from "@/data/mock";
import { buyerCosts, sellerCosts } from "@/lib/costs";

const CostRows = ({ items, idPrefix }) => (
  <div className="space-y-3">
    {items.map((it, i) => (
      <div key={it.label} className="flex items-start justify-between gap-3" data-testid={`${idPrefix}-row-${i}`}>
        <div className="min-w-0">
          <p className="text-sm">{it.label}</p>
          <p className="text-[11px] text-[#666666]">{it.detail}</p>
        </div>
        <div className="text-right shrink-0">
          {it.traditional !== undefined && (
            <p className="text-[11px] text-[#666666] line-through">{formatUSD(it.traditional)}</p>
          )}
          <p className={`text-sm font-bold ${it.amount === 0 ? "text-[#00A650]" : ""}`}>
            {it.amount === 0 ? "Gratis" : formatUSD(it.amount)}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export const BuyerCosts = ({ price }) => {
  const { items, total, savings, operationTotal } = buyerCosts(price);
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5" data-testid="buyer-costs-card">
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-[#3483FA]" />
        <h2 className="font-heading font-bold text-lg">Transparencia de gastos</h2>
      </div>
      <p className="text-xs text-[#666666] mt-1">Esto pagarías de gastos si comprás esta propiedad.</p>
      <div className="mt-4">
        <CostRows items={items} idPrefix="buyer-cost" />
      </div>
      <div className="border-t border-gray-100 mt-4 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-bold">Gastos totales estimados</span>
          <span className="font-heading font-extrabold" data-testid="buyer-costs-total">{formatUSD(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#666666]">
          <span>Costo total de la operación</span>
          <span className="font-semibold" data-testid="buyer-costs-operation-total">{formatUSD(operationTotal)}</span>
        </div>
      </div>
      <div className="bg-green-50 rounded-lg p-3 mt-4 flex gap-2.5 items-center" data-testid="buyer-costs-savings">
        <PiggyBank className="h-5 w-5 text-[#00A650] shrink-0" />
        <p className="text-xs">
          <span className="font-bold text-[#00A650]">Ahorrás {formatUSD(savings)}</span> comprando entre personas, sin
          comisión inmobiliaria.
        </p>
      </div>
      <p className="text-[10px] text-[#666666] mt-3">
        Valores estimados para CABA. Sellos con exención parcial por vivienda única según jurisdicción.
      </p>
    </div>
  );
};

export const SellerCostsCalculator = ({ defaultPrice = 150000 }) => {
  const [price, setPrice] = useState(String(defaultPrice));
  const num = Number(price) || 0;
  const { items, total, savings, net } = sellerCosts(num);
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5" data-testid="seller-costs-card">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-[#3483FA]" />
        <h2 className="font-heading font-bold text-lg">Gastos de venta</h2>
      </div>
      <p className="text-xs text-[#666666] mt-1">Calculá cuánto recibís en mano al vender tu propiedad.</p>
      <label className="block text-[10px] uppercase tracking-widest text-[#666666] font-semibold mt-4">
        Precio de venta (U$S)
      </label>
      <input
        data-testid="seller-costs-input"
        inputMode="numeric"
        value={price ? Number(price).toLocaleString("es-AR") : ""}
        onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
        placeholder="Ej.: 150.000"
        className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-2.5 px-4 text-sm font-semibold mt-1.5"
      />
      {num > 0 && (
        <>
          <div className="mt-4">
            <CostRows items={items} idPrefix="seller-cost" />
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#666666]">Gastos totales estimados</span>
              <span className="font-semibold" data-testid="seller-costs-total">{formatUSD(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-sm">Recibís neto</span>
              <span className="font-heading font-extrabold text-lg text-[#00A650]" data-testid="seller-costs-net">
                {formatUSD(net)}
              </span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 mt-4 flex gap-2.5 items-center" data-testid="seller-costs-savings">
            <PiggyBank className="h-5 w-5 text-[#00A650] shrink-0" />
            <p className="text-xs">
              <span className="font-bold text-[#00A650]">Ahorrás {formatUSD(savings)}</span> vs. la comisión de una
              inmobiliaria tradicional (2% + IVA).
            </p>
          </div>
        </>
      )}
      <p className="text-[10px] text-[#666666] mt-3">
        Valores estimados para CABA. No incluye ITI ni impuesto cedular, que dependen de tu situación fiscal.
      </p>
    </div>
  );
};
