import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, ShieldCheck, ShieldAlert, CheckCircle2, PartyPopper, Camera, Star, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { CURRENT_USER, IMG, PHOTOGRAPHERS, formatUSD } from "@/data/mock";

const TYPES = ["Departamento", "Casa", "PH"];

export default function Publish() {
  const navigate = useNavigate();
  const { verified, addPublished } = useApp();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    type: "Departamento",
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    m2: "",
    address: "",
    neighborhood: "",
    city: "CABA",
    title: "",
    description: "",
    price: "",
    photos: [],
    photographerId: null,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) set("photos", [...form.photos, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const canNext = [
    form.m2 && Number(form.m2) > 0,
    form.address && form.neighborhood,
    form.title && form.price && Number(form.price) > 0,
    true,
    verified,
  ][step];

  const publish = () => {
    addPublished({
      title: form.title,
      type: form.type,
      price: Number(form.price),
      expensas: 0,
      neighborhood: form.neighborhood,
      city: form.city,
      address: form.address,
      ambientes: Number(form.ambientes),
      dormitorios: Number(form.dormitorios),
      banos: Number(form.banos),
      m2: Number(form.m2),
      m2cub: Number(form.m2),
      antiguedad: 0,
      cochera: false,
      publishedDays: 0,
      description: form.description || "Publicación de particular verificado en MercadoProp.",
      features: ["Vendedor verificado", "Operación con respaldo MercadoPago", "Publicación particular"],
      images: form.photos.length ? form.photos : [IMG.prop1, IMG.prop2, IMG.prop3],
      seller: { name: CURRENT_USER.name, avatar: CURRENT_USER.avatar, verified: true, rating: 5.0, sales: 0, memberSince: CURRENT_USER.memberSince },
    });
    setDone(true);
    toast.success("¡Tu propiedad ya está publicada!");
  };

  if (done) {
    const photog = PHOTOGRAPHERS.find((f) => f.id === form.photographerId);
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <span className="inline-flex bg-green-50 rounded-full p-4">
            <PartyPopper className="h-12 w-12 text-[#00A650]" />
          </span>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-4" data-testid="publish-success-title">
            ¡Publicación creada!
          </h1>
          <p className="text-sm text-[#666666] mt-2">
            {form.title} ya aparece en el marketplace por {formatUSD(Number(form.price))}. Te avisamos cuando recibas
            visitas u ofertas.
          </p>
          {photog && (
            <p className="text-sm bg-blue-50 rounded-lg p-3 mt-3 flex items-center gap-2 text-left" data-testid="publish-success-photographer">
              <Camera className="h-4 w-4 text-[#3483FA] shrink-0" />
              <span className="text-xs">
                <span className="font-bold">{photog.name}</span> te va a contactar en 24 hs para coordinar la sesión de
                fotos profesional.
              </span>
            </p>
          )}
          <button
            data-testid="publish-view-listing-btn"
            onClick={() => navigate("/")}
            className="w-full bg-[#3483FA] text-white hover:bg-blue-600 font-semibold rounded-md px-6 py-3.5 transition-colors mt-6"
          >
            Ver en el marketplace
          </button>
        </div>
      </div>
    );
  }

  const stepTitles = ["Datos de la propiedad", "Ubicación", "Fotos y precio", "Fotografía profesional", "Verificación y publicación"];

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <button
        data-testid="publish-back-btn"
        onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
        className="flex items-center gap-1 text-sm text-[#3483FA] font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="flex gap-1.5 mt-5">
        {stepTitles.map((t, i) => (
          <div key={t} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#3483FA]" : "bg-gray-200"}`} />
        ))}
      </div>

      <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold mt-6">
        Publicá tu propiedad · Paso {step + 1} de 5
      </p>
      <h1 className="font-heading font-extrabold text-2xl tracking-tight mt-1" data-testid="publish-step-title">
        {stepTitles[step]}
      </h1>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mt-4 space-y-4">
        {step === 0 && (
          <>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Tipo de propiedad</label>
              <div className="flex gap-2 mt-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    data-testid={`publish-type-${t.toLowerCase()}`}
                    onClick={() => set("type", t)}
                    className={`flex-1 text-sm font-semibold rounded-md border py-2.5 transition-colors ${
                      form.type === t ? "bg-[#3483FA] text-white border-[#3483FA]" : "border-gray-200 text-[#666666]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {[
              { k: "ambientes", label: "Ambientes" },
              { k: "dormitorios", label: "Dormitorios" },
              { k: "banos", label: "Baños" },
            ].map(({ k, label }) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center gap-3">
                  <button
                    data-testid={`publish-${k}-minus`}
                    onClick={() => set(k, Math.max(1, form[k] - 1))}
                    className="h-8 w-8 rounded-full border border-gray-300 text-[#3483FA] font-bold"
                  >
                    −
                  </button>
                  <span className="font-heading font-extrabold w-5 text-center" data-testid={`publish-${k}-value`}>{form[k]}</span>
                  <button
                    data-testid={`publish-${k}-plus`}
                    onClick={() => set(k, form[k] + 1)}
                    className="h-8 w-8 rounded-full border border-gray-300 text-[#3483FA] font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Superficie total (m²)</label>
              <input
                data-testid="publish-m2-input"
                inputMode="numeric"
                value={form.m2}
                onChange={(e) => set("m2", e.target.value.replace(/\D/g, ""))}
                placeholder="Ej.: 75"
                className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Dirección</label>
              <input
                data-testid="publish-address-input"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Ej.: Av. Rivadavia 5500, 3° A"
                className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Barrio</label>
              <input
                data-testid="publish-neighborhood-input"
                value={form.neighborhood}
                onChange={(e) => set("neighborhood", e.target.value)}
                placeholder="Ej.: Caballito"
                className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Ciudad</label>
              <input
                data-testid="publish-city-input"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
              />
            </div>
            <div className="relative h-32 rounded-lg overflow-hidden">
              <img src={IMG.map} alt="Mapa" className="w-full h-full object-cover opacity-80" />
              <p className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[11px] text-center py-1.5">
                La ubicación exacta solo se comparte con compradores verificados
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Título del aviso</label>
              <input
                data-testid="publish-title-input"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ej.: Depto 3 amb. luminoso con balcón"
                className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Descripción</label>
              <textarea
                data-testid="publish-description-input"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Contá lo mejor de tu propiedad..."
                className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Precio de venta (U$S)</label>
              <input
                data-testid="publish-price-input"
                inputMode="numeric"
                value={form.price ? Number(form.price).toLocaleString("es-AR") : ""}
                onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))}
                placeholder="Ej.: 150.000"
                className="w-full border border-gray-300 rounded-md focus:ring-[#3483FA] focus:border-[#3483FA] focus:outline-none py-3 px-4 text-sm mt-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#666666] font-semibold">Fotos</label>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} data-testid="publish-photos-input" />
              <div className="grid grid-cols-3 gap-2 mt-2">
                {form.photos.map((src, i) => (
                  <img key={i} src={src} alt={`Foto ${i + 1}`} className="aspect-square rounded-lg object-cover" />
                ))}
                <button
                  data-testid="publish-add-photo-btn"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-[#666666] hover:border-[#3483FA] hover:text-[#3483FA] transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-[10px] font-semibold mt-1">Agregar</span>
                </button>
              </div>
              <p className="text-[11px] text-[#666666] mt-2">Si no subís fotos, usamos imágenes de demo.</p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-xs text-[#666666] -mt-1">
              Las publicaciones con fotos profesionales reciben hasta 3 veces más visitas. Elegí un fotógrafo del pool
              de MercadoProp o seguí con tus propias fotos.
            </p>
            <button
              data-testid="photographer-skip"
              onClick={() => set("photographerId", null)}
              className={`w-full flex items-center gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                form.photographerId === null ? "border-[#3483FA] ring-1 ring-[#3483FA]" : "border-gray-200 hover:border-[#3483FA]"
              }`}
            >
              <span className="bg-[#F5F5F5] rounded-full p-2.5">
                <Camera className="h-5 w-5 text-[#666666]" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">Voy a usar mis propias fotos</span>
                <span className="block text-xs text-[#666666]">Sin costo · usás las fotos que subiste en el paso anterior</span>
              </span>
              {form.photographerId === null && <CheckCircle2 className="h-5 w-5 text-[#3483FA] shrink-0" />}
            </button>

            <div className="space-y-2">
              {PHOTOGRAPHERS.map((f) => (
                <button
                  key={f.id}
                  data-testid={`photographer-card-${f.id}`}
                  onClick={() => set("photographerId", f.id)}
                  className={`w-full flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                    form.photographerId === f.id ? "border-[#3483FA] ring-1 ring-[#3483FA]" : "border-gray-200 hover:border-[#3483FA]"
                  }`}
                >
                  <img src={f.avatar} alt={f.name} className="h-12 w-12 rounded-full object-cover shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{f.name}</span>
                      {form.photographerId === f.id && <CheckCircle2 className="h-5 w-5 text-[#3483FA] shrink-0" />}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#666666] mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-[#FFE600] text-[#FFE600]" />
                      <span className="font-bold text-[#333333]">{f.rating}</span> ({f.reviews} reseñas) · {f.zone}
                    </span>
                    <span className="block text-[11px] text-[#00A650] font-semibold mt-0.5">{f.tag}</span>
                    <span className="flex items-center justify-between mt-1.5">
                      <a
                        href={`https://instagram.com/${f.ig}`}
                        target="_blank"
                        rel="noreferrer"
                        data-testid={`photographer-ig-${f.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#3483FA] hover:underline"
                      >
                        <Instagram className="h-3.5 w-3.5" /> @{f.ig}
                      </a>
                      <span className="text-xs font-bold">{formatUSD(f.price)} · sesión</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#666666]">
              La sesión se abona vía Mercado Pago al coordinar la visita del fotógrafo. Podés cancelar sin costo hasta
              24 hs antes.
            </p>
          </>
        )}

        {step === 4 && (
          <>
            {verified ? (
              <div className="bg-green-50 rounded-lg p-4 flex gap-3" data-testid="publish-verified-ok">
                <ShieldCheck className="h-5 w-5 text-[#00A650] shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  <span className="font-bold">Identidad verificada.</span> Tu publicación saldrá con el sello de
                  vendedor verificado, requisito para operar en MercadoProp.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4" data-testid="publish-needs-verification">
                <div className="flex gap-3">
                  <ShieldAlert className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <span className="font-bold">Falta verificar tu identidad.</span> Para publicar necesitás validar tu
                    selfie y DNI. Toma menos de 2 minutos.
                  </p>
                </div>
                <button
                  data-testid="publish-go-verify-btn"
                  onClick={() => navigate(`/verificacion?return=${encodeURIComponent("/publicar")}`)}
                  className="w-full bg-[#3483FA] text-white text-sm font-semibold rounded-md py-2.5 mt-3 hover:bg-blue-600 transition-colors"
                >
                  Verificar mi identidad
                </button>
              </div>
            )}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold mb-3">Resumen del aviso</p>
              {[
                ["Tipo", `${form.type} · ${form.ambientes} amb. · ${form.m2} m²`],
                ["Ubicación", `${form.address}, ${form.neighborhood}`],
                ["Título", form.title],
                ["Precio", form.price ? formatUSD(Number(form.price)) : "—"],
                ["Fotografía", form.photographerId ? `${PHOTOGRAPHERS.find((f) => f.id === form.photographerId).name} (${formatUSD(PHOTOGRAPHERS.find((f) => f.id === form.photographerId).price)})` : "Fotos propias"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-[#666666]">{k}</span>
                  <span className="font-semibold text-right line-clamp-1">{v}</span>
                </div>
              ))}
              <p className="flex items-center gap-1.5 text-xs text-[#00A650] font-semibold pt-2">
                <CheckCircle2 className="h-4 w-4" /> Publicación gratuita · Comisión 1% solo si vendés
              </p>
            </div>
          </>
        )}
      </div>

      <button
        data-testid="publish-next-btn"
        onClick={() => (step < 4 ? setStep(step + 1) : publish())}
        disabled={!canNext}
        className="w-full bg-[#3483FA] text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold rounded-md px-6 py-3.5 transition-colors mt-5"
      >
        {step < 4 ? "Continuar" : "Publicar propiedad"}
      </button>
    </div>
  );
}
