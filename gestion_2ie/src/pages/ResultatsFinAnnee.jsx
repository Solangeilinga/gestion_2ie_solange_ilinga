// src/pages/ResultatsFinAnnee.jsx
import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Filter, Search, X, FileDown, AlertCircle } from 'lucide-react';
import { exportCustomToExcel } from '../utils/exportExcel';
import { inscriptionsService, anneesService, decisionsService, parcoursService } from '../api/services';

const C = {
  bg:          '#F7F8FA',
  card:        '#FFFFFF',
  border:      '#E4E7ED',
  borderStrong:'#CBD2DB',
  textPrimary: '#1A1F2E',
  textSecondary:'#4B5568',
  textMuted:   '#8896A5',
  accent:      '#4F46E5',
  accentHover: '#4338CA',
  accentLight: '#EEF2FF',
  tableHead:   '#F0F2F7',
  rowAlt:      '#F7F8FA',
};

const BADGE_STYLES = {
  'Admis':                { backgroundColor: '#ECFDF5', color: '#065F46' },
  'Admis sous condition': { backgroundColor: '#FFFBEB', color: '#92400E' },
  'Redoublant':           { backgroundColor: '#FFF7ED', color: '#9A3412' },
  'Refusé':               { backgroundColor: '#FEF2F2', color: '#991B1B' },
  'Inscrit':              { backgroundColor: '#EEF2FF', color: '#3730A3' },
  'Exclu':                { backgroundColor: '#F3F4F6', color: '#374151' },
  'Diplômé':              { backgroundColor: '#F5F3FF', color: '#5B21B6' },
};

export default function ResultatsFinAnnee() {
  const [rows,           setRows]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [saving,         setSaving]         = useState(false);
  const [savedIds,       setSavedIds]       = useState([]);
  const [changes,        setChanges]        = useState({});
  const [search,         setSearch]         = useState('');

  const [annees,         setAnnees]         = useState([]);
  const [decisions,      setDecisions]      = useState([]);
  const [parcoursList,   setParcoursList]   = useState([]);
  const [filtreAnnee,    setFiltreAnnee]    = useState('');
  const [filtreParcours, setFiltreParcours] = useState('');

  useEffect(() => {
    Promise.all([anneesService.getAll(), decisionsService.getAll(), parcoursService.getAll()])
      .then(([a, d, p]) => {
        setAnnees(a.data); setDecisions(d.data); setParcoursList(p.data);
        const active = a.data.find((x) => x.est_active);
        if (active) setFiltreAnnee(String(active.id));
      }).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!filtreAnnee) { setRows([]); return; }
    setLoading(true); setError(''); setChanges({}); setSavedIds([]);
    try {
      const params = { annee_id: filtreAnnee };
      if (filtreParcours) params.parcours_id = filtreParcours;
      const res = await inscriptionsService.filter(params);
      setRows(res.data);
    } catch { setError('Erreur de chargement.'); }
    finally { setLoading(false); }
  }, [filtreAnnee, filtreParcours]);

  useEffect(() => { load(); }, [load]);

  const handleSaveAll = async () => {
    const entries = Object.entries(changes);
    if (!entries.length) return;
    setSaving(true); setError('');
    const saved = [];
    try {
      await Promise.all(entries.map(async ([id, decisions_id]) => {
        const ins = rows.find((i) => String(i.id) === String(id));
        if (!ins) return;
        await inscriptionsService.update(id, {
          etudiants_id:        ins.etudiants_id,
          parcours_id:         ins.parcours_id,
          annee_academique_id: ins.annee_academique_id,
          decisions_id,
          dateInscription:     ins.dateInscription?.split('T')[0],
        });
        saved.push(Number(id));
      }));
      setSavedIds(saved); setChanges({});
      await load();
    } catch { setError("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const nbChanges = Object.keys(changes).length;

  const filtered = rows.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.nom?.toLowerCase().includes(q) ||
      row.prenoms?.toLowerCase().includes(q) ||
      row.parcours_libelle?.toLowerCase().includes(q)
    );
  });

  const selectStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: C.textPrimary,
    border: `1px solid ${C.border}`,
    backgroundColor: C.card,
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
  };

  return (
    <div className="space-y-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
          >
            Résultats de fin d'année
          </h1>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>
            {filtered.length} inscription{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rows.length > 0 && (
            <button
              onClick={() => exportCustomToExcel(
                rows,
                {
                  'Étudiant':         (r) => `${r.civilite ?? ''} ${r.prenoms} ${r.nom}`,
                  'Parcours':         'parcours_libelle',
                  'Niveau':           'niveau_libelle',
                  'Cycle':            'cycle_libelle',
                  'Année':            'annee_libelle',
                  'Décision':         'decision_libelle',
                  'Date inscription': (r) => r.dateInscription ? new Date(r.dateInscription).toLocaleDateString('fr-FR') : '',
                },
                'resultats_fin_annee',
                'Résultats'
              )}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: C.accentLight, border: `1px solid #C7D2FE`, color: C.accent }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.accent; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = C.accent; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.accentLight; e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = '#C7D2FE'; }}
            >
              <FileDown className="w-4 h-4" /> Exporter
            </button>
          )}
          {nbChanges > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={e => !saving && (e.currentTarget.style.backgroundColor = '#047857')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</>
                : <><Save className="w-4 h-4" />Enregistrer {nbChanges} modif{nbChanges > 1 ? 's' : ''}</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Barre outils */}
      <div
        className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-xl border"
        style={{ backgroundColor: C.card, borderColor: C.border }}
      >
        {/* Recherche */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: C.textMuted }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="pl-9 pr-3 py-2 rounded-lg text-sm transition-all focus:outline-none w-48"
            style={{
              border: `1px solid ${C.border}`,
              backgroundColor: C.bg,
              color: C.textPrimary,
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; }}
            onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Filtre année */}
        <select
          value={filtreAnnee}
          onChange={(e) => setFiltreAnnee(e.target.value)}
          style={{ ...selectStyle, backgroundColor: C.bg }}
        >
          <option value="">Choisir une année…</option>
          {annees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.libelle}{a.est_active ? ' ✓ active' : ''}
            </option>
          ))}
        </select>

        {/* Filtre parcours */}
        <select
          value={filtreParcours}
          onChange={(e) => setFiltreParcours(e.target.value)}
          style={{ ...selectStyle, backgroundColor: C.bg }}
        >
          <option value="">Tous les parcours</option>
          {parcoursList.map((p) => (
            <option key={p.id} value={p.id}>{p.libelle}</option>
          ))}
        </select>

        {(filtreParcours || search) && (
          <button
            onClick={() => { setFiltreParcours(''); setSearch(''); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.textSecondary }}
          >
            <X className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        )}

        <span className="text-sm ml-auto" style={{ color: C.textMuted }}>
          {filtered.length} / {rows.length}
        </span>
      </div>

      {/* Erreur */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${C.border}`, backgroundColor: C.card, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {!filtreAnnee ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            style={{ color: C.textMuted }}
          >
            <Filter className="w-10 h-10 opacity-30" />
            <p className="text-sm">Sélectionnez une année académique.</p>
          </div>
        ) : loading ? (
          <div
            className="flex justify-center items-center py-20 text-sm"
            style={{ color: C.textMuted }}
          >
            <Loader2 className="w-5 h-5 animate-spin mr-2" />Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex justify-center items-center py-20 text-sm"
            style={{ color: C.textMuted }}
          >
            Aucune inscription pour cette sélection.
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: C.tableHead, borderBottom: `1px solid ${C.borderStrong}` }}>
                {['#', 'Étudiant', 'Parcours', 'Décision actuelle', 'Nouvelle décision'].map((h, i) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left whitespace-nowrap"
                    style={{
                      color: C.textMuted,
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderRight: i < 4 ? `1px solid ${C.border}` : 'none',
                      width: i === 0 ? '40px' : 'auto',
                      textAlign: i === 0 ? 'center' : 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ins, i) => {
                const changed  = changes[ins.id] !== undefined;
                const wasSaved = savedIds.includes(ins.id);
                const rowBg    = changed ? '#EEF2FF' : i % 2 === 0 ? C.card : C.rowAlt;
                return (
                  <tr
                    key={ins.id}
                    className="transition-colors"
                    style={{ backgroundColor: rowBg, borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => { if (!changed) e.currentTarget.style.backgroundColor = '#F0F4FF'; }}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = rowBg}
                  >
                    <td
                      className="px-3 py-3 text-center select-none"
                      style={{
                        color: C.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '12px',
                        borderRight: `1px solid ${C.border}`,
                        backgroundColor: C.tableHead,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      className="px-4 py-3 font-medium"
                      style={{ color: C.textPrimary, borderRight: `1px solid ${C.border}` }}
                    >
                      {ins.civilite} {ins.prenoms} {ins.nom}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: C.textSecondary, borderRight: `1px solid ${C.border}` }}
                    >
                      <p style={{ color: C.textPrimary }}>{ins.parcours_libelle}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                        {ins.niveau_libelle}{ins.cycle_libelle ? ` · ${ins.cycle_libelle}` : ''}
                      </p>
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ borderRight: `1px solid ${C.border}` }}
                    >
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={BADGE_STYLES[ins.decision_libelle] ?? { backgroundColor: '#F3F4F6', color: '#374151' }}
                      >
                        {ins.decision_libelle}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <select
                          value={changes[ins.id] ?? ins.decisions_id}
                          onChange={(e) => setChanges((prev) => ({ ...prev, [ins.id]: e.target.value }))}
                          style={{
                            ...selectStyle,
                            borderColor: changed ? C.accent : C.border,
                            backgroundColor: changed ? C.accentLight : C.card,
                            fontWeight: changed ? 600 : 400,
                            fontSize: '13px',
                            padding: '6px 10px',
                          }}
                        >
                          {decisions.map((d) => (
                            <option key={d.id} value={d.id}>{d.libelle}</option>
                          ))}
                        </select>
                        {wasSaved && (
                          <span
                            className="text-sm font-bold"
                            style={{ color: '#059669' }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: C.tableHead, borderTop: `1px solid ${C.border}` }}>
                <td
                  colSpan={5}
                  className="px-4 py-2.5 text-sm"
                  style={{ color: C.textSecondary }}
                >
                  Total : <span style={{ fontWeight: 600, color: C.textPrimary }}>{filtered.length}</span> inscription{filtered.length !== 1 ? 's' : ''}
                  {nbChanges > 0 && (
                    <span className="ml-4 font-semibold" style={{ color: C.accent }}>
                      {nbChanges} modification{nbChanges > 1 ? 's' : ''} en attente
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}