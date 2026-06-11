import { formatUSD } from "@/data/mock";

export const STAGES = [
  {
    title: "Control de Identidad y Capacidad Legal",
    desc: "Verificación física de las partes y control de inhibiciones judiciales.",
    tasks: [
      { label: "Validación de las partes", detail: "Verificar físicamente los DNI de compradores, vendedores, cónyuges y apoderados para constatar que son quienes dicen ser." },
      { label: "Control de inhibiciones", detail: "Constatar con los certificados de última hora que ninguna de las partes esté inhibida judicialmente para vender o disponer de sus bienes." },
    ],
    docs: [
      { label: "DNI de las partes (escaneo)", hint: "Frente y dorso de compradores, vendedores y cónyuges" },
      { label: "Certificado de inhibiciones", hint: "Emitido por el registro · vigencia máx. 15 días" },
    ],
  },
  {
    title: "Fiscalización y Conteo del Dinero",
    desc: "Presencia del pago y prevención de lavado de dinero (UIF).",
    tasks: [
      { label: "Control del pago", detail: "Presenciar el conteo de los dólares billete físicos (o fiscalizar las transferencias bancarias de alto valor) y dejar constancia exacta en la escritura del monto y medio de pago." },
      { label: "Declaración de origen de fondos", detail: "Hacer firmar las declaraciones juradas de licitud de fondos requeridas por la Unidad de Información Financiera (UIF)." },
    ],
    docs: [
      { label: "Comprobante de pago / acta de conteo", hint: "Transferencia fiscalizada o acta del conteo de billetes" },
      { label: "DDJJ de licitud de fondos (UIF)", hint: "Firmada por ambas partes" },
    ],
  },
  {
    title: "Agente de Retención Impositiva",
    desc: "La mesa de retenciones: calcular, retener y rendir al Estado y a la plataforma.",
    tasks: [
      { label: "Impuesto de Sellos", detail: "Retener el porcentaje que corresponde a cada parte según la Ley Tarifaria vigente de CABA." },
      { label: "Ganancias Cedulares (o ex-ITI)", detail: "Retener el tributo correspondiente al vendedor según la fecha de adquisición del inmueble." },
      { label: "Liberación de deudas", detail: "Si los certificados de ABL o expensas arrojan deudas del vendedor, retener ese dinero para saldar las cuentas y entregar la propiedad con saldo $0." },
      { label: "Comisión MercadoProp (1%)", detail: "El escribano oficia de agente de retención de la comisión del 1% de la plataforma (comprador y vendedor) y la rinde a Mercado Pago." },
    ],
    docs: [
      { label: "Constancia de retención de Sellos", hint: "Presentación AGIP" },
      { label: "Constancia Ganancias Cedulares / ITI", hint: "Presentación ARCA (ex AFIP)" },
      { label: "Certificados ABL y expensas", hint: "Libre deuda o detalle de retención" },
    ],
  },
  {
    title: "Perfeccionamiento del Título y Firma",
    desc: "Lectura del protocolo y firma con fe pública.",
    tasks: [
      { label: "Lectura del protocolo", detail: "Leer en voz alta la Escritura Pública: nomenclatura catastral, antecedentes de dominio (estudio de títulos por 20 años) y condiciones pactadas." },
      { label: "La firma", detail: "Hacer firmar el libro de protocolo (matriz) a compradores y vendedores, y firmar dando fe pública al acto." },
    ],
    docs: [
      { label: "Certificado de dominio vigente", hint: "Con reserva de prioridad" },
      { label: "Escritura matriz firmada (escaneo)", hint: "Folio del libro de protocolo" },
    ],
  },
  {
    title: "Trámites Post-Cierre (Inscripción)",
    desc: "Testimonio e inscripción registral del nuevo dueño.",
    tasks: [
      { label: "Expedición del testimonio", detail: "Entregar la copia certificada provisoria (primer testimonio) al comprador." },
      { label: "Inscripción registral", detail: "Enviar el documento al Registro de la Propiedad Inmueble (DNRPI) para asentar oficialmente el cambio de titularidad." },
    ],
    docs: [
      { label: "Primer testimonio", hint: "Copia certificada para el comprador" },
      { label: "Constancia de presentación DNRPI", hint: "Cargo de entrada al registro" },
    ],
  },
];

export const docId = (si, di) => `s${si}d${di}`;

export const TOTAL_TASKS = STAGES.reduce((s, st) => s + st.tasks.length, 0);

export const taskId = (si, ti) => `s${si}t${ti}`;

export const folderProgress = (tasks = {}) => {
  let done = 0;
  STAGES.forEach((st, si) => st.tasks.forEach((_, ti) => tasks[taskId(si, ti)] && done++));
  let current = STAGES.findIndex((st, si) => st.tasks.some((_, ti) => !tasks[taskId(si, ti)]));
  if (current === -1) current = STAGES.length;
  return { done, total: TOTAL_TASKS, current };
};

export const retentionBreakdown = (price) => {
  const items = [
    { label: "Impuesto de Sellos (3,5% — 1,75% c/parte)", amount: Math.round(price * 0.035), note: "Ley Tarifaria CABA vigente" },
    { label: "Ganancias Cedulares / ex-ITI (vendedor)", amount: Math.round(price * 0.045), note: "Estimado · sujeto a fecha de adquisición y escritura antecedente" },
    { label: "Deudas ABL / expensas", amount: 0, note: "Certificados sin deuda · entrega con saldo $0" },
    { label: "Comisión MercadoProp (1% + 1%)", amount: Math.round(price * 0.02), note: "El escribano actúa como agente de retención de la plataforma", highlight: true },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0);
  const fee = Math.round(price * 0.015);
  return { items, total, fee };
};

const fmt = formatUSD;

export const aiReply = (key, ctx) => {
  const { p, price, buyer, seller, stageIdx, done, total } = ctx;
  const r = retentionBreakdown(price);
  const stageName = stageIdx >= STAGES.length ? "Carpeta completa" : STAGES[stageIdx].title;

  const replies = {
    bienvenida: `Hola, soy tu asistente de la carpeta ${p.address}. La operación está en la etapa "${stageName}" (${done}/${total} tareas completas). Puedo calcular retenciones, redactar la minuta o decirte qué sigue. ¿En qué te ayudo?`,
    resumen: `📁 Resumen de la carpeta\n\n• Inmueble: ${p.title} — ${p.address}, ${p.neighborhood}\n• Comprador: ${buyer} (identidad biométrica validada en MercadoProp)\n• Vendedor: ${seller} (vendedor verificado)\n• Precio: ${fmt(price)} · Seña en custodia: ${fmt(Math.max(1000, Math.round(price * 0.01)))}\n• Etapa actual: ${stageName}\n• Progreso: ${done} de ${total} tareas completadas.`,
    siguiente:
      stageIdx >= STAGES.length
        ? `✅ La carpeta está completa. El testimonio fue expedido y la escritura quedó presentada en el DNRPI. Solo resta esperar la inscripción definitiva (45-60 días hábiles) y notificar a las partes desde la app.`
        : `➡️ Estás en "${stageName}".\n\nTareas pendientes de esta etapa:\n${STAGES[stageIdx].tasks.map((t, i) => `${i + 1}. ${t.label}: ${t.detail}`).join("\n")}\n\nTip: marcá cada tarea en la carpeta a medida que la completás y paso a la siguiente etapa automáticamente.`,
    retenciones: `🧮 Mesa de retenciones para ${fmt(price)}\n\n${r.items.map((i) => `• ${i.label}: ${i.amount === 0 ? "Sin deuda" : fmt(i.amount)} (${i.note})`).join("\n")}\n\nTotal a retener sobre la mesa: ${fmt(r.total)}\nTus honorarios (1,5%): ${fmt(r.fee)}\n\nRecordá: oficiás de agente de retención de la comisión del 1% de MercadoProp por cada parte, y la rendís a Mercado Pago junto con los tributos.`,
    minuta: `📝 Borrador de minuta (extracto)\n\n"En la Ciudad Autónoma de Buenos Aires, comparecen ${seller}, en adelante LA PARTE VENDEDORA, y ${buyer}, en adelante LA PARTE COMPRADORA, ambos con identidad validada biométricamente vía RENAPER. LA PARTE VENDEDORA VENDE a LA PARTE COMPRADORA el inmueble sito en ${p.address}, ${p.neighborhood}, ${p.city}, por el precio total y convenido de ${fmt(price)}, abonado mediante transferencia fiscalizada con custodia de Mercado Pago, operación N° ${ctx.paymentId}. El estudio de títulos por veinte años no arroja observaciones..."\n\nPuedo completar la nomenclatura catastral cuando cargues el certificado de dominio.`,
  };
  return replies[key] || replies.siguiente;
};

export const aiPanelReply = (key, pctx) => {
  const { notary, folders } = pctx;
  const stageLabel = (f) => (f.prog.current >= STAGES.length ? "Carpeta completa" : `Etapa ${f.prog.current + 1}: ${STAGES[f.prog.current].title}`);
  const totRet = folders.reduce((s, f) => s + f.ret.total, 0);
  const totCom = folders.reduce((s, f) => s + (f.ret.items.find((i) => i.highlight)?.amount ?? 0), 0);
  const totFee = folders.reduce((s, f) => s + f.ret.fee, 0);

  const replies = {
    bienvenida:
      folders.length === 0
        ? `Hola, ${notary.titular}. Todavía no tenés carpetas activas: se crean cuando un comprador reserva una propiedad y elige tu escribanía. Mientras tanto puedo contarte cómo funciona el proceso de 5 etapas.`
        : `Hola, ${notary.titular}. Tenés ${folders.length} carpeta${folders.length > 1 ? "s" : ""} activa${folders.length > 1 ? "s" : ""}. Puedo darte un resumen del estudio, calcular las retenciones totales o decirte qué sigue en cada operación. Para redactar minutas, entrá a la carpeta puntual y pedímela ahí.`,
    resumen: `📁 Resumen del estudio\n\n${folders.map((f) => `• ${f.p.address} (${fmt(f.p.price)}) — ${f.buyer} / ${f.p.seller.name}\n  ${stageLabel(f)} · ${f.prog.done}/${f.prog.total} tareas`).join("\n")}`,
    siguiente: `➡️ Próximos pasos por carpeta\n\n${folders
      .map((f) => {
        if (f.prog.current >= STAGES.length) return `• ${f.p.address}: carpeta completa, esperando inscripción definitiva del DNRPI.`;
        const st = STAGES[f.prog.current];
        const pending = st.tasks.find((_, ti) => !(f.tasks || {})[taskId(f.prog.current, ti)]) || st.tasks[0];
        return `• ${f.p.address}: ${st.title} — siguiente tarea: ${pending.label}.`;
      })
      .join("\n")}`,
    retenciones: `🧮 Retenciones totales del estudio (${folders.length} carpetas)\n\n• Total a retener en mesas de dinero: ${fmt(totRet)}\n• Comisión MercadoProp (1%+1%) a rendir: ${fmt(totCom)}\n• Honorarios proyectados (1,5%): ${fmt(totFee)}\n\nPara el detalle por operación, abrí cada carpeta y consultame ahí.`,
    minuta: `📝 Las minutas se redactan dentro de cada carpeta, así uso los datos exactos de las partes y la operación. Abrí la carpeta correspondiente y pedime "Redactar minuta".`,
  };
  return replies[key] || replies.resumen;
};

export const aiPanelFree = (text, pctx) => {
  const t = text.toLowerCase();
  if (/(retencion|impuesto|sello|comision|honorario|ganancia)/.test(t)) return aiPanelReply("retenciones", pctx);
  if (/(minuta|escritura|redact)/.test(t)) return aiPanelReply("minuta", pctx);
  if (/(resumen|carpeta|estado)/.test(t)) return aiPanelReply("resumen", pctx);
  if (/(firma|agenda|cita|coordin)/.test(t))
    return `🖋️ Firmas pendientes:\n\n${pctx.folders
      .filter((f) => f.prog.current < 4)
      .map((f) => `• ${f.p.address} — ${f.buyer} y ${f.p.seller.name} (${f.prog.current >= 3 ? "lista para coordinar" : "aún en etapas previas"})`)
      .join("\n") || "No tenés firmas pendientes."}\n\nMirá la pestaña Agenda en vista calendario para ver las fechas estimadas.`;
  return aiPanelReply("siguiente", pctx);
};

export const aiFreeReply = (text, ctx) => {
  const t = text.toLowerCase();
  if (/(retencion|impuesto|sello|ganancia|iti|comision|abl|expensa)/.test(t)) return aiReply("retenciones", ctx);
  if (/(minuta|escritura|redact|protocolo|texto)/.test(t)) return aiReply("minuta", ctx);
  if (/(resumen|carpeta|estado|partes)/.test(t)) return aiReply("resumen", ctx);
  if (/(dni|identidad|inhibicion|capacidad)/.test(t))
    return `🪪 Control de identidad: ambas partes ya validaron DNI + biometría facial vía RENAPER en MercadoProp, pero igual debés verificar los documentos físicos el día de la firma y pedir los certificados de inhibición de última hora al registro. ¿Querés que te liste las tareas de la etapa 1?`;
  if (/(uif|fondo|lavado|dinero|pago|conteo)/.test(t))
    return `💵 Fiscalización del dinero: la seña de ${fmt(Math.max(1000, Math.round(ctx.price * 0.01)))} ya está en custodia digital de Mercado Pago con trazabilidad completa. Para el saldo, presenciá el conteo o fiscalizá la transferencia, dejá constancia del medio de pago en la escritura y hacé firmar la DDJJ de licitud de fondos (UIF).`;
  if (/(inscrip|testimonio|registro|dnrpi|post)/.test(t))
    return `🏛️ Post-cierre: expedí el primer testimonio para el comprador y presentá la escritura en el DNRPI dentro de los 45 días. Te aviso cuando el registro confirme la inscripción para notificar a las partes desde la app.`;
  if (/(firma|agenda|cita|coordin)/.test(t))
    return `🖋️ Para la firma, las partes ya están notificadas por la app. Sugerime un día y lo agendo: la lectura del protocolo lleva ~45 minutos. Recordá tener el libro de protocolo y los certificados vigentes (no más de 15 días).`;
  return aiReply("siguiente", ctx);
};
