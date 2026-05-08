// src/pages/Civilites.jsx
import TablePage from '../components/TablePage';
import { FieldInput } from '../components/FormField';
import { civilitesService } from '../api/services';

const columns = [
  { key: 'libelle',     label: 'Civilité'    },
  { key: 'abreviation', label: 'Abréviation' },
];

const emptyValues = { libelle: '', abreviation: '' };

function FormFields({ values, onChange, errors }) {
  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : Monsieur"
        required
      />
      <FieldInput
        label="Abréviation"
        value={values.abreviation}
        onChange={(v) => onChange('abreviation', v)}
        error={errors.abreviation}
        placeholder="Ex : M."
      />
    </>
  );
}

export default function Civilites() {
  return (
    <TablePage
      title="Civilités"
      columns={columns}
      service={civilitesService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle', 'abreviation']}
      exportFilename="civilites"
      exportSheetName="Civilités"
    />
  );
}