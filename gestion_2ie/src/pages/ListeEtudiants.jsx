// src/pages/ListeEtudiants.jsx
import { useState, useEffect } from 'react';
import { Eye, X, Loader2 } from 'lucide-react';
import TablePage from '../components/TablePage';
import PhotoUpload from '../components/PhotoUpload';
import { FieldInput, FieldSelect } from '../components/FormField';
import { etudiantsService, paysService, civilitesService } from '../api/services';

const C = {
  bg:          '#F7F8FA',
  card:        '#FFFFFF',
  border:      '#E4E7ED',
  textPrimary: '#1A1F2E',
  textSecondary:'#4B5568',
  textMuted:   '#8896A5',
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

function InscriptionsModal({ etudiant, onClose }) {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    etudiantsService.getInscriptions(etudiant.id)
      .then((res) => setInscriptions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [etudiant.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: `1px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-t-2xl"
          style={{ backgroundColor: '#4F46E5' }}
        >
          <div>
            <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
              Historique des inscriptions
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {etudiant.abreviation} {etudiant.prenoms} {etudiant.nom}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10" style={{ color: C.textMuted }}>
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : inscriptions.length === 0 ? (
            <p className="text-center text-sm py-10" style={{ color: C.textMuted }}>Aucune inscription.</p>
          ) : (
            <table
              className="w-full text-sm border-collapse rounded-xl overflow-hidden"
              style={{ border: `1px solid ${C.border}` }}
            >
              <thead>
                <tr style={{ backgroundColor: '#F0F2F7', borderBottom: `1px solid ${C.border}` }}>
                  {['Année','Parcours','Niveau','Décision','Date'].map((h, i) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left"
                      style={{
                        color: C.textMuted,
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        borderRight: i < 4 ? `1px solid ${C.border}` : 'none',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((ins, i) => (
                  <tr
                    key={ins.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? C.card : C.bg,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: C.textPrimary, borderRight: `1px solid ${C.border}` }}>{ins.annee_libelle}</td>
                    <td className="px-4 py-3" style={{ color: C.textSecondary, borderRight: `1px solid ${C.border}` }}>{ins.parcours_libelle}</td>
                    <td className="px-4 py-3" style={{ color: C.textSecondary, borderRight: `1px solid ${C.border}` }}>{ins.niveau_libelle}</td>
                    <td className="px-4 py-3" style={{ borderRight: `1px solid ${C.border}` }}>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={BADGE_STYLES[ins.decision_libelle] ?? { backgroundColor: '#F3F4F6', color: '#374151' }}
                      >
                        {ins.decision_libelle}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: C.textSecondary }}>
                      {ins.dateInscription ? new Date(ins.dateInscription).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end px-5 py-4 rounded-b-2xl"
          style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.bg }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.textSecondary }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function EtudiantForm({ values, onChange, errors }) {
  const [pays,      setPays]      = useState([]);
  const [civilites, setCivilites] = useState([]);

  useEffect(() => {
    Promise.all([paysService.getAll(), civilitesService.getAll()])
      .then(([p, c]) => { setPays(p.data); setCivilites(c.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect
          label="Civilité"
          value={values.civilites_id}
          onChange={(v) => onChange('civilites_id', v)}
          error={errors.civilites_id}
          options={civilites}
          required
        />
        <FieldSelect
          label="Pays"
          value={values.pays_id}
          onChange={(v) => onChange('pays_id', v)}
          error={errors.pays_id}
          options={pays}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput
          label="Nom"
          value={values.nom}
          onChange={(v) => onChange('nom', v)}
          error={errors.nom}
          placeholder="OUEDRAOGO"
          required
        />
        <FieldInput
          label="Prénoms"
          value={values.prenoms}
          onChange={(v) => onChange('prenoms', v)}
          error={errors.prenoms}
          placeholder="Aminata"
          required
        />
      </div>
      <FieldInput
        label="Date de naissance"
        type="date"
        value={values.dateNaissance}
        onChange={(v) => onChange('dateNaissance', v)}
        error={errors.dateNaissance}
      />
      <FieldInput
        label="Email"
        type="email"
        value={values.email}
        onChange={(v) => onChange('email', v)}
        error={errors.email}
        placeholder="ex@email.com"
      />
      <FieldInput
        label="Téléphone"
        value={values.telephone}
        onChange={(v) => onChange('telephone', v)}
        error={errors.telephone}
        placeholder="+226 70 00 00 00"
      />
      <PhotoUpload
        value={values.photo}
        onChange={(v) => onChange('photo', v)}
        nom={values.nom}
        prenoms={values.prenoms}
      />
    </div>
  );
}

export default function ListeEtudiants() {
  const [insModal, setInsModal] = useState(null);

  const columns = [
    {
      key: 'nom', label: 'Étudiant',
      render: (row) => (
        <span className="font-medium" style={{ color: '#1A1F2E' }}>
          {row.abreviation} {row.prenoms} {row.nom}
        </span>
      ),
    },
    { key: 'pays_libelle', label: 'Pays' },
    { key: 'email',        label: 'Email' },
    { key: 'telephone',    label: 'Téléphone' },
    {
      key: 'dateNaissance', label: 'Naissance',
      render: (row) => row.dateNaissance
        ? new Date(row.dateNaissance).toLocaleDateString('fr-FR')
        : '—',
    },
  ];

  return (
    <>
      <TablePage
        title="Étudiants"
        columns={columns}
        service={etudiantsService}
        FormFields={EtudiantForm}
        emptyValues={{
          nom: '', prenoms: '', pays_id: '', civilites_id: '',
          dateNaissance: '', email: '', telephone: '', photo: null,
        }}
        onSearch={(q) => etudiantsService.search(q)}
        modalSize="lg"
        rowActions={[{
          label: 'Inscriptions',
          icon: Eye,
          className: 'bg-violet-500 hover:bg-violet-600',
          onClick: (row) => setInsModal(row),
        }]}
        exportFilename="etudiants"
        exportSheetName="Liste des étudiants"
      />
      {insModal && (
        <InscriptionsModal
          etudiant={insModal}
          onClose={() => setInsModal(null)}
        />
      )}
    </>
  );
}