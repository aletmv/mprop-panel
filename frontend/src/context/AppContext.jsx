import { createContext, useContext, useEffect, useState } from "react";
import { PROPERTIES } from "@/data/mock";

const AppContext = createContext(null);

const STORAGE_KEY = "mercadoprop_state_v1";

const seedState = {
  verified: false,
  visits: [
    {
      id: "v-seed-1",
      propertyId: "p5",
      date: "Próximo sábado",
      time: "11:00",
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
};

const DEMO_RESERVATIONS = [
  { id: "res-demo-1", propertyId: "p2", amount: 2480, paymentId: "MP-734120985", date: "05/06/2026", status: "escribania_asignada", notaryId: "n1", buyer: "Valentina Ríos" },
  { id: "res-demo-2", propertyId: "p3", amount: 1000, paymentId: "MP-712098344", date: "29/05/2026", status: "escribania_asignada", notaryId: "n1", buyer: "Marcos Gutiérrez" },
  { id: "res-demo-3", propertyId: "p5", amount: 1560, paymentId: "MP-698455201", date: "21/05/2026", status: "escribania_asignada", notaryId: "n1", buyer: "Camila Funes" },
  { id: "res-demo-4", propertyId: "p6", amount: 3200, paymentId: "MP-687014772", date: "12/05/2026", status: "escribania_asignada", notaryId: "n2", buyer: "Federico Paz" },
];

const DEMO_FOLDER_TASKS = {
  "res-demo-1": { s0t0: true },
  "res-demo-2": { s0t0: true, s0t1: true, s1t0: true, s1t1: true, s2t0: true, s2t1: true },
  "res-demo-3": { s0t0: true, s0t1: true, s1t0: true, s1t1: true, s2t0: true, s2t1: true, s2t2: true, s2t3: true },
  "res-demo-4": { s0t0: true, s0t1: true, s1t0: true, s1t1: true, s2t0: true, s2t1: true, s2t2: true, s2t3: true, s3t0: true, s3t1: true, s4t0: true },
};

const withDemoFolders = (s) => {
  const have = new Set(s.reservations.map((r) => r.id));
  const missing = DEMO_RESERVATIONS.filter((r) => !have.has(r.id));
  if (!missing.length) return s;
  return {
    ...s,
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
    const res = { id: `res-${Date.now()}`, status: "fondos_retenidos", notaryId: null, ...reservation };
    setState((s) => ({ ...s, reservations: [res, ...s.reservations] }));
    return res.id;
  };

  const setReservationNotary = (resId, notaryId) =>
    setState((s) => ({
      ...s,
      reservations: s.reservations.map((r) => (r.id === resId ? { ...r, notaryId, status: "escribania_asignada" } : r)),
    }));

  const addPublished = (property) =>
    setState((s) => ({ ...s, published: [{ ...property, id: `pub-${Date.now()}` }, ...s.published] }));

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
