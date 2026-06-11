import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  ScanFace,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { IMG } from "@/data/mock";

const STEPS = [
  { key: "selfie", title: "Subí una selfie", hint: "Mirá de frente, con buena luz y sin anteojos.", icon: ScanFace, demo: IMG.avatarM },
  { key: "front", title: "Foto del frente del DNI", hint: "Apoyá el documento sobre una superficie plana.", icon: CreditCard, demo: IMG.map },
  { key: "back", title: "Foto del dorso del DNI", hint: "Asegurate de que el código sea legible.", icon: CreditCard, demo: IMG.map },
];

const PROCESS_MSGS = [
  "Detectando rostro en la selfie...",
  "Comparando con la foto del documento...",
  "Validando datos con RENAPER...",
  "Generando tu identidad digital...",
];

export default function Verification() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("return") || "/perfil";
  const { verified, setVerified } = useApp();

  const [step, setStep] = useState(verified ? 4 : 0);
  const [captures, setCaptures] = useState({});
  const [processMsg, setProcessMsg] = useState(0);
  const fileRef = useRef(null);

  const current = STEPS[Math.min(step, 2)];

  const capture = (src) => {
    setCaptures((c) => ({ ...c, [current.key]: src }));
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file) capture(URL.createObjectURL(file));
  };

  const next = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setStep(3);
      let i = 0;
      const interval = setInterval(() => {
        i += 1;
        if (i < PROCESS_MSGS.length) {
          setProcessMsg(i);
        } else {
          clearInterval(interval);
          setVerified();
          setStep(4);
        }
      }, 900);
    }
  };

  if (step === 4) {
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <span className="inline-flex bg-green-50 rounded-full p-4">
            <ShieldCheck className="h-12 w-12 text-[#00A650]" />
          </span>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-4" data-testid="verification-success-title">
            ¡Identidad verificada!
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            Tu selfie coincide con el documento. Ya podés ofertar, reservar y publicar propiedades en MercadoProp.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#00A650] font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Biometría facial
            <CheckCircle2 className="h-4 w-4 ml-2" /> DNI validado
          </div>
          <button
            data-testid="verification-continue-btn"
            onClick={() => navigate(returnTo)}
            className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors mt-6"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <Loader2 className="h-12 w-12 text-[#3483FA] mx-auto animate-spin" />
          <h1 className="font-heading font-extrabold text-xl tracking-tight mt-4">Validando tu identidad</h1>
          <p className="text-sm text-[#666666] mt-2" data-testid="verification-processing-msg">
            {PROCESS_MSGS[processMsg]}
          </p>
          <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3483FA] rounded-full transition-all duration-700"
              style={{ width: `${((processMsg + 1) / PROCESS_MSGS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  const captured = captures[current.key];
  const Icon = current.icon;

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <button data-testid="verification-back-btn" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[#3483FA] font-semibold">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="flex gap-1.5 mt-5">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#3483FA]" : "bg-gray-200"}`} />
        ))}
      </div>

      <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">
        Validación de identidad · Paso {step + 1} de 3
      </p>
      <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-1" data-testid="verification-step-title">
        {current.title}
      </h1>
      <p className="text-sm text-[#666666] mt-1">{current.hint}</p>

      <div className="mt-5 bg-[#1a1a1a] rounded-xl overflow-hidden relative aspect-[3/4] flex items-center justify-center">
        {captured ? (
          <>
            <img src={captured} alt="Captura" className="w-full h-full object-cover" />
            <span className="absolute top-3 right-3 bg-[#00A650] text-white rounded-full p-1.5" data-testid="capture-success-check">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </>
        ) : (
          <>
            <div
              className={`absolute border-2 border-dashed border-white/70 ${
                current.key === "selfie" ? "w-44 h-56 rounded-[50%]" : "w-64 h-40 rounded-lg"
              }`}
            />
            <Icon className="h-10 w-10 text-white/50" />
          </>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFile} data-testid="verification-file-input" />

      <div className="mt-5 space-y-3">
        {!captured ? (
          <>
            <button
              data-testid="capture-photo-btn"
              onClick={() => fileRef.current?.click()}
              className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5" /> Subir foto
            </button>
            <button
              data-testid="use-demo-photo-btn"
              onClick={() => capture(current.demo)}
              className="w-full border border-[#3483FA] text-[#3483FA] hover:bg-blue-50 font-semibold rounded-md px-6 py-3.5 transition-colors text-sm"
            >
              Usar foto de demo
            </button>
          </>
        ) : (
          <>
            <button
              data-testid="verification-next-btn"
              onClick={next}
              className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors"
            >
              {step < 2 ? "Continuar" : "Validar identidad"}
            </button>
            <button
              data-testid="retake-photo-btn"
              onClick={() => setCaptures((c) => ({ ...c, [current.key]: null }))}
              className="w-full text-[#3483FA] font-semibold text-sm py-2 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Volver a tomar
            </button>
          </>
        )}
      </div>

      <p className="text-[11px] text-[#666666] text-center mt-4 leading-relaxed">
        Tus datos se procesan de forma segura y encriptada. Demo simulada: no se envía información a ningún servidor.
      </p>
    </div>
  );
}
