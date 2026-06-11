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
};

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedState;
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
