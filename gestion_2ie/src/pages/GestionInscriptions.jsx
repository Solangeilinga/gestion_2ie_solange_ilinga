// src/pages/GestionInscriptions.jsx
import { useState, useEffect } from 'react';
import TablePage from '../components/TablePage';
import { inscriptionsService, etudiantsService, parcoursService, anneesService, decisionsService } from '../api/services';

const BADGE = {
  'Admis':                'bg-green-100 text-green-700',
  'Admis sous condition': 'bg-yellow-100 text-yellow-700',
  'Redoublant':           'bg-orange-100 text-orange-700',
  'Refusé':               'bg-red-100 text-red-700',
  'Inscrit':              'bg-blue-100 text-blue-700',
  'Exclu':                'bg-gray-100 text-gray-500',
  'Diplômé':              'bg-purple-100 text-purple-700',
};

// ─── Formulaire ──────────────────────────────────────────────
function InscriptionForm({ values, onChange, errors }) {
  const [etudiants, setEtudiants] = useState([]);
  const [parcours,  setParcours]  = useState([]);
  const [annees,    setAnnees]    = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [etSearch,      setEtSearch]      = useState('');
  const [allEtudiants,  setAllEtudiants]  = useState([]);

  // Chargement initial — une seule fois
  useEffect(() => {
    Promise.all([
      parcoursService.getAll(),
      anneesService.getAll(),
      decisionsService.getAll(),
      etudiantsService.getAll(),
    ]).then(([p, a, d, e]) => {
      setParcours(p.data);
      setAnnees(a.data);
      setDecisions(d.data);
      setAllEtudiants(e.data);  // liste complète conservée
      setEtudiants(e.data);     // liste affichée
    }).catch(() => {});
  }, []);

  // Filtrage LOCAL — pas de requête serveur à chaque frappe
  useEffect(() => {
    if (!etSearch.trim()) {
      setEtudiants(allEtudiants);
    } else {
      const q = etSearch.toLowerCase();
      setEtudiants(
        allEtudiants.filter((e) =>
          e.nom?.toLowerCase().includes(q) ||
          e.prenoms?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q)
        )
      );
    }
  }, [etSearch, allEtudiants]);

  const cls = (key) =>
    `w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition
    ${errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`;

  const lbl = (text, required = false) => (
    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const err = (key) => errors[key]
    ? <p className="text-red-500 text-[10px] mt-0.5">{errors[key]}</p>
    : null;

  return (
    <div className="space-y-3">

      {/* Étudiant */}
      <div>
        {lbl('Rechercher un étudiant')}
        <input
          type="text"
          value={etSearch}
          onChange={(e) => setEtSearch(e.target.value)}
          placeholder="Tapez un nom pour filtrer…"
          className="w-full px-3 py-2 border border-slate-300 bg-white rounded text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 mb-2"
        />
        {lbl('Étudiant', true)}
        <select
          value={values.etudiants_id ?? ''}
          onChange={(e) => onChange('etudiants_id', e.target.value)}
          className={cls('etudiants_id')}
        >
          <option value="">— Sélectionner un étudiant —</option>
          {etudiants.map((o) => (
            <option key={o.id} value={o.id}>
              {o.abreviation ?? ''} {o.prenoms} {o.nom}
            </option>
          ))}
        </select>
        {err('etudiants_id')}
      </div>

      {/* Parcours */}
      <div>
        {lbl('Parcours', true)}
        <select
          value={values.parcours_id ?? ''}
          onChange={(e) => onChange('parcours_id', e.target.value)}
          className={cls('parcours_id')}
        >
          <option value="">— Sélectionner un parcours —</option>
          {parcours.map((o) => (
            <option key={o.id} value={o.id}>
              {o.libelle} — {o.specialite_libelle ?? ''} {o.niveau_libelle ?? ''}
            </option>
          ))}
        </select>
        {err('parcours_id')}
      </div>

      {/* Année académique */}
      <div>
        {lbl('Année académique', true)}
        <select
          value={values.annee_academique_id ?? ''}
          onChange={(e) => onChange('annee_academique_id', e.target.value)}
          className={cls('annee_academique_id')}
        >
          <option value="">— Sélectionner une année —</option>
          {annees.map((o) => (
            <option key={o.id} value={o.id}>
              {o.libelle}{o.est_active ? ' ✓ active' : ''}
            </option>
          ))}
        </select>
        {err('annee_academique_id')}
      </div>

      {/* Décision */}
      <div>
        {lbl('Décision', true)}
        <select
          value={values.decisions_id ?? ''}
          onChange={(e) => onChange('decisions_id', e.target.value)}
          className={cls('decisions_id')}
        >
          <option value="">— Sélectionner une décision —</option>
          {decisions.map((o) => (
            <option key={o.id} value={o.id}>{o.libelle}</option>
          ))}
        </select>
        {err('decisions_id')}
      </div>

      {/* Date */}
      <div>
        {lbl("Date d'inscription", true)}
        <input
          type="date"
          value={values.dateInscription ?? ''}
          onChange={(e) => onChange('dateInscription', e.target.value)}
          className={cls('dateInscription')}
        />
        {err('dateInscription')}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function GestionInscriptions() {
  const [annees,    setAnnees]    = useState([]);
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    Promise.all([anneesService.getAll(), decisionsService.getAll()])
      .then(([a, d]) => { setAnnees(a.data); setDecisions(d.data); })
      .catch(() => {});
  }, []);

  const columns = [
    {
      key: 'nom', label: 'Étudiant',
      render: (row) => (
        <span className="font-medium text-slate-800">
          {row.civilite} {row.prenoms} {row.nom}
        </span>
      ),
    },
    {
      key: 'parcours_libelle', label: 'Parcours',
      render: (row) => (
        <div>
          <p className="text-slate-700">{row.parcours_libelle}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {row.specialite_libelle} · {row.niveau_libelle}
          </p>
        </div>
      ),
    },
    { key: 'annee_libelle', label: 'Année' },
    {
      key: 'decision_libelle', label: 'Décision',
      render: (row) => (
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${BADGE[row.decision_libelle] ?? 'bg-gray-100 text-gray-600'}`}>
          {row.decision_libelle}
        </span>
      ),
    },
    {
      key: 'dateInscription', label: 'Date',
      render: (row) => row.dateInscription
        ? new Date(row.dateInscription).toLocaleDateString('fr-FR')
        : '—',
    },
  ];

  const filterDefs = [
    {
      key: 'annee_id',
      label: 'Toutes les années',
      options: annees.map((a) => ({ value: a.id, label: a.libelle })),
    },
    {
      key: 'decision_id',
      label: 'Toutes les décisions',
      options: decisions.map((d) => ({ value: d.id, label: d.libelle })),
    },
  ];

  return (
    <TablePage
      title="Gestion des inscriptions"
      columns={columns}
      service={inscriptionsService}
      FormFields={InscriptionForm}
      emptyValues={{
        etudiants_id: '', parcours_id: '',
        annee_academique_id: '', decisions_id: '', dateInscription: '',
      }}
      searchKeys={['nom', 'prenoms', 'parcours_libelle']}
      filters={filterDefs}
      onFilter={(vals) => inscriptionsService.filter({
        annee_id:    vals.annee_id,
        decision_id: vals.decision_id,
      })}
      modalSize="lg"
      exportFilename="inscriptions"
      exportSheetName="Inscriptions"
      emptyMessage="Aucune inscription trouvée."
    />
  );
}