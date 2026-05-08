// src/components/TablePage.jsx
import { useState, useEffect } from 'react';
import { Plus, Pencil, X, Check, Loader2, AlertCircle, Search, FileDown } from 'lucide-react';
import { exportToExcel } from '../utils/exportExcel';

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
  rowAlt:       '#F7F8FA',
};

export default function TablePage({
  title,
  columns,
  service,
  FormFields,
  emptyValues   = {},
  searchKeys    = [],
  onSearch,
  filters       = [],
  onFilter,
  rowActions    = [],
  headerActions = [],
  onRowClick,
  hideAdd       = false,
  hideEdit      = false,
  modalSize     = 'md',
  emptyMessage  = 'Aucun enregistrement.',
  loadData,
  exportFilename,
  exportSheetName,
}) {
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterVals,  setFilterVals]  = useState(
    Object.fromEntries(filters.map((f) => [f.key, '']))
  );
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editRow,    setEditRow]    = useState(null);
  const [formValues, setFormValues] = useState(emptyValues);
  const [formErrors, setFormErrors] = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  const load = async (params = {}) => {
    setLoading(true); setError('');
    try {
      const data = loadData
        ? await loadData(params)
        : (await service.getAll(params)).data;
      setRows(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = onSearch ? rows : rows.filter((row) => {
    if (!search || !searchKeys.length) return true;
    return searchKeys.some((k) =>
      String(row[k] ?? '').toLowerCase().includes(search.toLowerCase())
    );
  });

  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try { setRows((await onSearch(searchInput)).data); }
      catch { } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = async (key, value) => {
    const next = { ...filterVals, [key]: value };
    setFilterVals(next);
    if (onFilter) {
      setLoading(true);
      try { setRows((await onFilter(next)).data); }
      catch (err) { setError(err.response?.data?.message || 'Erreur.'); }
      finally { setLoading(false); }
    }
  };

  const openCreate = () => {
    setEditRow(null); setFormValues(emptyValues);
    setFormErrors({}); setSaveError(''); setModalOpen(true);
  };
  const openEdit = (row, e) => {
    e?.stopPropagation();
    setEditRow(row); setFormValues({ ...emptyValues, ...row });
    setFormErrors({}); setSaveError(''); setModalOpen(true);
  };
  const handleChange = (field, value) => {
    setFormValues((p) => ({ ...p, [field]: value }));
    setFormErrors((p) => ({ ...p, [field]: '' }));
  };
  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      if (editRow) await service.update(editRow.id, formValues);
      else         await service.create(formValues);
      setModalOpen(false); await load();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally { setSaving(false); }
  };

  const modalWidths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  const hasActions  = rowActions.length > 0 || !hideEdit;
  const hasToolbar  = searchKeys.length > 0 || onSearch || filters.length > 0;

  return (
    <div className="space-y-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}
          >
            {title}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>
            {filtered.length} enregistrement{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {headerActions}
          {exportFilename && filtered.length > 0 && (
            <button
              onClick={() => exportToExcel(filtered, columns, exportFilename, exportSheetName ?? exportFilename)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: C.accentLight,
                border: `1px solid #C7D2FE`,
                color: C.accent,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.accent; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = C.accent; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.accentLight; e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = '#C7D2FE'; }}
            >
              <FileDown className="w-4 h-4" /> Exporter
            </button>
          )}
          {!hideAdd && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors text-white"
              style={{ backgroundColor: C.accent }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.accentHover}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = C.accent}
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Barre outils */}
      {hasToolbar && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-xl border"
          style={{ backgroundColor: C.card, borderColor: C.border }}
        >
          {(searchKeys.length > 0 || onSearch) && (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: C.textMuted }}
              />
              <input
                type="text"
                value={onSearch ? searchInput : search}
                onChange={(e) => onSearch ? setSearchInput(e.target.value) : setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="pl-9 pr-3 py-2 rounded-lg text-sm transition-all focus:outline-none w-48"
                style={{
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bg,
                  color: C.textPrimary,
                }}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`; }}
                onBlur={e =>  { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}
          {filters.map((f) => (
            <select
              key={f.key}
              value={filterVals[f.key]}
              onChange={(e) => handleFilterChange(f.key, e.target.value)}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
              style={{
                border: `1px solid ${C.border}`,
                backgroundColor: C.bg,
                color: C.textSecondary,
              }}
            >
              <option value="">{f.label}</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {filters.length > 0 && Object.values(filterVals).some(Boolean) && (
            <button
              onClick={() => {
                const reset = Object.fromEntries(filters.map((f) => [f.key, '']));
                setFilterVals(reset);
                if (onFilter) onFilter(reset).then((r) => setRows(r.data)).catch(() => {});
                else load();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: C.bg, color: C.textSecondary, border: `1px solid ${C.border}` }}
            >
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
          <span className="text-sm ml-auto" style={{ color: C.textMuted }}>
            {filtered.length} / {rows.length}
          </span>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
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
        {loading ? (
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
            {emptyMessage}
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: C.tableHead, borderBottom: `1px solid ${C.borderStrong}` }}>
                <th
                  className="px-3 py-3 text-center w-10"
                  style={{ color: C.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: `1px solid ${C.border}` }}
                >
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left whitespace-nowrap"
                    style={{ color: C.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: `1px solid ${C.border}` }}
                  >
                    {col.label}
                  </th>
                ))}
                {hasActions && (
                  <th
                    className="px-4 py-3 text-center whitespace-nowrap"
                    style={{ color: C.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className="transition-colors"
                  style={{
                    backgroundColor: i % 2 === 0 ? C.card : C.rowAlt,
                    borderBottom: `1px solid ${C.border}`,
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.accentLight}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? C.card : C.rowAlt}
                >
                  <td
                    className="px-3 py-3 text-center select-none"
                    style={{ color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', borderRight: `1px solid ${C.border}`, backgroundColor: C.tableHead }}
                  >
                    {i + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 max-w-[220px] truncate"
                      style={{ color: C.textPrimary, borderRight: `1px solid ${C.border}` }}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? '')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {rowActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors text-white ${action.className ?? ''}`}
                            style={!action.className ? { backgroundColor: C.accent } : {}}
                            title={action.title}
                          >
                            {action.icon && <action.icon className="w-3 h-3" />}
                            {action.label}
                          </button>
                        ))}
                        {!hideEdit && (
                          <button
                            onClick={(e) => openEdit(row, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ backgroundColor: C.accentLight, color: C.accent, border: `1px solid #C7D2FE` }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.accent; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.accentLight; e.currentTarget.style.color = C.accent; }}
                          >
                            <Pencil className="w-3 h-3" /> Modifier
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: C.tableHead, borderTop: `1px solid ${C.border}` }}>
                <td
                  colSpan={columns.length + (hasActions ? 2 : 1)}
                  className="px-4 py-2.5 text-sm"
                  style={{ color: C.textSecondary }}
                >
                  Total : <span style={{ fontWeight: 600, color: C.textPrimary }}>{filtered.length}</span> enregistrement{filtered.length !== 1 ? 's' : ''}
                  {search && ` · filtre : "${search}"`}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && FormFields && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className={`bg-white w-full ${modalWidths[modalSize] ?? modalWidths.md} rounded-2xl flex flex-col max-h-[90vh]`}
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: `1px solid ${C.border}` }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4 rounded-t-2xl shrink-0"
              style={{ backgroundColor: C.accent }}
            >
              <h2
                className="text-sm font-semibold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {editRow ? '✏️ Modifier' : '➕ Ajouter'} — {title}
              </h2>
              <button
                onClick={() => !saving && setModalOpen(false)}
                className="text-indigo-200 hover:text-white transition rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <FormFields values={formValues} onChange={handleChange} errors={formErrors} />
              {saveError && (
                <div
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />{saveError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-end gap-2 px-6 py-4 rounded-b-2xl shrink-0"
              style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}
            >
              <button
                onClick={() => !saving && setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.textSecondary }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition-colors text-white disabled:opacity-60"
                style={{ backgroundColor: C.accent }}
                onMouseEnter={e => !saving && (e.currentTarget.style.backgroundColor = C.accentHover)}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = C.accent}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Sauvegarde…</>
                  : <><Check className="w-4 h-4" />Enregistrer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}