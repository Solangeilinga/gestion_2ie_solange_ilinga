// src/pages/Filieres.jsx
import TablePage from '../components/TablePage';
import { FieldInput, FieldTextarea } from '../components/FormField';
import { filieresService } from '../api/services';

const columns = [
  { key: 'code',        label: 'Code'        },
  { key: 'libelle',     label: 'Filière'     },
  { key: 'description', label: 'Description' },
];

const emptyValues = { libelle: '', code: '', description: '' };

function FormFields({ values, onChange, errors }) {
  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : Informatique"
        required
      />
      <FieldInput
        label="Code"
        value={values.code}
        onChange={(v) => onChange('code', v)}
        error={errors.code}
        placeholder="Ex : INFO"
      />
      <FieldTextarea
        label="Description"
        value={values.description}
        onChange={(v) => onChange('description', v)}
        placeholder="Décrivez cette filière…"
        rows={3}
      />
    </>
  );
}

export default function Filieres() {
  return (
    <TablePage
      title="Filières"
      columns={columns}
      service={filieresService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle', 'code', 'description']}
      exportFilename="filieres"
      exportSheetName="Filières"
    />
  );
}