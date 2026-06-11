export const buyerCosts = (price) => {
  const items = [
    { label: "Comisión MercadoProp", detail: "1% · al momento de la compra", amount: Math.round(price * 0.01), traditional: Math.round(price * 0.04) },
    { label: "Honorarios de escribanía", detail: "~2% · la elegís en la app", amount: Math.round(price * 0.02) },
    { label: "Impuesto de sellos (tu mitad)", detail: "1,75% del valor de escritura", amount: Math.round(price * 0.0175) },
    { label: "Certificados e inscripción registral", detail: "Dominio, inhibición y tasas", amount: 450 },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0);
  const savings = Math.round(price * 0.04) - Math.round(price * 0.01);
  return { items, total, savings, operationTotal: price + total };
};

export const sellerCosts = (price) => {
  const items = [
    { label: "Comisión MercadoProp", detail: "1% · solo si vendés", amount: Math.round(price * 0.01), traditional: Math.round(price * 0.0242) },
    { label: "Impuesto de sellos (tu mitad)", detail: "1,75% del valor de escritura", amount: Math.round(price * 0.0175) },
    { label: "Certificados de dominio e inhibición", detail: "Trámite incluido en la operación", amount: 180 },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0);
  const savings = Math.round(price * 0.0242) - Math.round(price * 0.01);
  return { items, total, savings, net: price - total };
};
