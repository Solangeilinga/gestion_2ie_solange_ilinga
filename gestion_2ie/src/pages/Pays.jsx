// src/pages/Pays.jsx
import TablePage from '../components/TablePage';
import { FieldInput } from '../components/FormField';
import { paysService } from '../api/services';

const columns = [
  { key: 'libelle',     label: 'Pays'        },
  { key: 'code',        label: 'Code'        },
  { key: 'nationalite', label: 'Nationalité' },
  { key: 'iso',         label: 'ISO'         },
];

const emptyValues = { libelle: '', code: '', nationalite: '', iso: '' };

function FormFields({ values, onChange, errors }) {
  return (
    <>
      <FieldInput
        label="Libellé"
        value={values.libelle}
        onChange={(v) => onChange('libelle', v)}
        error={errors.libelle}
        placeholder="Ex : Burkina Faso"
        required
      />
      <FieldInput
        label="Code"
        value={values.code}
        onChange={(v) => onChange('code', v)}
        error={errors.code}
        placeholder="Ex : BFA"
      />
      <FieldInput
        label="Nationalité"
        value={values.nationalite}
        onChange={(v) => onChange('nationalite', v)}
        error={errors.nationalite}
        placeholder="Ex : Burkinabè"
      />
      <FieldInput
        label="ISO"
        value={values.iso}
        onChange={(v) => onChange('iso', v)}
        error={errors.iso}
        placeholder="Ex : BF"
      />
    </>
  );
}

export default function Pays() {
  return (
    <TablePage
      title="Pays"
      columns={columns}
      service={paysService}
      FormFields={FormFields}
      emptyValues={emptyValues}
      searchKeys={['libelle', 'code', 'nationalite']}
      exportFilename="pays"
      exportSheetName="Pays"
    />
  );
}