// src/pages/Trombinoscope.jsx
import { useState, useEffect, useRef } from 'react';
import { Search, X, Camera, Loader2, AlertCircle, Users, Mail, Phone, Globe } from 'lucide-react';
import { etudiantsService, paysService } from '../api/services';

const C = {
  bg:          '#F7F8FA',
  card:        '#FFFFFF',
  border:      '#E4E7ED',
  textPrimary: '#1A1F2E',
  textSecondary:'#4B5568',
  textMuted:   '#8896A5',
  accent:      '#4F46E5',
  accentHover: '#4338CA',
  accentLight: '#EEF2FF',
  tableHead:   '#F0F2F7',
};

const AVATAR_COLORS = [
  '#4F46E5','#7C3AED','#DB2777','#E11D48',
  '#EA580C','#D97706','#059669','#0D9488',
  '#0284C7','#2563EB','#0891B2','#65A30D',
];
const getAvatarColor = (nom = '') => AVATAR_COLORS[nom.charCodeAt(0) % AVATAR_COLORS.length];

const BADGE_STYLES = {
  'Admis':                { backgroundColor: '#ECFDF5', color: '#065F46' },
  'Admis sous condition': { backgroundColor: '#FFFBEB', color: '#92400E' },
  'Redoublant':           { backgroundColor: '#FFF7ED', color: '#9A3412' },
  'Refusé':               { backgroundColor: '#FEF2F2', color: '#991B1B' },
  'Inscrit':              { backgroundColor: '#EEF2FF', color: '#3730A3' },
  'Exclu':                { backgroundColor: '#F3F4F6', color: '#374151' },
  'Diplômé':              { backgroundColor: '#F5F3FF', color: '#5B21B6' },
};

function Avatar({ etudiant, size = 'lg' }) {
  const isLg = size === 'lg';
  const dim  = isLg ? 96 : 48;
  const font = isLg ? '28px' : '14px';
  const color = getAvatarColor(etudiant.nom);

  if (etudiant.photo) {
    return (
      <img
        src={etudiant.photo}
        alt={`${etudiant.prenoms} ${etudiant.nom}`}
        style={{
          width: dim, height: dim,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid #FFFFFF',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: dim, height: dim,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: font,
        border: '3px solid #FFFFFF',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0,
      }}
    >
      {etudiant.prenoms?.[0]?.toUpperCase()}{etudiant.nom?.[0]?.toUpperCase()}
    </div>
  );
}

function EtudiantModal({ etudiant, onClose, onPhotoUpdate }) {
  const [inscriptions, setInscriptions] = useState([]);
  const [loadingIns,   setLoadingIns]   = useState(true);
  const [uploading,    setUploading]    = useState(false);
  const [photo,        setPhoto]        = useState(etudiant.photo);
  const inputRef = useRef();

  useEffect(() => {
    etudiantsService.getInscriptions(etudiant.id)
      .then((res) => setInscriptions(res.data))
      .catch(() => {})
      .finally(() => setLoadingIns(false));
  }, [etudiant.id]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La photo ne doit pas dépasser 2 Mo.'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        await etudiantsService.update(etudiant.id, {
          nom: etudiant.nom, prenoms: etudiant.prenoms,
          pays_id: etudiant.pays_id, civilites_id: etudiant.civilites_id,
          dateNaissance: etudiant.dateNaissance?.split('T')[0] ?? null,
          email: etudiant.email, telephone: etudiant.telephone, photo: base64,
        });
        setPhoto(base64); onPhotoUpdate(etudiant.id, base64);
      } catch { alert("Erreur lors de l'upload de la photo."); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      await etudiantsService.update(etudiant.id, {
        nom: etudiant.nom, prenoms: etudiant.prenoms,
        pays_id: etudiant.pays_id, civilites_id: etudiant.civilites_id,
        dateNaissance: etudiant.dateNaissance?.split('T')[0] ?? null,
        email: etudiant.email, telephone: etudiant.telephone, photo: null,
      });
      setPhoto(null); onPhotoUpdate(etudiant.id, null);
    } catch { alert('Erreur lors de la suppression.'); }
    finally { setUploading(false); }
  };

  const avatarColor = getAvatarColor(etudiant.nom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: `1px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Banner coloré */}
        <div
          className="relative h-24 flex items-end justify-end p-3"
          style={{ backgroundColor: avatarColor }}
        >
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar centré sur le banner */}
        <div className="flex justify-center" style={{ marginTop: '-48px' }}>
          <div className="relative">
            <Avatar etudiant={{ ...etudiant, photo }} size="lg" />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: C.accent, boxShadow: '0 2px 8px rgba(79,70,229,0.4)' }}
              title="Changer la photo"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.accentHover}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = C.accent}
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Camera className="w-3.5 h-3.5" />
              }
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {/* Contenu */}
        <div className="px-6 py-5 space-y-5">
          {/* Nom */}
          <div className="text-center">
            <h2
              className="text-lg font-semibold"
              style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
            >
              {etudiant.abreviation} {etudiant.prenoms} {etudiant.nom}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>{etudiant.pays_libelle}</p>
            {photo && (
              <button
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="mt-1 text-xs transition-colors disabled:opacity-60"
                style={{ color: '#DC2626' }}
                onMouseEnter={e => e.currentTarget.style.color = '#B91C1C'}
                onMouseLeave={e => e.currentTarget.style.color = '#DC2626'}
              >
                Supprimer la photo
              </button>
            )}
          </div>

          {/* Coordonnées */}
          {(etudiant.email || etudiant.telephone || etudiant.dateNaissance) && (
            <div className="grid grid-cols-1 gap-2">
              {etudiant.email && (
                <div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: C.textMuted }} />
                  <span className="text-sm truncate" style={{ color: C.textSecondary }}>{etudiant.email}</span>
                </div>
              )}
              {etudiant.telephone && (
                <div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <Phone className="w-4 h-4 shrink-0" style={{ color: C.textMuted }} />
                  <span className="text-sm" style={{ color: C.textSecondary }}>{etudiant.telephone}</span>
                </div>
              )}
              {etudiant.dateNaissance && (
                <div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <Globe className="w-4 h-4 shrink-0" style={{ color: C.textMuted }} />
                  <span className="text-sm" style={{ color: C.textSecondary }}>
                    Né(e) le {new Date(etudiant.dateNaissance).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Parcours académique */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: C.textMuted }}
            >
              Parcours académique
            </p>
            {loadingIns ? (
              <div className="flex justify-center py-5" style={{ color: C.textMuted }}>
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : inscriptions.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: C.textMuted }}>Aucune inscription.</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {inscriptions.map((ins) => (
                  <div
                    key={ins.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>{ins.annee_libelle}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                        {ins.parcours_libelle} · {ins.niveau_libelle}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ml-2"
                      style={BADGE_STYLES[ins.decision_libelle] ?? { backgroundColor: '#F3F4F6', color: '#374151' }}
                    >
                      {ins.decision_libelle}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EtudiantCard({ etudiant, onClick }) {
  const avatarColor = getAvatarColor(etudiant.nom);
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center gap-3 p-4 rounded-xl text-center transition-all duration-150"
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#C7D2FE';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = C.border;
      }}
    >
      <Avatar etudiant={etudiant} size="lg" />
      <div className="min-w-0 w-full">
        <p className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>
          {etudiant.prenoms} {etudiant.nom}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: C.textMuted }}>
          {etudiant.civilite_libelle}
        </p>
        <div
          className="flex items-center justify-center gap-1.5 mt-2"
          style={{ color: C.textMuted }}
        >
          <Globe className="w-3 h-3 shrink-0" />
          <span className="text-xs truncate">{etudiant.pays_libelle}</span>
        </div>
      </div>
    </button>
  );
}

export default function Trombinoscope() {
  const [etudiants,   setEtudiants]   = useState([]);
  const [pays,        setPays]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtrePays,  setFiltrePays]  = useState('');
  const [selected,    setSelected]    = useState(null);

  const load = async (q = '') => {
    setLoading(true); setError('');
    try {
      const res = q
        ? await etudiantsService.search(q)
        : await etudiantsService.getAll();
      setEtudiants(res.data);
    } catch { setError('Erreur de chargement.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    paysService.getAll().then((res) => setPays(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { load(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = etudiants.filter((e) =>
    !filtrePays || String(e.pays_id) === filtrePays
  );

  const handlePhotoUpdate = (id, photo) =>
    setEtudiants((prev) => prev.map((e) => e.id === id ? { ...e, photo } : e));

  const selectStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: C.textPrimary,
    border: `1px solid ${C.border}`,
    backgroundColor: C.card,
    borderRadius: '8px',
    padding: '8px 14px',
    outline: 'none',
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
          >
            Trombinoscope
          </h1>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>
            {filtered.length} étudiant{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: C.textMuted }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nom, prénom, email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
            style={{
              border: `1px solid ${C.border}`,
              backgroundColor: C.card,
              color: C.textPrimary,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; }}
            onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
          />
        </div>
        <select
          value={filtrePays}
          onChange={(e) => setFiltrePays(e.target.value)}
          style={{ ...selectStyle, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <option value="">Tous les pays</option>
          {pays.map((p) => (
            <option key={p.id} value={p.id}>{p.libelle}</option>
          ))}
        </select>
        {(searchInput || filtrePays) && (
          <button
            onClick={() => { setSearchInput(''); setFiltrePays(''); load(); }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{ border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.textSecondary }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.card}
          >
            <X className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Grille */}
      {loading ? (
        <div
          className="flex justify-center items-center py-24 text-sm"
          style={{ color: C.textMuted }}
        >
          <Loader2 className="w-6 h-6 animate-spin mr-2" />Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 gap-3"
          style={{ color: C.textMuted }}
        >
          <Users className="w-12 h-12 opacity-25" />
          <p className="text-sm">Aucun étudiant trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((et) => (
            <EtudiantCard key={et.id} etudiant={et} onClick={() => setSelected(et)} />
          ))}
        </div>
      )}

      {selected && (
        <EtudiantModal
          etudiant={selected}
          onClose={() => setSelected(null)}
          onPhotoUpdate={handlePhotoUpdate}
        />
      )}
    </div>
  );
}