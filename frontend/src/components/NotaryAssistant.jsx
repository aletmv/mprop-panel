import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { aiReply, aiFreeReply } from "@/data/notaryProcess";

const CHIPS = [
  { key: "resumen", label: "Resumen de la carpeta" },
  { key: "siguiente", label: "¿Qué sigue?" },
  { key: "retenciones", label: "Calcular retenciones" },
  { key: "minuta", label: "Redactar minuta" },
];

export const NotaryAssistant = ({ ctx }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "ai", text: aiReply("bienvenida", ctx) }]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const respond = (replyText) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: replyText }]);
      setTyping(false);
    }, 900);
  };

  const sendChip = (chip) => {
    setMessages((m) => [...m, { role: "user", text: chip.label }]);
    respond(aiReply(chip.key, ctx));
  };

  const sendFree = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    respond(aiFreeReply(text, ctx));
  };

  return (
    <>
      {!open && (
        <button
          data-testid="ai-assistant-open"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 sm:bottom-5 right-4 z-40 bg-[#142A5C] text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:bg-[#1d3a7a] transition-colors flex items-center gap-2"
        >
          <Sparkles className="h-5 w-5 text-[#FFE600]" />
          <span className="text-sm font-semibold">Asistente IA</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-5 sm:right-4 z-50 sm:w-[400px]" data-testid="ai-assistant-panel">
          <div className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-200 flex flex-col h-[70vh] sm:h-[540px]">
            <div className="bg-[#142A5C] text-white sm:rounded-t-2xl rounded-t-2xl px-4 py-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#FFE600]" />
              <div className="flex-1">
                <p className="text-sm font-bold">Asistente IA notarial</p>
                <p className="text-[10px] text-white/70">Conoce tu carpeta y el proceso completo · demo simulada</p>
              </div>
              <button data-testid="ai-assistant-close" onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  data-testid={`ai-message-${i}`}
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    m.role === "ai" ? "bg-[#F0F2F7] text-[#333333]" : "bg-[#142A5C] text-white ml-auto"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="bg-[#F0F2F7] rounded-2xl px-3.5 py-2.5 w-16 flex gap-1 items-center" data-testid="ai-typing">
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:240ms]" />
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="px-3 pb-1 flex gap-1.5 flex-wrap">
              {CHIPS.map((c) => (
                <button
                  key={c.key}
                  data-testid={`ai-chip-${c.key}`}
                  onClick={() => sendChip(c)}
                  disabled={typing}
                  className="text-[11px] font-semibold rounded-full px-3 py-1.5 bg-blue-50 text-[#142A5C] hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                data-testid="ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendFree()}
                placeholder="Preguntale al asistente..."
                className="flex-1 min-w-0 border border-gray-300 rounded-full focus:ring-[#142A5C] focus:border-[#142A5C] focus:outline-none py-2.5 px-4 text-sm"
              />
              <button
                data-testid="ai-send"
                onClick={sendFree}
                disabled={!input.trim() || typing}
                className="bg-[#142A5C] text-white rounded-full p-2.5 hover:bg-[#1d3a7a] disabled:bg-gray-300 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
