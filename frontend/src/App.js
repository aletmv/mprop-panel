import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Shell } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import OperacionesList from "@/pages/OperacionesList";
import OperacionDetail from "@/pages/OperacionDetail";
import Agenda from "@/pages/Agenda";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/operaciones" element={<OperacionesList />} />
            <Route path="/operaciones/:id" element={<OperacionDetail />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
