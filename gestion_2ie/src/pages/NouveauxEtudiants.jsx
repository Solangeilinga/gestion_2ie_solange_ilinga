// src/pages/NouveauxEtudiants.jsx
import { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle, UserPlus, RotateCcw } from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';
import {
  etudiantsService, paysService, civilitesService,
  parcoursService, anneesService, decisionsService, inscriptionsService,
} from '../api/services';

const C = {
  bg:           '#F7F8FA',
  card:         '#FFFFFF',
  border:       '#E4E7ED',
  borderStrong: '#CBD2DB',
  textPrimary:  '#1A1F2E',
  textSecondary:'#4B5568',
  textMuted:    '#8896A5',
  accent:       '#4F46E5',
  accentHover:  '#4338CA',
  accentLight:  '#EEF2FF',
  tableHead:    '#F0F2F7',
};

const emptyForm = {
  civilites_id: '', pays_id: '', nom: '', prenoms: '',
  dateNaissance: '', email: '', telephone: '', photo: null,
  parcours_id: '', annee_academique_id: '', decisions_id: '', dateInscription: '',
};

const inputBase = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: C.textPrimary,
  borderRadius: '8px',
  padding: '10px 14px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export default function NouveauxEtudiants() {
  const [form,      setForm]      = useState(emptyForm);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');
  const [success,   setSuccess]   = useState(false);

  const [civilites, setCivilites] = useState([]);
  const [pays,      setPays]      = useState([]);
  const [parcours,  setParcours]  = useState([]);
  const [annees,    setAnnees]    = useState([]);
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    Promise.all([
      civilitesService.getAll(), paysService.getAll(),
      parcoursService.getAll(), anneesService.getAll(), decisionsService.getAll(),
    ]).then(([c, p, par, a, d]) => {
      setCivilites(c.data); setPays(p.data);
      setParcours(par.data); setAnnees(a.data); setDecisions(d.data);
      const active = a.data.find((x) => x.est_active);
      if (active) setForm((f) => ({ ...f, annee_academique_id: active.id }));
    }).catch(() => {});
  }, []);

  const onChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
    setSuccess(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.civilites_id)        errs.civilites_id        = 'Obligatoire.';
    if (!form.pays_id)             errs.pays_id             = 'Obligatoire.';
    if (!form.nom?.trim())         errs.nom                 = 'Obligatoire.';
    if (!form.prenoms?.trim())     errs.prenoms             = 'Obligatoire.';
    if (!form.parcours_id)         errs.parcours_id         = 'Obligatoire.';
    if (!form.annee_academique_id) errs.annee_academique_id = 'Obligatoire.';
    if (!form.decisions_id)        errs.decisions_id        = 'Obligatoire.';
    if (!form.dateInscription)     errs.dateInscription     = 'Obligatoire.';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setSaveError(''); setSuccess(false);
    try {
      const etRes = await etudiantsService.create({
        civilites_id: form.civilites_id, pays_id: form.pays_id,
        nom: form.nom, prenoms: form.prenoms,
        dateNaissance: form.dateNaissance || null,
        email: form.email || null, telephone: form.telephone || null,
        photo: form.photo || null,
      });
      await inscriptionsService.create({
        etudiants_id:        etRes.data.id,
        parcours_id:         form.parcours_id,
        annee_academique_id: form.annee_academique_id,
        decisions_id:        form.decisions_id,
        dateInscription:     form.dateInscription,
      });
      setSuccess(true);
      const activeAnnee = form.annee_academique_id;
      setForm({ ...emptyForm, annee_academique_id: activeAnnee });
      setErrors({});
    } catch (err) {
      setSaveError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally { setSaving(false); }
  };

  /* ── Helpers de rendu de champs ── */
  const labelStyle  = { display: 'block', fontSize: '13px', fontWeight: 500, color: C.textPrimary, marginBottom: '6px' };
  const errStyle    = { fontSize: '12px', color: '#DC2626', marginTop: '4px' };

  const fieldStyle = (key) => ({
    ...inputBase,
    border: `1px solid ${errors[key] ? '#FECACA' : C.border}`,
    backgroundColor: errors[key] ? '#FEF2F2' : C.card,
  });

  const focusStyle = (e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; };
  const blurStyle  = (e, key) => { e.target.style.borderColor = errors[key] ? '#FECACA' : C.border; e.target.style.boxShadow = 'none'; };

  const Field = ({ label, fieldKey, type = 'text', placeholder = '', required = false }) => (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}</label>
      <input
        type={type}
        value={form[fieldKey] ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        style={fieldStyle(fieldKey)}
        onFocus={focusStyle}
        onBlur={(e) => blurStyle(e, fieldKey)}
      />
      {errors[fieldKey] && <p style={errStyle}>{errors[fieldKey]}</p>}
    </div>
  );

  const Sel = ({ label, fieldKey, options, labelFn, required = false }) => (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}</label>
      <select
        value={form[fieldKey] ?? ''}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        style={fieldStyle(fieldKey)}
        onFocus={focusStyle}
        onBlur={(e) => blurStyle(e, fieldKey)}
      >
        <option value="">Choisir…</option>
        {options.map((o) => <option key={o.id} value={o.id}>{labelFn(o)}</option>)}
      </select>
      {errors[fieldKey] && <p style={errStyle}>{errors[fieldKey]}</p>}
    </div>
  );

  /* ── Bloc de section ── */
  const Section = ({ num, title, children }) => (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ backgroundColor: C.tableHead, borderBottom: `1px solid ${C.border}` }}
      >
        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: C.accent }}
        >
          {num}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: C.textMuted }}
        >
          {title}
        </span>
      </div>
      <div className="p-5 space-y-4" style={{ backgroundColor: C.card }}>
        {children}
      </div>
    </div>
  );

  return (
    <div
      className="space-y-5 max-w-3xl"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
          >
            Nouvel étudiant
          </h1>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>
            Enregistrement d'un nouvel étudiant et de sa première inscription.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setForm(emptyForm); setErrors({}); setSuccess(false); setSaveError(''); }}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.textSecondary }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.card}
          >
            <RotateCcw className="w-4 h-4" /> Réinitialiser
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            style={{ backgroundColor: C.accent }}
            onMouseEnter={e => !saving && (e.currentTarget.style.backgroundColor = C.accentHover)}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.accent}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</>
              : <><UserPlus className="w-4 h-4" />Enregistrer l'étudiant</>
            }
          </button>
        </div>
      </div>

      {/* Alertes */}
      {success && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46' }}
        >
          <Check className="w-4 h-4 shrink-0" />
          Étudiant enregistré et inscrit avec succès !
        </div>
      )}
      {saveError && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />{saveError}
        </div>
      )}

      {/* Section 1 — Informations personnelles */}
      <Section num="1" title="Informations personnelles">
        {/* Photo */}
        <div
          className="flex justify-center py-4 rounded-xl"
          style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
        >
          <PhotoUpload
            value={form.photo}
            onChange={(v) => onChange('photo', v)}
            nom={form.nom}
            prenoms={form.prenoms}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Sel label="Civilité" fieldKey="civilites_id" options={civilites} labelFn={(o) => `${o.abreviation ?? ''} ${o.libelle}`} required />
          <Sel label="Pays d'origine" fieldKey="pays_id" options={pays} labelFn={(o) => o.libelle} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom" fieldKey="nom" placeholder="OUEDRAOGO" required />
          <Field label="Prénoms" fieldKey="prenoms" placeholder="Aminata" required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Date de naissance" fieldKey="dateNaissance" type="date" />
          <Field label="Email" fieldKey="email" type="email" placeholder="ex@email.com" />
          <Field label="Téléphone" fieldKey="telephone" placeholder="+226 70 00 00 00" />
        </div>
      </Section>

      {/* Section 2 — Inscription */}
      <Section num="2" title="Inscription">
        <div className="grid grid-cols-2 gap-4">
          <Sel
            label="Parcours" fieldKey="parcours_id"
            options={parcours}
            labelFn={(o) => `${o.libelle} — ${o.specialite_libelle ?? ''} ${o.niveau_libelle ?? ''}`}
            required
          />
          <Sel
            label="Année académique" fieldKey="annee_academique_id"
            options={annees}
            labelFn={(o) => `${o.libelle}${o.est_active ? ' ✓' : ''}`}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Sel label="Décision" fieldKey="decisions_id" options={decisions} labelFn={(o) => o.libelle} required />
          <Field label="Date d'inscription" fieldKey="dateInscription" type="date" required />
        </div>
      </Section>

      {/* Note */}
      <p className="text-xs px-1" style={{ color: C.textMuted }}>
        Les champs marqués <span style={{ color: '#DC2626', fontWeight: 600 }}>*</span> sont obligatoires.
      </p>
    </div>
  );
}