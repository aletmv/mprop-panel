import { Link } from "react-router-dom";
import { MapPin, BedDouble, Ruler, ShieldCheck } from "lucide-react";
import { formatUSD } from "@/data/mock";

export const PropertyCard = ({ property, mine = false }) => (
  <Link
    to={`/propiedad/${property.id}`}
    data-testid={`property-card-${property.id}`}
    className="block bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
      {mine && (
        <span className="absolute top-2 left-2 bg-[#FFE600] text-[#333333] text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1">
          Tu publicación
        </span>
      )}
      {property.publishedDays <= 3 && !mine && (
        <span className="absolute top-2 left-2 bg-[#00A650] text-white text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1">
          Nuevo
        </span>
      )}
    </div>
    <div className="p-4">
      <p className="font-heading font-extrabold text-xl tracking-tight" data-testid={`property-price-${property.id}`}>
        {formatUSD(property.price)}
      </p>
      <p className="text-sm text-[#333333] mt-1 line-clamp-1">{property.title}</p>
      <p className="text-xs text-[#666666] mt-1 flex items-center gap-1">
        <MapPin className="h-3 w-3" /> {property.neighborhood}, {property.city}
      </p>
      <div className="flex items-center gap-3 mt-3 text-xs text-[#666666]">
        <span className="flex items-center gap-1">
          <Ruler className="h-3.5 w-3.5" /> {property.m2} m²
        </span>
        <span className="flex items-center gap-1">
          <BedDouble className="h-3.5 w-3.5" /> {property.ambientes} amb.
        </span>
        {property.seller?.verified && (
          <span className="flex items-center gap-1 text-[#00A650] font-semibold ml-auto">
            <ShieldCheck className="h-3.5 w-3.5" /> Verificado
          </span>
        )}
      </div>
    </div>
  </Link>
);
