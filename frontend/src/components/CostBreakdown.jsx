import { useState } from "react";
import { Receipt, PiggyBank, Calculator, Home } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { formatUSD, formatARS } from "@/data/mock";
import { buyerCosts, sellerCosts, TC_REFERENCIA } from "@/lib/costs";

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
            {it.amount === 0 ? it.zeroLabel || "Gratis" : formatUSD(it.amount)}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const FirstHomeToggle = ({ value, onChange, priceARS, testId }) => (
  <div className="bg-[#F5F5F5] rounded-lg p-3 mt-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Home className="h-4 w-4 text-[#3483FA] shrink-0" />
        <div>
          <p className="text-xs font-semibold">¿Es tu primera vivienda?</p>
          <p className="text-[10px] text-[#666666]">Vivienda única · exención de sellos hasta $226.000.000</p>
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} data-testid={testId} />
    </div>
    <p className="text-[10px] text-[#666666] mt-2">
      Valor en pesos: <span className="font-bold">{formatARS(priceARS)}</span> · TC de referencia {formatARS(TC_REFERENCIA)}
    </p>
  </div>
);

export const BuyerCosts = ({ price }) => {
  const [firstHome, setFirstHome] = useState(false);
  const { items, total, savings, operationTotal, sellos } = buyerCosts(price, firstHome);
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5" data-testid="buyer-costs-card">
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-[#3483FA]" />
        <h2 className="font-heading font-bold text-lg">Transparencia de gastos</h2>
      </div>
      <p className="text-xs text-[#666666] mt-1">Esto pagarías de gastos si comprás esta propiedad.</p>

      <FirstHomeToggle value={firstHome} onChange={setFirstHome} priceARS={sellos.priceARS} testId="buyer-first-home-toggle" />

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
          <span className="font-bold text-[#00A650]">Ahorrás {formatUSD(savings)}</span> vs. la comisión inmobiliaria
          tradicional (4%).
        </p>
      </div>
      {sellos.exempt && (
        <div className="bg-blue-50 rounded-lg p-3 mt-2" data-testid="buyer-sellos-exempt-note">
          <p className="text-xs">
            <span className="font-bold text-[#3483FA]">Sellos: exento.</span> Por ser vivienda única y no superar los
            $226.000.000, esta operación no paga impuesto de sellos.
          </p>
        </div>
      )}
      <p className="text-[10px] text-[#666666] mt-3">
        Valores estimados para CABA según Ley Tarifaria vigente y TC de referencia del momento.
      </p>
    </div>
  );
};

export const SellerCostsCalculator = ({ defaultPrice = 150000 }) => {
  const [price, setPrice] = useState(String(defaultPrice));
  const [firstHome, setFirstHome] = useState(false);
  const num = Number(price) || 0;
  const { items, total, savings, net, sellos } = sellerCosts(num, firstHome);
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
          <FirstHomeToggle
            value={firstHome}
            onChange={setFirstHome}
            priceARS={sellos.priceARS}
            testId="seller-first-home-toggle"
          />
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
          {sellos.exempt && (
            <div className="bg-blue-50 rounded-lg p-3 mt-2" data-testid="seller-sellos-exempt-note">
              <p className="text-xs">
                <span className="font-bold text-[#3483FA]">Sellos: exento.</span> Por ser vivienda única del comprador y
                no superar los $226.000.000, la operación no paga impuesto de sellos.
              </p>
            </div>
          )}
        </>
      )}
      <p className="text-[10px] text-[#666666] mt-3">
        Valores estimados para CABA según Ley Tarifaria vigente y TC de referencia. No incluye ITI ni impuesto cedular,
        que dependen de tu situación fiscal.
      </p>
    </div>
  );
};
