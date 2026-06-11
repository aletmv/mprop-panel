import { useRef, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, ChevronDown, Users, Landmark, HandCoins, Paperclip, FileCheck2, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { CURRENT_USER, formatUSD } from "@/data/mock";
import { STAGES, taskId, docId, folderProgress, retentionBreakdown } from "@/data/notaryProcess";
import { NotaryAssistant } from "@/components/NotaryAssistant";

const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32);

export default function NotaryFolder() {
  const { resId } = useParams();
  const navigate = useNavigate();
  const { notarySession, reservations, folderTasks, folderDocs, toggleFolderTask, addFolderDoc, removeFolderDoc, getProperty } = useApp();
  const [openStage, setOpenStage] = useState(null);
  const [pendingDoc, setPendingDoc] = useState(null);
  const fileRef = useRef(null);

  if (!notarySession) return <Navigate to="/escribanos" replace />;
  const reservation = reservations.find((r) => r.id === resId && r.notaryId === notarySession);
  if (!reservation) return <Navigate to="/escribanos/panel" replace />;

  const p = getProperty(reservation.propertyId);
  const tasks = folderTasks[resId] || {};
  const docs = folderDocs[resId] || {};
  const prog = folderProgress(tasks);
  const ret = retentionBreakdown(p.price);
  const expanded = openStage === null ? Math.min(prog.current, STAGES.length - 1) : openStage;

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f && pendingDoc) {
      addFolderDoc(resId, pendingDoc, {
        name: f.name,
        size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`,
        date: new Date().toLocaleDateString("es-AR"),
      });
      toast.success("Documento adjuntado a la carpeta");
    }
    e.target.value = "";
    setPendingDoc(null);
  };

  const attachDemo = (dId, label) => {
    addFolderDoc(resId, dId, { name: `${slug(label)}.pdf`, size: "840 KB", date: new Date().toLocaleDateString("es-AR") });
    toast.success("Documento de demo adjuntado");
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <button data-testid="folder-back-btn" onClick={() => navigate("/escribanos/panel")} className="flex items-center gap-1 text-sm text-[#142A5C] font-semibold">
        <ArrowLeft className="h-4 w-4" /> Mis carpetas
      </button>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mt-4">
        <div className="flex gap-3">
          <img src={p.images[0]} alt={p.title} className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-lg tracking-tight line-clamp-1" data-testid="folder-title">
              {p.address}
            </h1>
            <p className="text-xs text-[#666666]">{p.neighborhood}, {p.city} · {formatUSD(p.price)} · Op. {reservation.paymentId}</p>
            <p className="text-xs text-[#666666] mt-1 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {reservation.buyer || CURRENT_USER.name} (comprador) · {p.seller.name} (vendedor)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#142A5C] rounded-full transition-all duration-300" style={{ width: `${(prog.done / prog.total) * 100}%` }} />
          </div>
          <span className="text-xs font-bold" data-testid="folder-progress">{prog.done}/{prog.total} tareas</span>
        </div>
        {prog.current < STAGES.length ? (
          <p className="text-xs text-[#666666] mt-2" data-testid="folder-next-stage">
            Etapa actual: <span className="font-bold text-[#142A5C]">{STAGES[prog.current].title}</span>
            {prog.current < STAGES.length - 1 ? (
              <> · Próxima: <span className="font-semibold">{STAGES[prog.current + 1].title}</span></>
            ) : (
              <> · Última etapa del proceso</>
            )}
          </p>
        ) : (
          <p className="text-xs font-bold text-[#00A650] mt-2 flex items-center gap-1" data-testid="folder-complete-badge">
            <CheckCircle2 className="h-4 w-4" /> Carpeta completa · escritura presentada en el DNRPI
          </p>
        )}
      </div>

      <div className="space-y-3 mt-4">
        {STAGES.map((stage, si) => {
          const stageDone = stage.tasks.every((_, ti) => tasks[taskId(si, ti)]);
          const isOpen = expanded === si;
          const docsAttached = stage.docs.filter((_, di) => docs[docId(si, di)]).length;
          return (
            <div key={stage.title} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <button
                data-testid={`stage-header-${si}`}
                onClick={() => setOpenStage(isOpen ? -1 : si)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    stageDone ? "bg-[#00A650] text-white" : si === prog.current ? "bg-[#142A5C] text-white" : "bg-gray-100 text-[#666666]"
                  }`}
                >
                  {stageDone ? <CheckCircle2 className="h-5 w-5" /> : si + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{stage.title}</p>
                  <p className="text-[11px] text-[#666666] line-clamp-1">{stage.desc}</p>
                </div>
                <span
                  data-testid={`stage-docs-count-${si}`}
                  className={`flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-1 shrink-0 ${
                    docsAttached === stage.docs.length ? "bg-green-50 text-[#00A650]" : "bg-gray-100 text-[#666666]"
                  }`}
                >
                  <Paperclip className="h-3 w-3" /> {docsAttached}/{stage.docs.length}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {stage.tasks.map((t, ti) => {
                    const id = taskId(si, ti);
                    const done = !!tasks[id];
                    return (
                      <button
                        key={id}
                        data-testid={`task-${id}`}
                        onClick={() => toggleFolderTask(resId, id)}
                        className={`w-full flex gap-3 items-start text-left rounded-lg border p-3 transition-colors ${
                          done ? "border-green-100 bg-green-50/50" : "border-gray-200 hover:border-[#142A5C]"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-[#00A650] shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold ${done ? "text-[#00A650]" : ""}`}>{t.label}</span>
                          <span className="block text-xs text-[#666666] mt-0.5 leading-relaxed">{t.detail}</span>
                        </span>
                      </button>
                    );
                  })}

                  {si === 2 && (
                    <div className="bg-[#F0F2F7] rounded-lg p-4 mt-2" data-testid="retention-table">
                      <p className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold flex items-center gap-1.5">
                        <HandCoins className="h-3.5 w-3.5" /> Mesa de retenciones · {formatUSD(p.price)}
                      </p>
                      <div className="space-y-2 mt-3">
                        {ret.items.map((i) => (
                          <div key={i.label} className={`flex justify-between gap-3 text-xs ${i.highlight ? "bg-[#FFE600]/40 -mx-2 px-2 py-1.5 rounded" : ""}`}>
                            <span>
                              <span className={i.highlight ? "font-bold" : ""}>{i.label}</span>
                              <span className="block text-[10px] text-[#666666]">{i.note}</span>
                            </span>
                            <span className="font-bold shrink-0">{i.amount === 0 ? "Sin deuda" : formatUSD(i.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs border-t border-gray-200 pt-2 font-bold">
                          <span>Total a retener</span>
                          <span data-testid="retention-total">{formatUSD(ret.total)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#666666]">
                          <span className="flex items-center gap-1"><Landmark className="h-3 w-3" /> Tus honorarios (1,5%)</span>
                          <span className="font-semibold">{formatUSD(ret.fee)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 mt-3" data-testid={`stage-docs-${si}`}>
                    <p className="text-[10px] uppercase tracking-widest text-[#666666] font-semibold flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" /> Documentación requerida · {docsAttached}/{stage.docs.length}
                    </p>
                    <div className="space-y-2 mt-2">
                      {stage.docs.map((d, di) => {
                        const dId = docId(si, di);
                        const file = docs[dId];
                        return file ? (
                          <div
                            key={dId}
                            data-testid={`doc-attached-${dId}`}
                            className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50/50 p-3"
                          >
                            <FileCheck2 className="h-5 w-5 text-[#00A650] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold line-clamp-1">{d.label}</p>
                              <p className="text-[11px] text-[#666666] line-clamp-1">
                                {file.name} · {file.size} · {file.date}
                              </p>
                            </div>
                            <button
                              data-testid={`doc-remove-${dId}`}
                              onClick={() => removeFolderDoc(resId, dId)}
                              className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                              aria-label="Quitar documento"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            key={dId}
                            data-testid={`doc-empty-${dId}`}
                            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-3"
                          >
                            <Paperclip className="h-5 w-5 text-gray-300 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold line-clamp-1">{d.label}</p>
                              <p className="text-[11px] text-[#666666] line-clamp-1">{d.hint}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                data-testid={`doc-attach-${dId}`}
                                onClick={() => {
                                  setPendingDoc(dId);
                                  fileRef.current?.click();
                                }}
                                className="text-[11px] font-bold text-white bg-[#142A5C] hover:bg-[#1d3a7a] rounded-full px-3 py-1.5 transition-colors"
                              >
                                Adjuntar
                              </button>
                              <button
                                data-testid={`doc-demo-${dId}`}
                                onClick={() => attachDemo(dId, d.label)}
                                className="text-[11px] font-bold text-[#142A5C] border border-[#142A5C]/30 hover:bg-blue-50 rounded-full px-3 py-1.5 transition-colors"
                              >
                                Demo
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={onFile} data-testid="folder-doc-input" />

      <NotaryAssistant
        ctx={{
          p,
          price: p.price,
          buyer: reservation.buyer || CURRENT_USER.name,
          seller: p.seller.name,
          stageIdx: prog.current,
          done: prog.done,
          total: prog.total,
          paymentId: reservation.paymentId,
        }}
      />
    </div>
  );
}
