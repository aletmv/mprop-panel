import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import PropertyDetail from "@/pages/PropertyDetail";
import Publish from "@/pages/Publish";
import Verification from "@/pages/Verification";
import ScheduleVisit from "@/pages/ScheduleVisit";
import MakeOffer from "@/pages/MakeOffer";
import EscrowCheckout from "@/pages/EscrowCheckout";
import NotarySelection from "@/pages/NotarySelection";
import Profile from "@/pages/Profile";
import NotaryLogin from "@/pages/notary/NotaryLogin";
import NotaryDashboard from "@/pages/notary/panel/Dashboard";
import NotaryOperacionesList from "@/pages/notary/panel/OperacionesList";
import NotaryOperacionDetail from "@/pages/notary/panel/OperacionDetail";
import NotaryAgenda from "@/pages/notary/panel/Agenda";
import NotaryPartesList from "@/pages/notary/panel/PartesList";
import NotaryPartesDetail from "@/pages/notary/panel/PartesDetail";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/propiedad/:id" element={<PropertyDetail />} />
            <Route path="/publicar" element={<Publish />} />
            <Route path="/verificacion" element={<Verification />} />
            <Route path="/visita/:id" element={<ScheduleVisit />} />
            <Route path="/oferta/:id" element={<MakeOffer />} />
            <Route path="/reserva/:id" element={<EscrowCheckout />} />
            <Route path="/escribania/:resId" element={<NotarySelection />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/escribanos" element={<NotaryLogin />} />
            <Route path="/escribanos/panel" element={<NotaryDashboard />} />
            <Route path="/escribanos/operaciones" element={<NotaryOperacionesList />} />
            <Route path="/escribanos/operaciones/:id" element={<NotaryOperacionDetail />} />
            <Route path="/escribanos/agenda" element={<NotaryAgenda />} />
            <Route path="/escribanos/partes" element={<NotaryPartesList />} />
            <Route path="/escribanos/partes/:id" element={<NotaryPartesDetail />} />
            <Route path="/escribanos/carpeta/:resId" element={<NotaryDashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AppProvider>
  );
}

export default App;
