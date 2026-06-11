import { Link, Navigate } from "react-router-dom";
import { FolderOpen, CalendarDays, PenLine, HandCoins, ChevronRight, Users, Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { NOTARIES, CURRENT_USER, formatUSD } from "@/data/mock";
import { STAGES, folderProgress, retentionBreakdown } from "@/data/notaryProcess";

export default function NotaryPanel() {
  const { notarySession, reservations, folderTasks, getProperty } = useApp();
  if (!notarySession) return <Navigate to="/escribanos" replace />;

  const notary = NOTARIES.find((n) => n.id === notarySession);
  const folders = reservations.filter((r) => r.notaryId === notarySession);

  const enriched = folders
    .map((r) => {
      const p = getProperty(r.propertyId);
      if (!p) return null;
      const prog = folderProgress(folderTasks[r.id]);
      return { r, p, prog, ret: retentionBreakdown(p.price) };
    })
    .filter(Boolean);

  const pendingSignatures = enriched.filter((f) => f.prog.current <= 3).length;
  const totalRetentions = enriched.reduce((s, f) => s + (f.ret.items.find((i) => i.highlight)?.amount ?? 0), 0);
  const totalFees = enriched.reduce((s, f) => s + f.ret.fee, 0);

  const stats = [
    { icon: FolderOpen, label: "Carpetas activas", value: enriched.length },
    { icon: PenLine, label: "Firmas pendientes", value: pendingSignatures },
    { icon: HandCoins, label: "Comisión 1% a rendir", value: formatUSD(totalRetentions) },
    { icon: CalendarDays, label: "Honorarios proyectados", value: formatUSD(totalFees) },
  ];

  return (
    <div className="px-4 py-6">
      <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">{notary.registro}</p>
      <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-1" data-testid="notary-panel-title">
        Hola, {notary.titular}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <Icon className="h-5 w-5 text-[#142A5C]" />
            <p className="font-heading font-extrabold text-xl tracking-tight mt-2">{value}</p>
            <p className="text-[11px] text-[#666666] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="carpetas" className="mt-6">
        <TabsList className="w-full grid grid-cols-2 bg-white border border-gray-100">
          <TabsTrigger value="carpetas" data-testid="notary-tab-carpetas" className="text-xs">
            Carpetas
          </TabsTrigger>
          <TabsTrigger value="agenda" data-testid="notary-tab-agenda" className="text-xs">
            Agenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carpetas" className="mt-4 space-y-3">
          {enriched.length === 0 && (
            <div className="text-center py-14 bg-white rounded-lg border border-gray-100" data-testid="notary-folders-empty">
              <Inbox className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-sm text-[#666666] mt-3 max-w-xs mx-auto">
                Sin carpetas todavía. Se crean automáticamente cuando un comprador reserva una propiedad y elige tu
                escribanía en el marketplace.
              </p>
            </div>
          )}
          {enriched.map(({ r, p, prog }) => (
            <Link
              key={r.id}
              to={`/escribanos/carpeta/${r.id}`}
              data-testid={`notary-folder-${r.id}`}
              className="block bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                <img src={p.images[0]} alt={p.title} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm line-clamp-1">{p.address} · {p.neighborhood}</p>
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  </div>
                  <p className="text-xs text-[#666666] mt-0.5 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {r.buyer || CURRENT_USER.name} (comprador) · {p.seller.name} (vendedor)
                  </p>
                  <p className="text-xs text-[#666666] mt-0.5">
                    {formatUSD(p.price)} · Operación {r.paymentId}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#142A5C] rounded-full" style={{ width: `${(prog.done / prog.total) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#666666]">{prog.done}/{prog.total}</span>
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 mt-2 bg-blue-50 text-[#142A5C]">
                    {prog.current >= STAGES.length ? "Carpeta completa" : `Etapa ${prog.current + 1}: ${STAGES[prog.current].title}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="agenda" className="mt-4 space-y-3">
          {enriched.length === 0 && (
            <div className="text-center py-14 bg-white rounded-lg border border-gray-100" data-testid="notary-agenda-empty">
              <CalendarDays className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-sm text-[#666666] mt-3">Tu agenda se completa con las firmas y revisiones de cada carpeta.</p>
            </div>
          )}
          {enriched.flatMap(({ r, p, prog }) => [
            {
              id: `${r.id}-rev`,
              title: `Revisión de carpeta y certificados — ${p.neighborhood}`,
              sub: `Carpeta ${r.paymentId} · creada el ${r.date}`,
              status: prog.current >= 1 ? "Completada" : "En curso",
              done: prog.current >= 1,
            },
            {
              id: `${r.id}-firma`,
              title: `Firma de escritura — ${p.address}`,
              sub: `${r.buyer || CURRENT_USER.name} y ${p.seller.name} · lectura de protocolo (~45 min)`,
              status: prog.current >= 4 ? "Firmada" : prog.current >= 3 ? "Lista para coordinar" : "A coordinar",
              done: prog.current >= 4,
            },
          ]).map((item) => (
            <div key={item.id} data-testid={`agenda-item-${item.id}`} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <span className={`rounded-lg p-2.5 ${item.done ? "bg-green-50" : "bg-[#F0F2F7]"}`}>
                <CalendarDays className={`h-5 w-5 ${item.done ? "text-[#00A650]" : "text-[#142A5C]"}`} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-[#666666] mt-0.5 line-clamp-1">{item.sub}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shrink-0 ${item.done ? "bg-green-50 text-[#00A650]" : "bg-yellow-50 text-yellow-700"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
