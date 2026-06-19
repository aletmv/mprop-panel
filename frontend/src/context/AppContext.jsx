import { createContext, useContext, useEffect, useState } from "react";
import { PROPERTIES } from "@/data/mock";
import {
  vaultIdFromOpId,
  DEFAULT_VAULT_LABEL,
  buildInitialVaultFromReservation,
} from "@/pages/notary/panel/vault";

const AppContext = createContext(null);

const STORAGE_KEY = "mercadoprop_state_v1";

const nextSaturdayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + (((6 - d.getDay() + 7) % 7) || 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const seedState = {
  verified: false,
  visits: [
    {
      id: "v-seed-1",
      propertyId: "p5",
      date: "Próximo sábado",
      time: "11:00",
      iso: nextSaturdayISO(),
      status: "confirmada",
    },
  ],
  offers: [
    {
      id: "o-seed-1",
      propertyId: "p4",
      amount: 130000,
      status: "contraoferta",
      counterAmount: 138000,
      message: "Oferta en efectivo, escritura inmediata.",
      date: "Hace 2 días",
      history: [
        { by: "comprador", amount: 130000 },
        { by: "vendedor", amount: 138000 },
      ],
    },
  ],
  reservations: [],
  published: [],
  notarySession: null,
  folderTasks: {},
  folderDocs: {},
};

const DEMO_RESERVATIONS_BASE = [
  { id: "res-demo-1", propertyId: "p2", amount: 2480, paymentId: "MP-734120985", date: "05/06/2026", status: "escribania_asignada", notaryId: "n1", buyer: "Valentina Ríos" },
  { id: "res-demo-2", propertyId: "p3", amount: 1000, paymentId: "MP-712098344", date: "29/05/2026", status: "escribania_asignada", notaryId: "n1", buyer: "Marcos Gutiérrez" },
  { id: "res-demo-3", propertyId: "p5", amount: 1560, paymentId: "MP-698455201", date: "21/05/2026", status: "escribania_asignada", notaryId: "n1", buyer: "Camila Funes" },
  { id: "res-demo-4", propertyId: "p6", amount: 3200, paymentId: "MP-687014772", date: "12/05/2026", status: "escribania_asignada", notaryId: "n2", buyer: "Federico Paz" },
];

// Cada reserva del seed lleva su Bóveda inicializada (eventos económicos
// generados automáticamente por MercadoPago/MercadoProp). Ver vault.js.
const DEMO_RESERVATIONS = DEMO_RESERVATIONS_BASE.map((r) => ({
  ...r,
  ...buildInitialVaultFromReservation(r),
}));

const DEMO_FOLDER_TASKS = {
  "res-demo-1": { s0t0: true },
  "res-demo-2": { s0t0: true, s0t1: true, s1t0: true, s1t1: true, s2t0: true, s2t1: true },
  "res-demo-3": { s0t0: true, s0t1: true, s1t0: true, s1t1: true, s2t0: true, s2t1: true, s2t2: true, s2t3: true },
  "res-demo-4": { s0t0: true, s0t1: true, s1t0: true, s1t1: true, s2t0: true, s2t1: true, s2t2: true, s2t3: true, s3t0: true, s3t1: true, s4t0: true },
};

const dDoc = (name, size, date) => ({ name, size, date });
const DEMO_FOLDER_DOCS = {
  "res-demo-1": { s0d0: dDoc("dni-partes-rios-alvarez.pdf", "1,4 MB", "05/06/2026") },
  "res-demo-2": {
    s0d0: dDoc("dni-partes-gutierrez-martinez.pdf", "1,1 MB", "29/05/2026"),
    s0d1: dDoc("cert-inhibiciones-712098344.pdf", "320 KB", "30/05/2026"),
    s1d0: dDoc("acta-conteo-senia.pdf", "540 KB", "02/06/2026"),
    s1d1: dDoc("ddjj-uif-firmada.pdf", "780 KB", "02/06/2026"),
  },
  "res-demo-3": {
    s0d0: dDoc("dni-partes-funes-martinez.pdf", "1,3 MB", "21/05/2026"),
    s0d1: dDoc("cert-inhibiciones-698455201.pdf", "310 KB", "22/05/2026"),
    s1d0: dDoc("transferencia-fiscalizada-mp.pdf", "260 KB", "26/05/2026"),
    s1d1: dDoc("ddjj-uif-firmada.pdf", "790 KB", "26/05/2026"),
    s2d0: dDoc("constancia-sellos-agip.pdf", "410 KB", "30/05/2026"),
    s2d1: dDoc("constancia-ganancias-arca.pdf", "390 KB", "30/05/2026"),
    s2d2: dDoc("libre-deuda-abl-expensas.pdf", "350 KB", "31/05/2026"),
  },
  "res-demo-4": {
    s0d0: dDoc("dni-partes-paz-alvarez.pdf", "1,5 MB", "12/05/2026"),
    s0d1: dDoc("cert-inhibiciones-687014772.pdf", "300 KB", "13/05/2026"),
    s1d0: dDoc("acta-conteo-completo.pdf", "620 KB", "17/05/2026"),
    s1d1: dDoc("ddjj-uif-firmada.pdf", "800 KB", "17/05/2026"),
    s2d0: dDoc("constancia-sellos-agip.pdf", "420 KB", "21/05/2026"),
    s2d1: dDoc("constancia-ganancias-arca.pdf", "400 KB", "21/05/2026"),
    s2d2: dDoc("libre-deuda-abl-expensas.pdf", "340 KB", "22/05/2026"),
    s3d0: dDoc("cert-dominio-vigente.pdf", "280 KB", "28/05/2026"),
    s3d1: dDoc("escritura-matriz-folio-412.pdf", "2,1 MB", "03/06/2026"),
    s4d0: dDoc("primer-testimonio.pdf", "1,9 MB", "06/06/2026"),
  },
};

const withDemoFolders = (s) => {
  const have = new Set(s.reservations.map((r) => r.id));
  const missing = DEMO_RESERVATIONS.filter((r) => !have.has(r.id));
  const merged = {
    ...s,
    folderDocs: { ...DEMO_FOLDER_DOCS, ...(s.folderDocs || {}) },
  };
  if (!missing.length) return merged;
  return {
    ...merged,
    reservations: [...s.reservations, ...missing],
    folderTasks: { ...DEMO_FOLDER_TASKS, ...s.folderTasks },
  };
};

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return withDemoFolders(raw ? { ...seedState, ...JSON.parse(raw) } : seedState);
  } catch {
    return seedState;
  }
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setVerified = () => setState((s) => ({ ...s, verified: true }));

  const addVisit = (visit) =>
    setState((s) => ({ ...s, visits: [{ id: `v-${Date.now()}`, status: "confirmada", ...visit }, ...s.visits] }));

  const addOffer = (offer) =>
    setState((s) => ({ ...s, offers: [{ id: `o-${Date.now()}`, status: "pendiente", date: "Hoy", ...offer }, ...s.offers] }));

  const updateOffer = (id, patch) =>
    setState((s) => ({ ...s, offers: s.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));

  const addReservation = (reservation) => {
    const base = {
      id: `res-${Date.now()}`,
      status: "pago_registrado",
      notaryId: null,
      ...reservation,
    };
    // Sembramos la Bóveda apenas se registra la reserva. Cada reserva nace con
    // los eventos económicos automáticos (vault_created + reservation_accredited).
    const res = { ...base, ...buildInitialVaultFromReservation(base) };
    setState((s) => ({ ...s, reservations: [res, ...s.reservations] }));
    return res.id;
  };

  const setReservationNotary = (resId, notaryId) =>
    setState((s) => ({
      ...s,
      reservations: s.reservations.map((r) => {
        if (r.id !== resId) return r;
        const hasNotaryEvent = (r.economicEvents || []).some((e) => e.type === "notary_assigned");
        const paymentId = r.paymentId;
        const vaultId = r.vaultId || vaultIdFromOpId(paymentId);
        const notaryEvent = hasNotaryEvent
          ? null
          : {
              id: `${paymentId}-ev-notary`,
              type: "notary_assigned",
              label: "Escribanía asignada a la operación",
              source: "mercadopago",
              status: "confirmado",
              amount: null,
              currency: "USD",
              paymentId,
              vaultId,
              occurredAt: new Date().toISOString(),
            };
        return {
          ...r,
          notaryId,
          status: "escribania_asignada",
          vaultId,
          vaultLabel: r.vaultLabel || DEFAULT_VAULT_LABEL,
          economicStatus: r.economicStatus || "reserva_acreditada",
          economicEvents: notaryEvent ? [...(r.economicEvents || []), notaryEvent] : r.economicEvents,
        };
      }),
    }));

  const addPublished = (property) =>
    setState((s) => ({ ...s, published: [{ ...property, id: `pub-${Date.now()}`, paused: false }, ...s.published] }));

  const removePublished = (id) =>
    setState((s) => ({ ...s, published: s.published.filter((p) => p.id !== id) }));

  const togglePublishedPause = (id) =>
    setState((s) => ({
      ...s,
      published: s.published.map((p) => (p.id === id ? { ...p, paused: !p.paused } : p)),
    }));

  const notaryLogin = (notaryId) => setState((s) => ({ ...s, notarySession: notaryId }));
  const notaryLogout = () => setState((s) => ({ ...s, notarySession: null }));

  const toggleFolderTask = (resId, tId) =>
    setState((s) => ({
      ...s,
      folderTasks: {
        ...s.folderTasks,
        [resId]: { ...(s.folderTasks[resId] || {}), [tId]: !(s.folderTasks[resId] || {})[tId] },
      },
    }));

  const addFolderDoc = (resId, dId, meta) =>
    setState((s) => ({
      ...s,
      folderDocs: { ...s.folderDocs, [resId]: { ...(s.folderDocs[resId] || {}), [dId]: meta } },
    }));

  const removeFolderDoc = (resId, dId) =>
    setState((s) => {
      const docs = { ...(s.folderDocs[resId] || {}) };
      delete docs[dId];
      return { ...s, folderDocs: { ...s.folderDocs, [resId]: docs } };
    });

  const allProperties = [...state.published, ...PROPERTIES];
  const getProperty = (id) => allProperties.find((p) => p.id === id);

  return (
    <AppContext.Provider
      value={{
        ...state,
        allProperties,
        getProperty,
        setVerified,
        addVisit,
        addOffer,
        updateOffer,
        addReservation,
        setReservationNotary,
        addPublished,
        notaryLogin,
        notaryLogout,
        toggleFolderTask,
        addFolderDoc,
        removeFolderDoc,
        removePublished,
        togglePublishedPause,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
