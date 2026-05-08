// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  School, BookOpen, Repeat, GraduationCap, Globe,
  FileText, Calendar, TrendingUp, UserPlus, BarChart,
  Users, FileCheck, ClipboardList, LogOut, Menu, X,
  ChevronDown, Layers, GraduationCap as Cap, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RESOURCES = [
  { name: 'Écoles',             path: '/ressources/ecoles',      icon: School },
  { name: 'Filières',           path: '/ressources/filieres',    icon: BookOpen },
  { name: 'Cycles',             path: '/ressources/cycles',      icon: Repeat },
  { name: 'Niveaux',            path: '/ressources/niveaux',     icon: Layers },
  { name: 'Spécialités',        path: '/ressources/specialites', icon: GraduationCap },
  { name: 'Parcours',           path: '/ressources/parcours',    icon: TrendingUp },
  { name: 'Civilités',          path: '/ressources/civilites',   icon: Globe },
  { name: 'Pays',               path: '/ressources/pays',        icon: Globe },
  { name: 'Décisions',          path: '/ressources/decisions',   icon: FileText },
  { name: 'Années académiques', path: '/ressources/annees',      icon: Calendar },
];

const GESTION = [
  { name: 'Dashboard',                path: '/dashboard',                  icon: LayoutDashboard },
  { name: 'Nouveaux étudiants',        path: '/gestion/nouveaux-etudiants', icon: UserPlus },
  { name: "Résultats fin d'année",     path: '/gestion/resultats',          icon: BarChart },
  { name: 'Liste des étudiants',       path: '/gestion/liste-etudiants',    icon: Users },
  { name: 'Trombinoscope',             path: '/gestion/trombinoscope',      icon: Users },
  { name: "Certificats d'inscription", path: '/gestion/certificats',        icon: FileCheck },
  { name: 'Gestion des inscriptions',  path: '/gestion/inscriptions',       icon: ClipboardList },
];

function NavSection({ title, items, defaultOpen = true, onLinkClick }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors"
        style={{ color: '#5A6480' }}
      >
        {title}
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <ul className="mt-1 space-y-0.5">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-[#818CF8]'
                      : 'hover:text-white'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(79,70,229,0.18)' : 'transparent',
                  color: isActive ? '#818CF8' : '#A0AABF',
                })}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const sidebarContent = (
    <aside
      className="w-60 flex flex-col h-full"
      style={{
        backgroundColor: '#1A1F2E',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#4F46E5' }}
          >
            <Cap className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-white text-base font-semibold leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>
              2iE
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#5A6480' }}>
              Gestion École
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5 scrollbar-thin">
        <NavSection title="Gestion" items={GESTION} onLinkClick={() => setMobileOpen(false)} />
        <NavSection title="Référentiels" items={RESOURCES} onLinkClick={() => setMobileOpen(false)} defaultOpen={false} />
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {user && (
          <div className="mb-3 px-1 flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: '#4F46E5' }}
            >
              {(user.nom || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.nom || user.email}</p>
              <p className="text-[11px] truncate" style={{ color: '#5A6480' }}>{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: '#A0AABF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#A0AABF'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg text-white md:hidden"
        style={{ backgroundColor: '#1A1F2E' }}
      >
        <Menu className="w-4 h-4" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="hidden md:flex md:shrink-0">
        {sidebarContent}
      </div>

      <div
        className={`fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          {sidebarContent}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 right-3"
            style={{ color: '#A0AABF' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}