import { Link, useNavigate } from "react-router-dom";
import { LogOut, Store } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NOTARIES } from "@/data/mock";
import { Logo } from "@/components/Logo";

export const NotaryShell = ({ children }) => {
  const { notarySession, notaryLogout } = useApp();
  const navigate = useNavigate();
  const notary = NOTARIES.find((n) => n.id === notarySession);

  return (
    <div className="min-h-screen bg-[#F0F2F7] font-body text-[#333333]">
      <header className="sticky top-0 z-40 bg-[#142A5C] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to={notarySession ? "/escribanos/panel" : "/escribanos"} data-testid="notary-header-logo" className="flex items-center min-w-0">
            <Logo variant="dark" tag="Escribanías" />
          </Link>
          <div className="flex items-center gap-3 shrink-0">
            {notary && (
              <span className="hidden sm:block text-xs text-white/80" data-testid="notary-session-name">
                {notary.titular}
              </span>
            )}
            <Link to="/" data-testid="notary-go-marketplace" className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1">
              <Store className="h-4 w-4" /> <span className="hidden sm:inline">Marketplace</span>
            </Link>
            {notarySession && (
              <button
                data-testid="notary-logout-btn"
                onClick={() => {
                  notaryLogout();
                  navigate("/escribanos");
                }}
                className="text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Salir
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto pb-12">{children}</main>
    </div>
  );
};
