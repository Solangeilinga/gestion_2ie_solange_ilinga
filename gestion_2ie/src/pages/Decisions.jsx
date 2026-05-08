// src/pages/Decisions.jsx
import TablePage from '../components/TablePage';
import { FieldInput, FieldTextarea } from '../components/FormField';
import { decisionsService } from '../api/services';

const BADGE_STYLES = {
  'Admis':                { backgroundColor: '#ECFDF5', color: '#065F46' },
  'Admis sous condition': { backgroundColor: '#FFFBEB', color: '#92400E' },
  'Redoublant':           { backgroundColor: '#FFF7ED', color: '#9A3412' },
  'Refusé':               { backgroundColor: '#FEF2F2', color: '#991B1B' },
  'Inscrit':              { backgroundColor: '#EEF2FF', color: '#3730A3' },
  'Exclu':                { backgroundColor: '#F3F4F6', color: '#374151' },
  'Diplômé':              { backgroundColor: '#F5F3FF', color: '#5B21B6' },
};

const columns = [
  {
    key: 'libelle',
    label: 'Décision',
    render: (row) => (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={BADGE_STYLES[row.libelle] ?? { backgroundColor: '#F3F4F6', color: '#374151' }}
      >
        {row.libelle}
      </span>
    ),
  },
  { key: 'description', label: 'Description' },
];

const emptyValues = { libelle: '', description: '' };

function FormFields({ values, onChange, errors }) {
  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : Admis"
        required
      />
      <FieldTextarea
        label="Description"
        value={values.description}
        onChange={(v) => onChange('description', v)}
        placeholder="Décrivez cette décision…"
        rows={3}
      />
    </>
  );
}

export default function Decisions() {
  return (
    <TablePage
      title="Décisions"
      columns={columns}
      service={decisionsService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle', 'description']}
      exportFilename="decisions"
      exportSheetName="Décisions"
    />
  );
}