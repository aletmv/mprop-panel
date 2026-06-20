import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Scale, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { NOTARIES } from "@/data/mock";

export default function NotaryLogin() {
  const navigate = useNavigate();
  const { notarySession, notaryLogin } = useApp();
  const [notaryId, setNotaryId] = useState("n1");
  const [email, setEmail] = useState("demo@escribania.com");
  const [password, setPassword] = useState("demo1234");

  if (notarySession) return <Navigate to="/escribanos/panel" replace />;

  const login = () => {
    if (!email || !password) return;
    notaryLogin(notaryId);
    toast.success("Sesión iniciada en el Portal de Escribanías");
    navigate("/escribanos/panel");
  };

  return (
    <div className="px-4 py-12 max-w-md mx-auto">
      <div className="text-center">
        <span className="inline-flex bg-[#142A5C] rounded-2xl p-4">
          <Scale className="h-10 w-10 text-[#FFE600]" />
        </span>
        <h1 className="font-extrabold text-2xl tracking-tight mt-4">Portal de Escribanías</h1>
        <p className="text-sm text-[#666666] mt-1">
          Gestioná tu agenda, tus legajos y operaciones desde un solo lugar.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mt-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Escribanía</label>
          <select
            data-testid="notary-login-select"
            value={notaryId}
            onChange={(e) => setNotaryId(e.target.value)}
            className="w-full border border-gray-300 rounded-md focus:ring-[#142A5C] focus:border-[#142A5C] focus:outline-none py-3 px-3 text-sm mt-2 bg-white"
          >
            {NOTARIES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} — {n.titular}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Email</label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              data-testid="notary-login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md focus:ring-[#142A5C] focus:border-[#142A5C] focus:outline-none py-3 pl-10 pr-4 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Contraseña</label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              data-testid="notary-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md focus:ring-[#142A5C] focus:border-[#142A5C] focus:outline-none py-3 pl-10 pr-4 text-sm"
            />
          </div>
        </div>
        <button
          data-testid="notary-login-btn"
          onClick={login}
          disabled={!email || !password}
          className="w-full bg-[#142A5C] text-white hover:bg-[#1d3a7a] disabled:bg-gray-300 font-semibold rounded-md px-6 py-3.5 transition-colors"
        >
          Ingresar al portal
        </button>
        <p className="text-[11px] text-[#666666] text-center flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00A650]" /> Acceso demo · cualquier credencial es válida
        </p>
      </div>
    </div>
  );
}
