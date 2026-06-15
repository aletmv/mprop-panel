import { useState } from "react";
import { Search, LayoutGrid, Building2, Home as HomeIcon, Building, Map, Trees } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PropertyCard } from "@/components/PropertyCard";
import { HeroBanner } from "@/components/HeroBanner";

const CATEGORIES = [
  { key: "Todos", label: "Todos", icon: LayoutGrid },
  { key: "Departamento", label: "Departamento", icon: Building2 },
  { key: "Casa", label: "Casa", icon: HomeIcon },
  { key: "PH", label: "PH", icon: Building },
  { key: "Lote", label: "Lote", icon: Map },
  { key: "Terreno", label: "Terreno", icon: Trees },
];

export default function Home() {
  const { allProperties, published } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");

  const results = allProperties.filter((p) => {
    const matchType = filter === "Todos" || p.type === filter;
    const q = query.toLowerCase();
    const matchQuery =
      !q || p.title.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
    return matchType && matchQuery;
  });

  const publishedIds = new Set(published.map((p) => p.id));

  return (
    <div>
      <div className="bg-[#FFE600] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="max-w-5xl mx-auto">
          <div className="px-4 pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                data-testid="home-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá por barrio, ciudad o tipo..."
                className="w-full bg-white rounded-full shadow-sm border-0 py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
              />
            </div>
          </div>
          <HeroBanner />
        </div>
      </div>

      <div className="px-4 mt-5">
        <h2 className="font-heading font-extrabold text-lg tracking-tight text-[#333333]">Explorá por tipo</h2>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 mt-3 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                data-testid={`filter-${key.toLowerCase()}`}
                onClick={() => setFilter(key)}
                className="shrink-0 flex flex-col items-center gap-2 group focus:outline-none"
              >
                <span
                  className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl flex items-center justify-center bg-[#F5F5F5] transition-colors border-2 ${
                    active ? "border-[#3483FA]" : "border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-9 w-9 sm:h-11 sm:w-11 ${active ? "text-[#3483FA]" : "text-[#333333]"}`}
                    strokeWidth={1.8}
                  />
                </span>
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors ${
                    active ? "text-[#3483FA]" : "text-[#333333]"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#666666] mt-4 uppercase tracking-widest font-semibold" data-testid="results-count">
          {results.length} propiedades
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {results.map((p) => (
            <PropertyCard key={p.id} property={p} mine={publishedIds.has(p.id)} />
          ))}
        </div>
        {results.length === 0 && (
          <p className="text-center text-sm text-[#666666] py-16" data-testid="empty-results">
            No encontramos propiedades con esos filtros.
          </p>
        )}
      </div>
    </div>
  );
}
