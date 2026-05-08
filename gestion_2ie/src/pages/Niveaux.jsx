// src/pages/Niveaux.jsx
import TablePage from '../components/TablePage';
import { FieldInput } from '../components/FormField';
import { niveauxService } from '../api/services';

const columns = [
  { key: 'ordre',   label: 'Ordre'  },
  { key: 'libelle', label: 'Niveau' },
];

const emptyValues = { libelle: '', ordre: 1 };

function FormFields({ values, onChange, errors }) {
  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : Licence 1"
        required
      />
      <FieldInput
        label="Ordre"
        type="number"
        value={values.ordre}
        onChange={(v) => onChange('ordre', parseInt(v) || 1)}
        error={errors.ordre}
        required
      />
    </>
  );
}

export default function Niveaux() {
  return (
    <TablePage
      title="Niveaux"
      columns={columns}
      service={niveauxService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle']}
      exportFilename="niveaux"
      exportSheetName="Niveaux"
    />
  );
}