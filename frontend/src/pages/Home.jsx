import { useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PropertyCard } from "@/components/PropertyCard";
import { HeroBanner } from "@/components/HeroBanner";

const FILTERS = ["Todos", "Departamento", "Casa", "PH"];

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
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              data-testid={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs font-semibold rounded-full px-4 py-2 transition-colors ${
                filter === f ? "bg-[#3483FA] text-white" : "bg-white text-[#666666] border border-gray-200 hover:border-[#3483FA]"
              }`}
            >
              {f}
            </button>
          ))}
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
