// src/pages/Cycles.jsx
import TablePage from '../components/TablePage';
import { FieldInput } from '../components/FormField';
import { cyclesService } from '../api/services';

const columns = [
  { key: 'libelle', label: 'Cycle' },
  {
    key: 'duree_annees',
    label: 'Durée',
    render: (row) => `${row.duree_annees} an${row.duree_annees > 1 ? 's' : ''}`,
  },
];

const emptyValues = { libelle: '', duree_annees: 3 };

function FormFields({ values, onChange, errors }) {
  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : Licence"
        required
      />
      <FieldInput
        label="Durée (années)"
        type="number"
        value={values.duree_annees}
        onChange={(v) => onChange('duree_annees', parseInt(v) || 1)}
        error={errors.duree_annees}
        required
      />
    </>
  );
}

export default function Cycles() {
  return (
    <TablePage
      title="Cycles"
      columns={columns}
      service={cyclesService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle']}
      exportFilename="cycles"
      exportSheetName="Cycles"
    />
  );
}