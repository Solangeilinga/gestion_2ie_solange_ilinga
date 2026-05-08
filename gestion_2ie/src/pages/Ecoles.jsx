// src/pages/Ecoles.jsx
import { useState } from 'react';
import { BookOpen, Plus, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import TablePage from '../components/TablePage';
import { FieldInput } from '../components/FormField';
import { ecolesService, filieresService, ecolesFiliereService } from '../api/services';

const C = {
  bg:          '#F7F8FA',
  card:        '#FFFFFF',
  border:      '#E4E7ED',
  textPrimary: '#1A1F2E',
  textSecondary:'#4B5568',
  textMuted:   '#8896A5',
  accent:      '#4F46E5',
  accentLight: '#EEF2FF',
};

function FilieresModal({ ecole, onClose }) {
  const [filieres,    setFilieres]    = useState([]);
  const [allFilieres, setAllFilieres] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [adding,      setAdding]      = useState(false);
  const [selectedFil, setSelectedFil] = useState('');
  const [statut,      setStatut]      = useState('actif');
  const [error,       setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [liees, toutes] = await Promise.all([
        ecolesService.getFilieres(ecole.id),
        filieresService.getAll(),
      ]);
      setFilieres(liees.data);
      setAllFilieres(toutes.data);
    } catch { setError('Erreur de chargement.'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { load(); }, []);

  const lieesIds    = filieres.map((f) => f.id);
  const disponibles = allFilieres.filter((f) => !lieesIds.includes(f.id));

  const handleAdd = async () => {
    if (!selectedFil) return;
    setAdding(true); setError('');
    try {
      await ecolesFiliereService.create({
        ecoles_id: ecole.id,
        filieres_id: parseInt(selectedFil),
        statut,
      });
      setSelectedFil(''); setStatut('actif'); await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    } finally { setAdding(false); }
  };

  const selectStyle = {
    border: `1px solid ${C.border}`,
    backgroundColor: C.card,
    color: C.textPrimary,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="bg-white w-full max-w-lg rounded-2xl flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: `1px solid ${C.border}` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-t-2xl"
          style={{ backgroundColor: '#0D9488' }}
        >
          <div>
            <h2
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Filières liées
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{ecole.libelle}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {disponibles.length > 0 && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Ajouter une filière</p>
              <div className="flex gap-2">
                <select
                  value={selectedFil}
                  onChange={(e) => setSelectedFil(e.target.value)}
                  className="flex-1"
                  style={selectStyle}
                >
                  <option value="">Choisir…</option>
                  {disponibles.map((f) => (
                    <option key={f.id} value={f.id}>{f.libelle}</option>
                  ))}
                </select>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  style={selectStyle}
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
                <button
                  onClick={handleAdd}
                  disabled={!selectedFil || adding}
                  className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#059669' }}
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Ajouter
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8" style={{ color: C.textMuted }}>
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : filieres.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>Aucune filière liée.</p>
          ) : (
            <table className="w-full text-sm border-collapse rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              <thead>
                <tr style={{ backgroundColor: '#F0F2F7', borderBottom: `1px solid ${C.border}` }}>
                  <th className="px-4 py-3 text-left" style={{ color: C.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Filière</th>
                  <th className="px-4 py-3 text-left" style={{ color: C.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Statut</th>
                  <th className="px-3 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filieres.map((f, i) => (
                  <tr
                    key={f.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? C.card : C.bg,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <td className="px-4 py-3" style={{ color: C.textPrimary }}>{f.libelle}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={
                          f.statut === 'actif'
                            ? { backgroundColor: '#ECFDF5', color: '#065F46' }
                            : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                        }
                      >
                        {f.statut}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => ecolesFiliereService.remove(ecole.id, f.id).then(load)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FECACA'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

function EcoleForm({ values, onChange, errors }) {
  return (
    <>
      <FieldInput label="Libellé"   value={values.libelle}   onChange={(v) => onChange('libelle', v)}   error={errors.libelle}   placeholder="Ex : École Polytechnique" required />
      <FieldInput label="Adresse"   value={values.adresse}   onChange={(v) => onChange('adresse', v)}   error={errors.adresse}   placeholder="Ouagadougou…" />
      <FieldInput label="Téléphone" value={values.telephone} onChange={(v) => onChange('telephone', v)} error={errors.telephone} placeholder="+226 25 49 28 00" />
      <FieldInput label="Email"     value={values.email}     onChange={(v) => onChange('email', v)}     error={errors.email}     placeholder="contact@ecole.bf" type="email" />
    </>
  );
}

export default function Ecoles() {
  const [filModal, setFilModal] = useState(null);
  return (
    <>
      <TablePage
        title="Écoles"
        columns={[
          { key: 'libelle',   label: 'École'     },
          { key: 'adresse',   label: 'Adresse'   },
          { key: 'telephone', label: 'Téléphone' },
          { key: 'email',     label: 'Email'     },
        ]}
        service={ecolesService}
        FormFields={EcoleForm}
        emptyValues={{ libelle: '', adresse: '', telephone: '', email: '' }}
        searchKeys={['libelle', 'email']}
        rowActions={[{
          label: 'Filières',
          icon: BookOpen,
          className: 'bg-teal-500 hover:bg-teal-600',
          onClick: (row) => setFilModal(row),
        }]}
        exportFilename="ecoles"
        exportSheetName="Écoles"
      />
      {filModal && <FilieresModal ecole={filModal} onClose={() => setFilModal(null)} />}
    </>
  );
}