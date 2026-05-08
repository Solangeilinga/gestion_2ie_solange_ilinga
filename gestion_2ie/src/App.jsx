// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';

import Ecoles             from './pages/Ecoles';
import Filieres           from './pages/Filieres';
import Cycles             from './pages/Cycles';
import Specialites        from './pages/Specialites';
import Civilites          from './pages/Civilites';
import Pays               from './pages/Pays';
import Decisions          from './pages/Decisions';
import AnneesAcademiques  from './pages/AnneesAcademiques';
import Parcours           from './pages/Parcours';
import Niveaux            from './pages/Niveaux';
import NouveauxEtudiants      from './pages/NouveauxEtudiants';
import ResultatsFinAnnee      from './pages/ResultatsFinAnnee';
import ListeEtudiants         from './pages/ListeEtudiants';
import CertificatsInscription from './pages/CertificatsInscription';
import GestionInscriptions    from './pages/GestionInscriptions';
import Trombinoscope          from './pages/Trombinoscope';
import Dashboard              from './pages/Dashboard';

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F7F8FA' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/ressources/ecoles"      element={<Ecoles />} />
            <Route path="/ressources/filieres"    element={<Filieres />} />
            <Route path="/ressources/cycles"      element={<Cycles />} />
            <Route path="/ressources/specialites" element={<Specialites />} />
            <Route path="/ressources/civilites"   element={<Civilites />} />
            <Route path="/ressources/pays"        element={<Pays />} />
            <Route path="/ressources/decisions"   element={<Decisions />} />
            <Route path="/ressources/annees"      element={<AnneesAcademiques />} />
            <Route path="/ressources/parcours"    element={<Parcours />} />
            <Route path="/ressources/niveaux"     element={<Niveaux />} />
            <Route path="/gestion/nouveaux-etudiants" element={<NouveauxEtudiants />} />
            <Route path="/gestion/resultats"          element={<ResultatsFinAnnee />} />
            <Route path="/gestion/liste-etudiants"    element={<ListeEtudiants />} />
            <Route path="/gestion/certificats"        element={<CertificatsInscription />} />
            <Route path="/gestion/inscriptions"       element={<GestionInscriptions />} />
            <Route path="/gestion/trombinoscope"      element={<Trombinoscope />} />
            <Route path="/dashboard"                  element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ backgroundColor: '#1A1F2E' }}
    >
      <div
        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#4F46E5', borderTopColor: 'transparent' }}
      />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}