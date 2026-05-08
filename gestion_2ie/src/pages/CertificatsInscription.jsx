// src/pages/CertificatsInscription.jsx
import { useState, useEffect, useRef } from 'react';
import { Search, Printer, Loader2, AlertCircle, FileCheck, X, Globe } from 'lucide-react';
import { etudiantsService, anneesService } from '../api/services';

const C = {
  bg:          '#F7F8FA',
  card:        '#FFFFFF',
  border:      '#E4E7ED',
  textPrimary: '#1A1F2E',
  textSecondary:'#4B5568',
  textMuted:   '#8896A5',
  accent:      '#4F46E5',
  accentLight: '#EEF2FF',
  tableHead:   '#F0F2F7',
};

export default function CertificatsInscription() {
  const [searchInput,  setSearchInput]  = useState('');
  const [etudiants,    setEtudiants]    = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [selectedIns,  setSelectedIns]  = useState(null);
  const [anneeActive,  setAnneeActive]  = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    anneesService.getActive().then((res) => setAnneeActive(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchInput.length < 2) { setEtudiants([]); return; }
    const t = setTimeout(() => {
      etudiantsService.search(searchInput)
        .then((res) => setEtudiants(res.data))
        .catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSelect = async (et) => {
    setSelected(et); setSelectedIns(null); setError(''); setLoading(true);
    try {
      const res  = await etudiantsService.getInscriptions(et.id);
      const list = res.data;
      setInscriptions(list);
      if (!list.length) return;
      const activeId = anneeActive?.id;
      const match    = activeId ? list.find((i) => Number(i.annee_academique_id) === Number(activeId)) : null;
      setSelectedIns(match ?? list[0]);
    } catch { setError('Erreur de chargement des inscriptions.'); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Certificat d'inscription</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        body { font-family: 'DM Sans', sans-serif; padding: 60px; color: #1A1F2E; }
        .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-family: 'Sora', sans-serif; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; color: #4F46E5; margin: 0; }
        .header h2 { font-size: 13px; font-weight: 400; margin-top: 6px; color: #4B5568; }
        .body { line-height: 2.2; font-size: 14px; }
        .highlight { font-weight: 600; color: #1A1F2E; }
        .parcours-box { background: #EEF2FF; border-left: 4px solid #4F46E5; padding: 12px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
        .parcours-box p { margin: 0; }
        .parcours-box .title { font-weight: 700; color: #3730A3; font-size: 14px; }
        .parcours-box .sub { color: #4B5568; font-size: 12px; margin-top: 4px; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #E4E7ED; padding-top: 20px; }
        .seal { width: 80px; height: 80px; border: 2px solid #4F46E5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; text-align: center; margin: 0 auto 8px; color: #4F46E5; }
        @media print { body { padding: 20px; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close(); win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
          >
            Certificats d'inscription
          </h1>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>
            Recherchez un étudiant pour générer et imprimer son certificat.
          </p>
        </div>
        {selected && selectedIns && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            style={{ backgroundColor: C.accent }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4338CA'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.accent}
          >
            <Printer className="w-4 h-4" /> Imprimer le certificat
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: C.textMuted }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nom, prénom ou email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all focus:outline-none"
            style={{
              border: `1px solid ${C.border}`,
              backgroundColor: C.card,
              color: C.textPrimary,
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; }}
            onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setEtudiants([]); }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.textSecondary }}
          >
            <X className="w-3.5 h-3.5" /> Effacer
          </button>
        )}
        <span className="text-sm ml-auto" style={{ color: C.textMuted }}>
          {etudiants.length > 0
            ? `${etudiants.length} résultat${etudiants.length > 1 ? 's' : ''}`
            : 'Tapez au moins 2 caractères'}
        </span>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panneau gauche */}
        <div className="space-y-4">
          {etudiants.length > 0 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.tableHead }}
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
                  Résultats de recherche
                </h2>
              </div>
              <div style={{ borderBottom: `1px solid ${C.border}` }}>
                {etudiants.map((et) => (
                  <button
                    key={et.id}
                    onClick={() => handleSelect(et)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      backgroundColor: selected?.id === et.id ? C.accentLight : C.card,
                      borderLeft: selected?.id === et.id ? `3px solid ${C.accent}` : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (selected?.id !== et.id) e.currentTarget.style.backgroundColor = C.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = selected?.id === et.id ? C.accentLight : C.card; }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: C.accentLight, color: C.accent }}
                    >
                      {et.prenoms?.[0]?.toUpperCase()}{et.nom?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: C.textPrimary }}>
                        {et.abreviation} {et.prenoms} {et.nom}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3 h-3" style={{ color: C.textMuted }} />
                        <span className="text-xs truncate" style={{ color: C.textMuted }}>
                          {et.pays_libelle}{et.email && ` · ${et.email}`}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2.5" style={{ backgroundColor: C.tableHead }}>
                <span className="text-xs" style={{ color: C.textMuted }}>
                  {etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''} trouvé{etudiants.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div
              className="rounded-xl flex justify-center py-14"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.accent }} />
            </div>
          )}

          {selected && !loading && inscriptions.length > 0 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.tableHead }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
                  Choisir l'inscription
                </h2>
              </div>
              <div className="p-4">
                <select
                  value={selectedIns?.id ?? ''}
                  onChange={(e) => setSelectedIns(inscriptions.find((i) => String(i.id) === String(e.target.value)) ?? null)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm transition-all focus:outline-none"
                  style={{
                    border: `1px solid ${C.border}`,
                    backgroundColor: C.bg,
                    color: C.textPrimary,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {inscriptions.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.annee_libelle} — {ins.parcours_libelle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Panneau droit — aperçu certificat */}
        <div className="space-y-4">
          {selected && !loading && inscriptions.length === 0 ? (
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.tableHead }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Aperçu</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-16" style={{ color: '#D97706' }}>
                <AlertCircle className="w-12 h-12 mb-3 stroke-1" />
                <p className="text-sm font-medium">Aucune inscription enregistrée</p>
                <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                  Cet étudiant n'a aucune inscription pour le moment.
                </p>
              </div>
            </div>
          ) : selected && selectedIns ? (
            <>
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.tableHead }}
                >
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
                    Aperçu du certificat
                  </h2>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: C.accentLight, color: C.accent }}
                  >
                    {selectedIns.annee_libelle}
                  </span>
                </div>

                <div className="p-6" ref={printRef}>
                  {/* En-tête */}
                  <div className="text-center pb-5 mb-6" style={{ borderBottom: `2px solid ${C.accent}` }}>
                    <h1
                      className="text-base font-bold uppercase tracking-widest"
                      style={{ color: C.accent, fontFamily: "'Sora', sans-serif" }}
                    >
                      Institut 2iE
                    </h1>
                    <h2 className="text-sm mt-1 font-normal" style={{ color: C.textSecondary }}>
                      Certificat d'inscription — Année {selectedIns.annee_libelle}
                    </h2>
                  </div>

                  {/* Corps */}
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                    <p>Nous soussignés, certifions que :</p>
                    <p className="text-base font-bold" style={{ color: C.textPrimary }}>
                      {selected.abreviation} {selected.prenoms?.toUpperCase()} {selected.nom?.toUpperCase()}
                    </p>
                    <p>
                      Né(e) le{' '}
                      <span className="font-semibold" style={{ color: C.textPrimary }}>
                        {selected.dateNaissance
                          ? new Date(selected.dateNaissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '—'}
                      </span>
                      , de nationalité{' '}
                      <span className="font-semibold" style={{ color: C.textPrimary }}>{selected.pays_libelle}</span>
                    </p>
                    <p>
                      est régulièrement inscrit(e) pour l'année académique{' '}
                      <span className="font-semibold" style={{ color: C.textPrimary }}>{selectedIns.annee_libelle}</span> dans le parcours :
                    </p>

                    {/* Encadré parcours */}
                    <div
                      className="px-5 py-4 my-3 rounded-r-xl"
                      style={{ backgroundColor: C.accentLight, borderLeft: `4px solid ${C.accent}` }}
                    >
                      <p className="font-bold text-sm" style={{ color: '#3730A3' }}>{selectedIns.parcours_libelle}</p>
                      <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
                        {selectedIns.specialite_libelle} · {selectedIns.niveau_libelle}
                        {selectedIns.cycle_libelle && ` · ${selectedIns.cycle_libelle}`}
                      </p>
                    </div>

                    <p>Statut : <span className="font-semibold" style={{ color: C.textPrimary }}>{selectedIns.decision_libelle}</span></p>
                    <p>Ce certificat est délivré pour servir et valoir ce que de droit.</p>

                    {/* Pied */}
                    <div
                      className="flex justify-between items-end mt-8 pt-5"
                      style={{ borderTop: `1px solid ${C.border}` }}
                    >
                      <p className="text-xs" style={{ color: C.textMuted }}>Fait le {today}</p>
                      <div className="text-center">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2"
                          style={{ border: `2px solid ${C.accent}` }}
                        >
                          <span className="text-[8px] text-center leading-tight" style={{ color: C.accent }}>Cachet officiel</span>
                        </div>
                        <p className="text-xs font-medium" style={{ color: C.textPrimary }}>Le Directeur</p>
                        <p className="text-xs" style={{ color: C.textMuted }}>Signature</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info bar */}
              <div
                className="px-4 py-2.5 rounded-lg flex items-center justify-between text-sm"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
              >
                <span style={{ color: C.textSecondary }}>
                  Étudiant :{' '}
                  <strong style={{ color: C.textPrimary }}>
                    {selected.abreviation} {selected.prenoms} {selected.nom}
                  </strong>
                </span>
                <span style={{ color: C.textMuted }}>{selectedIns.annee_libelle}</span>
              </div>
            </>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.tableHead }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
                  Aperçu du certificat
                </h2>
              </div>
              <div className="flex flex-col items-center justify-center py-16" style={{ color: C.textMuted }}>
                <FileCheck className="w-12 h-12 mb-3 stroke-1" />
                <p className="text-sm">Sélectionnez un étudiant pour voir l'aperçu.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}