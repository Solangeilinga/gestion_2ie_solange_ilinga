// src/components/FormField.jsx
// Composant de champ de formulaire unifié — design system 2iE

const C = {
  border:      '#E4E7ED',
  card:        '#FFFFFF',
  textPrimary: '#1A1F2E',
  textMuted:   '#8896A5',
  accent:      '#4F46E5',
  accentLight: '#EEF2FF',
  errorBg:     '#FEF2F2',
  errorBorder: '#FECACA',
  errorText:   '#DC2626',
};

const baseInput = {
  fontFamily: "'DM Sans', sans-serif",
  color: C.textPrimary,
  fontSize: '14px',
};

export function FieldInput({ label, value, onChange, error, placeholder, type = 'text', required = false }) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: C.textPrimary }}
      >
        {label}{required && <span style={{ color: C.errorText, marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none"
        style={{
          ...baseInput,
          border: `1px solid ${error ? C.errorBorder : C.border}`,
          backgroundColor: error ? C.errorBg : C.card,
        }}
        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; }}
        onBlur={e =>  { e.target.style.borderColor = error ? C.errorBorder : C.border; e.target.style.boxShadow = 'none'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: C.errorText }}>{error}</p>}
    </div>
  );
}

export function FieldTextarea({ label, value, onChange, error, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: C.textPrimary }}>{label}</label>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none resize-none"
        style={{
          ...baseInput,
          border: `1px solid ${error ? C.errorBorder : C.border}`,
          backgroundColor: error ? C.errorBg : C.card,
        }}
        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; }}
        onBlur={e =>  { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: C.errorText }}>{error}</p>}
    </div>
  );
}

export function FieldSelect({ label, value, onChange, error, options, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: C.textPrimary }}>
        {label}{required && <span style={{ color: C.errorText, marginLeft: 2 }}>*</span>}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none"
        style={{
          ...baseInput,
          border: `1px solid ${error ? C.errorBorder : C.border}`,
          backgroundColor: error ? C.errorBg : C.card,
        }}
        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; }}
        onBlur={e =>  { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
      >
        <option value="">Choisir…</option>
        {options.map((o) => (
          <option key={o.value ?? o.id} value={o.value ?? o.id}>{o.label ?? o.libelle}</option>
        ))}
      </select>
      {error && <p className="text-xs mt-1" style={{ color: C.errorText }}>{error}</p>}
    </div>
  );
}

export function FieldToggle({ label, sublabel, value, onChange }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
        style={{
          backgroundColor: value ? '#4F46E5' : '#E4E7ED',
          boxShadow: value ? '0 0 0 2px #EEF2FF' : 'none',
        }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? 'translateX(24px)' : 'translateX(4px)' }}
        />
      </button>
      <label className="text-sm font-medium" style={{ color: '#1A1F2E' }}>
        {label}
        {sublabel && <span className="text-xs ml-1.5" style={{ color: '#8896A5' }}>{sublabel}</span>}
      </label>
    </div>
  );
}