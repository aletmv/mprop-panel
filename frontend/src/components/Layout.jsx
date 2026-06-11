import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, PlusSquare, User, ShieldCheck, Scale } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NotaryShell } from "@/components/NotaryShell";
import { Logo } from "@/components/Logo";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const navItems = [
  { to: "/", label: "Inicio", icon: Home, testId: "nav-home" },
  { to: "/publicar", label: "Publicar", icon: PlusSquare, testId: "nav-publish" },
  { to: "/perfil", label: "Mi cuenta", icon: User, testId: "nav-profile" },
];

export const Layout = ({ children }) => {
  const { verified } = useApp();
  const { pathname } = useLocation();

  if (pathname.startsWith("/escribanos")) {
    return (
      <>
        <ScrollToTop />
        <NotaryShell>{children}</NotaryShell>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-body text-[#333333]">
      <ScrollToTop />
      <header className="sticky top-0 z-40 bg-[#FFE600] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" data-testid="header-logo" className="flex items-center">
            <Logo />
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            {navItems.map(({ to, label, testId }) => (
              <NavLink
                key={to}
                to={to}
                data-testid={`desktop-${testId}`}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${isActive ? "text-[#3483FA]" : "text-[#333333] hover:text-[#3483FA]"}`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/escribanos"
              data-testid="desktop-nav-notary-portal"
              className="text-sm font-semibold text-[#333333] hover:text-[#3483FA] transition-colors flex items-center gap-1"
            >
              <Scale className="h-4 w-4" /> Escribanos
            </Link>
          </nav>
          {verified && (
            <span
              data-testid="header-verified-badge"
              className="sm:hidden flex items-center gap-1 text-[10px] font-bold text-[#00A650] bg-white rounded-full px-2 py-1"
            >
              <ShieldCheck className="h-3 w-3" /> Verificado
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto pb-24 sm:pb-12">{children}</main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex">
        {navItems.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={testId}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-[#3483FA]" : "text-gray-500"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
