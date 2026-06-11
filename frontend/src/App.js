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
import NotaryPanel from "@/pages/notary/NotaryPanel";
import NotaryFolder from "@/pages/notary/NotaryFolder";

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
            <Route path="/escribanos/panel" element={<NotaryPanel />} />
            <Route path="/escribanos/carpeta/:resId" element={<NotaryFolder />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AppProvider>
  );
}

export default App;
