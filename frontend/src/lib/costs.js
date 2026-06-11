export const TC_REFERENCIA = 1190;
export const SELLOS_TOPE_ARS = 226000000;

export const sellosPorParte = (price, firstHome) => {
  const priceARS = price * TC_REFERENCIA;
  const base = firstHome ? Math.max(0, priceARS - SELLOS_TOPE_ARS) : priceARS;
  const amount = Math.round((base * 0.0175) / TC_REFERENCIA);
  return {
    amount,
    priceARS,
    exempt: firstHome && priceARS <= SELLOS_TOPE_ARS,
    partial: firstHome && priceARS > SELLOS_TOPE_ARS,
  };
};

const sellosDetail = (s) =>
  s.exempt
    ? "Exento · vivienda única hasta $226.000.000"
    : s.partial
    ? "1,75% sobre el excedente de $226.000.000 (50% c/parte)"
    : "1,75% del valor de escritura";

export const buyerCosts = (price, firstHome = false) => {
  const sellos = sellosPorParte(price, firstHome);
  const items = [
    { label: "Comisión MercadoProp", detail: "1% · al momento de la compra", amount: Math.round(price * 0.01), traditional: Math.round(price * 0.04) },
    { label: "Honorarios de escribanía", detail: "~2% · la elegís en la app", amount: Math.round(price * 0.02) },
    { label: "Impuesto de sellos (tu mitad)", detail: sellosDetail(sellos), amount: sellos.amount, zeroLabel: "Exento" },
    { label: "Certificados e inscripción registral", detail: "Dominio, inhibición y tasas", amount: 450 },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0);
  const savings = Math.round(price * 0.04) - Math.round(price * 0.01);
  return { items, total, savings, operationTotal: price + total, sellos };
};

export const sellerCosts = (price, firstHome = false) => {
  const sellos = sellosPorParte(price, firstHome);
  const items = [
    { label: "Comisión MercadoProp", detail: "1% · solo si vendés", amount: Math.round(price * 0.01), traditional: Math.round(price * 0.0242) },
    { label: "Impuesto de sellos (tu mitad)", detail: sellosDetail(sellos), amount: sellos.amount, zeroLabel: "Exento" },
    { label: "Certificados de dominio e inhibición", detail: "Trámite incluido en la operación", amount: 180 },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0);
  const savings = Math.round(price * 0.0242) - Math.round(price * 0.01);
  return { items, total, savings, net: price - total, sellos };
};
